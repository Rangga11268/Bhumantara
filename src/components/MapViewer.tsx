import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AOIRegion, RawHotspot, HarmonizedWeekData } from '../engine/harmonizer';
import { Layers, Maximize2, Satellite, Filter, Eye } from 'lucide-react';
import { Language, translations } from '../data/translations';
import { FullMapModal } from './FullMapModal';
import { resolveHotspotLocation, toDMS, getIndonesianLocalTime } from '../utils/locationResolver';

interface MapViewerProps {
  language: Language;
  selectedAOI: AOIRegion;
  onSelectAOI?: (aoi: AOIRegion) => void;
  hotspots: RawHotspot[];
  selectedWeekData: HarmonizedWeekData | null;
  rawMode: boolean;
  isLiveSync?: boolean;
  isLoading?: boolean;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  language,
  selectedAOI,
  onSelectAOI,
  hotspots,
  selectedWeekData,
  rawMode,
  isLiveSync = false,
  isLoading = false,
}) => {
  const t = translations[language];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Clean FIRMS-Grade Controls (Integrated in Toolbar)
  const [basemap, setBasemap] = useState<'dark' | 'satellite' | 'nasa_gibs'>('satellite');
  const [timeSpan, setTimeSpan] = useState<'today' | '24hrs' | '7days' | 'all'>('24hrs');
  const [showModis, setShowModis] = useState<boolean>(true);
  const [showViirs, setShowViirs] = useState<boolean>(true);
  const [frpThreshold, setFrpThreshold] = useState<number>(0);
  const [isFullMapOpen, setIsFullMapOpen] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Init map with high-performance Canvas Renderer
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const INDONESIA_BOUNDS: L.LatLngBoundsExpression = [
      [-11.5, 94.0],
      [6.5, 141.5],
    ];

    const canvas = L.canvas({ padding: 0.5 });
    canvasRendererRef.current = canvas;

    const map = L.map(mapContainerRef.current, {
      center: selectedAOI.center,
      zoom: selectedAOI.zoom,
      minZoom: 4,
      maxZoom: 18,
      maxBounds: INDONESIA_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      renderer: canvas,
    });

    tileLayerRef.current = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18 }
    ).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    layerGroupRef.current = L.layerGroup().addTo(map);

    map.on('mousemove', (e) => {
      setCursorCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.on('mouseout', () => {
      setCursorCoords(null);
    });

    mapInstanceRef.current = map;
  }, []);

  // Basemap switcher
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);

    if (basemap === 'nasa_gibs') {
      tileLayerRef.current = L.tileLayer(
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-08-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
        { maxZoom: 9, minZoom: 4 }
      ).addTo(map);
    } else if (basemap === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      ).addTo(map);
    }
  }, [basemap]);

  // Fly to new AOI
  useEffect(() => {
    mapInstanceRef.current?.setView(selectedAOI.center, selectedAOI.zoom, { animate: true });
  }, [selectedAOI]);

  // Filtered hotspots based on timeSpan, sensors, and FRP threshold
  const displayHotspots = useMemo(() => {
    let display = hotspots.filter((h) => h.aoiId === selectedAOI.id);

    if (isLiveSync) {
      display = display.filter((h) => h.confidence >= 70);
    }

    if (selectedWeekData && !isLiveSync && timeSpan === 'all') {
      display = display.filter((h) => new Date(h.date).getUTCFullYear() === selectedWeekData.year);
    } else if (timeSpan === 'today' || timeSpan === '24hrs') {
      const targetYear = selectedWeekData ? selectedWeekData.year : 2023;
      display = display.filter((h) => {
        const d = new Date(h.date);
        return d.getUTCFullYear() === targetYear && d.getUTCMonth() >= 7 && d.getUTCMonth() <= 9;
      });
    } else if (timeSpan === '7days') {
      const targetYear = selectedWeekData ? selectedWeekData.year : 2023;
      display = display.filter((h) => {
        const d = new Date(h.date);
        return d.getUTCFullYear() === targetYear && d.getUTCMonth() >= 6 && d.getUTCMonth() <= 10;
      });
    }

    // Filter by Sensor Toggle
    if (!showModis && !showViirs) {
      return [];
    } else if (showModis && !showViirs) {
      display = display.filter((h) => h.instrument === 'MODIS');
    } else if (!showModis && showViirs) {
      display = display.filter((h) => h.instrument === 'VIIRS');
    }

    // Filter by FRP threshold
    if (frpThreshold > 0) {
      display = display.filter((h) => h.frp >= frpThreshold);
    }

    return display;
  }, [hotspots, selectedAOI, isLiveSync, selectedWeekData, timeSpan, showModis, showViirs, frpThreshold]);

  // Render clean FIRMS-authentic small pixel points onto Canvas
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    const canvas = canvasRendererRef.current;
    if (!map || !layerGroup || !canvas) return;

    layerGroup.clearLayers();

    const [minLat, minLon, maxLat, maxLon] = selectedAOI.bbox;

    // AOI boundary frame
    if (selectedAOI.id !== 'indonesia') {
      L.rectangle([[minLat, minLon], [maxLat, maxLon]], {
        color: '#0284c7',
        weight: 1.5,
        dashArray: '5 5',
        fillColor: '#0284c7',
        fillOpacity: 0.02,
        renderer: canvas,
      }).addTo(layerGroup);
    }

    displayHotspots.forEach((spot) => {
      const isVIIRS = spot.instrument === 'VIIRS';
      
      // NASA FIRMS true pixel scale: crisp solid points without bulky rings
      const radius = isVIIRS ? 2.5 : 4.0;
      const color = isVIIRS ? '#ff1e1e' : '#dc2626';

      const intensity =
        spot.frp < 15 ? (language === 'id' ? 'Rendah' : 'Low')
        : spot.frp < 50 ? (language === 'id' ? 'Sedang' : 'Moderate')
        : spot.frp < 150 ? (language === 'id' ? 'Tinggi' : 'High')
        : (language === 'id' ? 'Sangat Tinggi' : 'Extreme');

      const intensityColor =
        spot.frp < 15 ? '#10b981'
        : spot.frp < 50 ? '#f59e0b'
        : spot.frp < 150 ? '#f97316'
        : '#dc2626';

      const loc = resolveHotspotLocation(spot.lat, spot.lon, selectedAOI.id, language);
      const localTime = getIndonesianLocalTime(spot.date, spot.time, spot.lon);
      const tempCelsius = (spot.brightness - 273.15).toFixed(1);
      const biomassRateKgPerSec = (spot.frp * 0.368).toFixed(2);

      const popupHtml = `
        <div class="hotspot-popup">
          
          <!-- Header: Status & Instrument -->
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid;padding-bottom:6px;margin-bottom:8px;" class="hotspot-popup-divider">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
              <strong class="hotspot-popup-title">${spot.instrument} (${spot.satellite})</strong>
            </div>
            <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${intensityColor}20;color:${intensityColor};border:1px solid ${intensityColor}40;">
              ${intensity.toUpperCase()} &bull; ${spot.frp} MW
            </span>
          </div>

          <!-- Administrative Region & Peat Landscape -->
          <div class="hotspot-popup-card">
            <div class="hotspot-popup-regency">
              ${loc.regency}
            </div>
            ${loc.district ? `<div class="hotspot-popup-text-subtle" style="font-size:11px;margin-top:2px;"><b>${language === 'id' ? 'Kecamatan' : 'District'}:</b> ${loc.district}</div>` : ''}
            <div class="hotspot-popup-landscape">
              ${loc.landscape}
            </div>
            ${loc.isPeatland ? `<div class="hotspot-popup-peat"><b>${language === 'id' ? 'Kedalaman Gambut' : 'Peat Depth'}:</b> ${loc.peatDepthEstimate}</div>` : ''}
          </div>

          <!-- Precise Coordinates & Local Time -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:8px;">
            <div class="hotspot-popup-grid-cell">
              <span class="hotspot-popup-cell-label">${language === 'id' ? 'Koordinat Presisi' : 'Coordinates'}</span>
              <strong class="hotspot-popup-cell-val">
                ${spot.lat.toFixed(5)}&deg;, ${spot.lon.toFixed(5)}&deg;
              </strong>
              <span class="hotspot-popup-cell-sub">
                ${loc.coordinatesDMS}
              </span>
            </div>

            <div class="hotspot-popup-grid-cell">
              <span class="hotspot-popup-cell-label">${language === 'id' ? 'Waktu Lintas Orbit' : 'Orbit Overpass'}</span>
              <strong class="hotspot-popup-cell-val">
                ${localTime.timeFormatted}
              </strong>
              <span class="hotspot-popup-cell-sub">
                ${spot.date} (${spot.time.slice(0,2)}:${spot.time.slice(2)} UTC)
              </span>
            </div>
          </div>

          <!-- Telemetry & Sensor Stats -->
          <div class="hotspot-popup-stats">
            <span><b>${language === 'id' ? 'Suhu Termal' : 'Thermal Temp'}:</b> ${tempCelsius}&deg;C (${spot.brightness} K)</span>
            <span><b>${language === 'id' ? 'Laju Biomassa' : 'Biomass Rate'}:</b> ~${biomassRateKgPerSec} kg/s</span>
            <span><b>${language === 'id' ? 'Tingkat Keyakinan' : 'Confidence'}:</b> ${spot.confidence}%</span>
          </div>

          <!-- Direct Navigation Link -->
          <div class="hotspot-popup-footer">
            <a href="${loc.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="hotspot-popup-link">
              ${language === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}
            </a>
            <span class="hotspot-popup-source">NASA FIRMS Telemetry</span>
          </div>

        </div>
      `;

      const circle = L.circleMarker([spot.lat, spot.lon], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 0.4,
        opacity: 0.9,
        fillOpacity: 0.92,
        renderer: canvas,
      });

      circle.bindPopup(popupHtml, { maxWidth: 320 });
      circle.addTo(layerGroup);
    });
  }, [selectedAOI, displayHotspots, rawMode, language]);

  const modisCount = displayHotspots.filter((h) => h.instrument === 'MODIS').length;
  const viirsCount = displayHotspots.filter((h) => h.instrument === 'VIIRS').length;
  const maxFrp = displayHotspots.reduce((max, h) => (h.frp > max ? h.frp : max), 0);

  return (
    <div className="relative z-0 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col [isolation:isolate] transition-colors">
      
      {/* Clean Top Toolbar with Integrated NASA FIRMS Controls (No Obtrusive Floating Boxes) */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0c121e]">
        
        {/* Left: AOI Name & Live Point Counter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedAOI.name}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">({selectedAOI.biome})</span>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>{displayHotspots.length.toLocaleString()} {language === 'id' ? 'titik api aktif' : 'active fire points'}</span>
          </span>
        </div>

        {/* Center/Right: Integrated Filters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          
          {/* Time Span Tabs (24h / 7d / All) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 font-medium border border-slate-200 dark:border-slate-800">
            {[
              { id: '24hrs', label: '24h' },
              { id: '7days', label: '7d' },
              { id: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeSpan(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  timeSpan === tab.id
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sensor Filter Toggles (VIIRS / MODIS) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowViirs(!showViirs)}
              className={`px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer text-[11px] ${
                showViirs
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              <span>VIIRS (375m)</span>
            </button>

            <button
              onClick={() => setShowModis(!showModis)}
              className={`px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer text-[11px] ${
                showModis
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              <span>MODIS (1km)</span>
            </button>
          </div>

          {/* FRP Intensity Filter */}
          <select
            value={frpThreshold}
            onChange={(e) => setFrpThreshold(Number(e.target.value))}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
          >
            <option value={0}>All FRP</option>
            <option value={25}>&ge; 25 MW</option>
            <option value={50}>&ge; 50 MW</option>
            <option value={100}>&ge; 100 MW (Severe)</option>
          </select>

          {/* Basemap switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 font-medium border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setBasemap('dark')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                basemap === 'dark'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.darkMap}
            </button>
            <button
              onClick={() => setBasemap('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                basemap === 'satellite'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sat HD
            </button>
            <button
              onClick={() => setBasemap('nasa_gibs')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                basemap === 'nasa_gibs'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200'
              }`}
              title="NASA Global Imagery Browse Services (MODIS Corrected Reflectance True Color)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-300 inline-block" />
              <span>NASA GIBS</span>
            </button>
          </div>

          {/* Full Screen Map Explorer Button */}
          <button
            onClick={() => setIsFullMapOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl font-medium transition-all shadow-xs shrink-0 cursor-pointer"
            title={language === 'id' ? 'Buka Peta Penuh' : 'Open Full Screen Map'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'id' ? 'Peta Penuh' : 'Full Map'}</span>
          </button>
        </div>
      </div>

      {/* Clean Unobstructed Map Viewport */}
      <div className="relative z-0 [isolation:isolate]">
        <div ref={mapContainerRef} className="w-full h-[540px] lg:h-[620px] z-0" />

        {/* Minimal Floating Telemetry Status (Bottom Left inside Map) */}
        <div className="absolute bottom-3 left-3 z-[1000] pointer-events-auto bg-slate-900/85 text-white backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 text-[11px] flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold uppercase tracking-wider text-[10px]">
            <Satellite className="w-3 h-3" />
            <span>NASA FIRMS NRT</span>
          </div>
          <span className="text-slate-300 font-mono text-[10px] border-l border-slate-700 pl-2">
            MODIS: <b className="text-red-400">{modisCount}</b> &bull; VIIRS: <b className="text-amber-400">{viirsCount}</b> &bull; Peak: <b className="text-emerald-400">{maxFrp} MW</b>
          </span>
          {cursorCoords && (
            <span className="hidden sm:inline text-slate-400 font-mono text-[10px] border-l border-slate-700 pl-2">
              {cursorCoords.lat.toFixed(3)}°, {cursorCoords.lng.toFixed(3)}°
            </span>
          )}
        </div>
      </div>

      {/* Map footer */}
      <div className="px-5 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          {language === 'id'
            ? 'Titik api solid merah merepresentasikan deteksi aktif sensor NASA MODIS (1km) dan VIIRS (375m) tanpa distorsi visual.'
            : 'Solid red hotspot points represent active detections from NASA MODIS (1km) and VIIRS (375m) sensors without visual clutter.'}
        </span>
        {isLiveSync && (
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            NASA FIRMS NRT Active
          </span>
        )}
      </div>

      {/* Full-Screen Immersive Map Explorer Modal */}
      <FullMapModal
        language={language}
        isOpen={isFullMapOpen}
        onClose={() => setIsFullMapOpen(false)}
        selectedAOI={selectedAOI}
        onSelectAOI={(aoi) => {
          if (onSelectAOI) onSelectAOI(aoi);
        }}
        hotspots={hotspots}
        isLiveSync={isLiveSync}
      />
    </div>
  );
};
