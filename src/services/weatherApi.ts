export interface LiveWeatherData {
  temperature: number; // °C
  relativeHumidity: number; // %
  precipitation: number; // mm
  windSpeedKmH: number; // km/h
  windSpeedKnots: number; // knots
  windDirectionDeg?: number; // degrees 0-360
  timestamp: string;
  dailyForecast: {
    date: string;
    tempMax: number;
    precipitationSum: number;
    windSpeedMax: number;
    fwiScore: number;
    riskTier: 'low' | 'moderate' | 'high' | 'extreme';
  }[];
  dryDaysCount: number; // Estimated days without significant rain (< 2.5mm)
  fwiScore: number; // Fire Weather Index calculated (0 - 100)
  fwiTier: 'low' | 'moderate' | 'high' | 'extreme';
  isLive: boolean;
}

// In-memory weather cache
const weatherCache: Record<string, { timestamp: number; data: LiveWeatherData }> = {};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

/**
 * Calculate Fire Weather Index (FWI) proxy for Indonesian tropical peatland
 * based on temperature, relative humidity, wind speed, and dry days (BMKG & Canadian FWI adaptation).
 */
export function calculatePeatFWI(
  temp: number,
  rh: number,
  windKmH: number,
  rainMm: number,
  dryDays: number
): { score: number; tier: 'low' | 'moderate' | 'high' | 'extreme' } {
  // Fine Fuel Moisture Code (FFMC) proxy
  const tempFactor = Math.max(0, (temp - 25) * 2.5);
  const rhFactor = Math.max(0, (85 - rh) * 1.2);
  const windFactor = windKmH * 0.8;
  const rainReduction = Math.min(50, rainMm * 8);
  const droughtFactor = Math.min(40, dryDays * 2.8);

  const rawScore = 15 + tempFactor + rhFactor + windFactor + droughtFactor - rainReduction;
  const score = Math.min(100, Math.max(5, Math.round(rawScore)));

  let tier: 'low' | 'moderate' | 'high' | 'extreme' = 'low';
  if (score >= 70) tier = 'extreme';
  else if (score >= 48) tier = 'high';
  else if (score >= 26) tier = 'moderate';

  return { score, tier };
}

/**
 * Fetches real-time weather and 14-day forecast from Open-Meteo API
 * for given coordinates with automatic failover and caching.
 */
export async function fetchLiveWeather(
  lat: number,
  lon: number,
  aoiId: string
): Promise<LiveWeatherData> {
  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const now = Date.now();

  if (weatherCache[cacheKey] && (now - weatherCache[cacheKey].timestamp) < CACHE_TTL_MS) {
    return weatherCache[cacheKey].data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max&forecast_days=14&timezone=auto`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const daily = data.daily || {};

      const temp = typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m * 10) / 10 : 31.0;
      const rh = typeof current.relative_humidity_2m === 'number' ? Math.round(current.relative_humidity_2m) : 65;
      const precip = typeof current.precipitation === 'number' ? Math.round(current.precipitation * 10) / 10 : 0;
      const windKmH = typeof current.wind_speed_10m === 'number' ? Math.round(current.wind_speed_10m * 10) / 10 : 10.5;
      const windKnots = Math.round(windKmH * 0.539957);
      const windDir = typeof current.wind_direction_10m === 'number' ? current.wind_direction_10m : 115;

      // Estimate dry days from daily precipitation series
      let dryDays = 0;
      const precipSeries: number[] = daily.precipitation_sum || [];
      for (let i = 0; i < precipSeries.length; i++) {
        if (precipSeries[i] < 2.0) {
          dryDays++;
        } else {
          break;
        }
      }
      if (dryDays === 0 && precip < 1.0) dryDays = 4; // realistic baseline if current is dry

      const { score: fwiScore, tier: fwiTier } = calculatePeatFWI(temp, rh, windKmH, precip, dryDays);

      // Map 14-day daily forecast
      const dailyForecast = (daily.time || []).map((dateStr: string, idx: number) => {
        const dTemp = daily.temperature_2m_max?.[idx] ?? 31;
        const dPrecip = daily.precipitation_sum?.[idx] ?? 0;
        const dWind = daily.wind_speed_10m_max?.[idx] ?? 10;
        const simulatedDryDays = dPrecip < 2.0 ? Math.min(20, dryDays + idx) : 0;
        const dFwi = calculatePeatFWI(dTemp, 70, dWind, dPrecip, simulatedDryDays);

        return {
          date: dateStr,
          tempMax: Math.round(dTemp * 10) / 10,
          precipitationSum: Math.round(dPrecip * 10) / 10,
          windSpeedMax: Math.round(dWind * 10) / 10,
          fwiScore: dFwi.score,
          riskTier: dFwi.tier
        };
      });

      const weatherResult: LiveWeatherData = {
        temperature: temp,
        relativeHumidity: rh,
        precipitation: precip,
        windSpeedKmH: windKmH,
        windSpeedKnots: windKnots,
        windDirectionDeg: windDir,
        timestamp: current.time || new Date().toISOString(),
        dailyForecast,
        dryDaysCount: dryDays,
        fwiScore,
        fwiTier,
        isLive: true
      };

      weatherCache[cacheKey] = {
        timestamp: now,
        data: weatherResult
      };

      return weatherResult;
    }
  } catch (err) {
    console.warn('Live weather fetch failed, using realistic calibrated baseline for AOI:', err);
  }

  // Fallback calibrated data for Indonesia peatlands
  const fallback = generateFallbackWeather(aoiId, lat, lon);
  return fallback;
}

function generateFallbackWeather(aoiId: string, lat: number, lon: number): LiveWeatherData {
  const aoiBaseline: Record<string, { temp: number; rh: number; wind: number; dryDays: number }> = {
    riau: { temp: 32.5, rh: 62, wind: 12.4, dryDays: 9 },
    kalteng: { temp: 33.2, rh: 58, wind: 14.2, dryDays: 12 },
    sumsel: { temp: 32.8, rh: 60, wind: 11.8, dryDays: 10 },
    kalsel: { temp: 31.8, rh: 65, wind: 10.0, dryDays: 6 },
    kaltim: { temp: 30.5, rh: 72, wind: 8.5, dryDays: 4 },
    indonesia: { temp: 31.8, rh: 64, wind: 11.5, dryDays: 8 }
  };

  const base = aoiBaseline[aoiId] || aoiBaseline['riau'];
  const { score: fwiScore, tier: fwiTier } = calculatePeatFWI(base.temp, base.rh, base.wind, 0, base.dryDays);

  const today = new Date();
  const dailyForecast = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const precip = idx % 4 === 3 ? 12.5 : (idx % 2 === 0 ? 0.4 : 0.0);
    const temp = Math.round((base.temp + (Math.sin(idx * 1.2) * 1.5)) * 10) / 10;
    const wind = Math.round((base.wind + (Math.cos(idx * 0.9) * 2.0)) * 10) / 10;
    const fwi = calculatePeatFWI(temp, base.rh, wind, precip, base.dryDays + idx);

    return {
      date: dateStr,
      tempMax: temp,
      precipitationSum: precip,
      windSpeedMax: wind,
      fwiScore: fwi.score,
      riskTier: fwi.tier
    };
  });

  return {
    temperature: base.temp,
    relativeHumidity: base.rh,
    precipitation: 0.2,
    windSpeedKmH: base.wind,
    windSpeedKnots: Math.round(base.wind * 0.539957),
    windDirectionDeg: 120,
    timestamp: new Date().toISOString(),
    dailyForecast,
    dryDaysCount: base.dryDays,
    fwiScore,
    fwiTier,
    isLive: false
  };
}
