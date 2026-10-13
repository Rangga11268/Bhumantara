/**
 * NASA Earth Observation & GFED4s Peatland Carbon Emission Model
 * 
 * Peer-Reviewed Foundations:
 * 1. Wooster, M. J. et al. (2005): Retrieval of biomass combustion rates and total fuel consumption
 *    from active fire Fire Radiative Power (FRP): Ce = 0.368 kg/MJ.
 * 2. Akagi, S. K. et al. (2011) & GFED4s (van der Werf et al., 2017):
 *    Emission factors for tropical peat fires (g/kg dry matter):
 *    - CO2: 1703 g/kg
 *    - CO: 210 g/kg
 *    - CH4: 9.4 g/kg (elevated due to anaerobic smoldering combustion)
 *    - PM2.5: 9.1 g/kg (fine respiratory particulate matter)
 * 3. EPA Greenhouse Gas Equivalencies: 1 passenger vehicle emits ~4.6 metric tons CO2/year.
 */

export interface PeatEmissionEstimate {
  freMegaJoules: number;
  biomassBurnedKg: number;
  biomassBurnedTons: number;
  co2EmissionsTons: number;
  ch4EmissionsTons: number;
  coEmissionsTons: number;
  pm25EmissionsKg: number;
  passengerCarAnnualEquivalent: number;
  smokeHazardLevel: 'LOW' | 'MODERATE' | 'UNHEALTHY' | 'HAZARDOUS';
  smokeRadiusKm: number;
}

/**
 * Calculates peat carbon and aerosol emissions from Fire Radiative Power (FRP in Megawatts).
 * @param totalFrpSum Sum of Fire Radiative Power (MW) across detected clusters
 * @param burnDurationHours Estimated active smoldering/flaming duration per diurnal cycle (default 8h)
 */
export function calculatePeatCarbonEmissions(
  totalFrpSum: number,
  burnDurationHours: number = 8
): PeatEmissionEstimate {
  // If FRP is 0 or negative
  if (!totalFrpSum || totalFrpSum <= 0) {
    return {
      freMegaJoules: 0,
      biomassBurnedKg: 0,
      biomassBurnedTons: 0,
      co2EmissionsTons: 0,
      ch4EmissionsTons: 0,
      coEmissionsTons: 0,
      pm25EmissionsKg: 0,
      passengerCarAnnualEquivalent: 0,
      smokeHazardLevel: 'LOW',
      smokeRadiusKm: 0,
    };
  }

  // 1. Fire Radiative Energy (FRE) = FRP (MW) * seconds
  // 1 MW * 3600 seconds = 3600 MegaJoules (MJ)
  const freMegaJoules = totalFrpSum * burnDurationHours * 3600;

  // 2. Total Fuel Consumption / Biomass Burned (Wooster et al., Ce = 0.368 kg/MJ)
  const biomassBurnedKg = freMegaJoules * 0.368;
  const biomassBurnedTons = biomassBurnedKg / 1000;

  // 3. Greenhouse Gas & Aerosol Emissions (GFED4s / Akagi et al.)
  // CO2: 1703 g/kg -> 1.703 kg CO2 per kg biomass
  const co2EmissionsTons = (biomassBurnedKg * 1.703) / 1000;

  // CH4: 9.4 g/kg -> 0.0094 kg CH4 per kg biomass
  const ch4EmissionsTons = (biomassBurnedKg * 0.0094) / 1000;

  // CO: 210 g/kg -> 0.210 kg CO per kg biomass
  const coEmissionsTons = (biomassBurnedKg * 0.210) / 1000;

  // PM2.5 (Fine Particulates): 9.1 g/kg dry biomass
  const pm25EmissionsKg = (biomassBurnedKg * 9.1) / 1000;

  // 4. Equivalencies & Hazard Thresholds
  // EPA: 4.6 tons CO2/year per passenger vehicle
  const passengerCarAnnualEquivalent = Math.round(co2EmissionsTons / 4.6);

  // Smoke plume hazard classification based on estimated PM2.5 mass
  let smokeHazardLevel: 'LOW' | 'MODERATE' | 'UNHEALTHY' | 'HAZARDOUS' = 'LOW';
  let smokeRadiusKm = 5;

  if (pm25EmissionsKg > 100000 || totalFrpSum > 2000) {
    smokeHazardLevel = 'HAZARDOUS';
    smokeRadiusKm = 120; // Regional transboundary haze potential (Riau to Malacca / Singapore)
  } else if (pm25EmissionsKg > 25000 || totalFrpSum > 800) {
    smokeHazardLevel = 'UNHEALTHY';
    smokeRadiusKm = 65;
  } else if (pm25EmissionsKg > 5000 || totalFrpSum > 200) {
    smokeHazardLevel = 'MODERATE';
    smokeRadiusKm = 25;
  }

  return {
    freMegaJoules: Math.round(freMegaJoules),
    biomassBurnedKg: Math.round(biomassBurnedKg),
    biomassBurnedTons: Math.round(biomassBurnedTons),
    co2EmissionsTons: Math.round(co2EmissionsTons),
    ch4EmissionsTons: Number(ch4EmissionsTons.toFixed(1)),
    coEmissionsTons: Math.round(coEmissionsTons),
    pm25EmissionsKg: Math.round(pm25EmissionsKg),
    passengerCarAnnualEquivalent,
    smokeHazardLevel,
    smokeRadiusKm,
  };
}
