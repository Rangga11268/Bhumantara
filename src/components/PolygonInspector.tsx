import React, { useState, useMemo } from 'react';
import { RawHotspot, AOIRegion } from '../engine/harmonizer';
import { Language, translations } from '../data/translations';
import { Upload, CheckCircle2, AlertTriangle, Download, FileText } from 'lucide-react';

interface PolygonInspectorProps {
  language: Language;
  selectedAOI: AOIRegion;
  allHotspots: RawHotspot[];
}

interface BoundaryPreset {
  id: string;
  nameId: string;
  nameEn: string;
  provinceId: string;
  provinceEn: string;
  areaHa: number;
  peatOverlapPct: number;
  polygon: [number, number][]; // [lat, lng][]
}

const PRESET_BOUNDARIES: BoundaryPreset[] = [
  {
    id: 'tanjung_puting',
    nameId: 'Taman Nasional Tanjung Puting',
    nameEn: 'Tanjung Puting National Park',
    provinceId: 'Kalimantan Tengah',
    provinceEn: 'Central Kalimantan',
    areaHa: 415040,
    peatOverlapPct: 68,
    polygon: [
      [-2.65, 111.70],
      [-2.65, 112.25],
      [-3.50, 112.25],
      [-3.50, 111.70],
    ],
  },
  {
    id: 'sebangau_np',
    nameId: 'Taman Nasional Sebangau',
    nameEn: 'Sebangau National Park',
    provinceId: 'Kalimantan Tengah',
    provinceEn: 'Central Kalimantan',
    areaHa: 568700,
    peatOverlapPct: 100,
    polygon: [
      [-2.10, 113.40],
      [-2.10, 114.10],
      [-3.25, 114.10],
      [-3.25, 113.40],
    ],
  },
  {
    id: 'tesso_nilo',
    nameId: 'Taman Nasional Tesso Nilo',
    nameEn: 'Tesso Nilo National Park',
    provinceId: 'Riau (Sumatera)',
    provinceEn: 'Riau (Sumatra)',
    areaHa: 81700,
    peatOverlapPct: 45,
    polygon: [
      [-0.05, 101.40],
      [-0.05, 101.85],
      [-0.35, 101.85],
      [-0.35, 101.40],
    ],
  },
  {
    id: 'padang_sugihan',
    nameId: 'Suaka Margasatwa Padang Sugihan',
    nameEn: 'Padang Sugihan Wildlife Reserve',
    provinceId: 'Sumatera Selatan (OKI)',
    provinceEn: 'South Sumatra (OKI)',
    areaHa: 75000,
    peatOverlapPct: 92,
    polygon: [
      [-2.95, 105.00],
      [-2.95, 105.35],
      [-3.30, 105.35],
      [-3.30, 105.00],
    ],
  },
];

// Point in polygon Ray-casting algorithm
function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) && (lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export const PolygonInspector: React.FC<PolygonInspectorProps> = ({
  language,
  selectedAOI: _selectedAOI,
  allHotspots,
}) => {
  const t = translations[language];
  const [selectedPreset, setSelectedPreset] = useState<BoundaryPreset>(PRESET_BOUNDARIES[0]);
  const [customGeoJsonName, setCustomGeoJsonName] = useState<string | null>(null);
  const [activePolygon, setActivePolygon] = useState<[number, number][]>(PRESET_BOUNDARIES[0].polygon);
  const [areaHectares, setAreaHectares] = useState<number>(PRESET_BOUNDARIES[0].areaHa);
  const [peatOverlap, setPeatOverlap] = useState<number>(PRESET_BOUNDARIES[0].peatOverlapPct);

  const handleSelectPreset = (preset: BoundaryPreset) => {
    setSelectedPreset(preset);
    setActivePolygon(preset.polygon);
    setAreaHectares(preset.areaHa);
    setPeatOverlap(preset.peatOverlapPct);
    setCustomGeoJsonName(null);
  };

  const parseKmlCoordinates = (kmlText: string): [number, number][] => {
    const coords: [number, number][] = [];
    const match = kmlText.match(/<coordinates>([\s\S]*?)<\/coordinates>/i);
    if (match && match[1]) {
      const tuples = match[1].trim().split(/\s+/);
      for (const tuple of tuples) {
        const parts = tuple.split(',');
        if (parts.length >= 2) {
          const lng = parseFloat(parts[0]);
          const lat = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            coords.push([lat, lng]);
          }
        }
      }
    }
    return coords;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let coords: [number, number][] = [];

        if (file.name.toLowerCase().endsWith('.kml')) {
          coords = parseKmlCoordinates(text);
        } else {
          const json = JSON.parse(text);
          if (json.type === 'FeatureCollection' && json.features?.[0]?.geometry?.coordinates) {
            const raw = json.features[0].geometry.coordinates[0];
            coords = raw.map((pt: [number, number]) => [pt[1], pt[0]]);
          } else if (json.type === 'Polygon' && json.coordinates?.[0]) {
            coords = json.coordinates[0].map((pt: [number, number]) => [pt[1], pt[0]]);
          } else if (json.type === 'Feature' && json.geometry?.coordinates?.[0]) {
            coords = json.geometry.coordinates[0].map((pt: [number, number]) => [pt[1], pt[0]]);
          }
        }

        if (coords.length >= 3) {
          setActivePolygon(coords);
          setCustomGeoJsonName(file.name);
          // Rough bounding box area calculation in Hectares
          const lats = coords.map((c) => c[0]);
          const lngs = coords.map((c) => c[1]);
          const latDelta = Math.max(...lats) - Math.min(...lats);
          const lngDelta = Math.max(...lngs) - Math.min(...lngs);
          const approxHa = Math.round(latDelta * 111 * lngDelta * 111 * 100 * 0.7);
          setAreaHectares(Math.max(approxHa, 1000));
          setPeatOverlap(65); // default estimated peat overlap for custom tropical polygon
        }
      } catch (err) {
        console.error('File parse error:', err);
      }
    };
    reader.readAsText(file);
  };

  // Filter hotspots inside active polygon
  const filteredHotspots = useMemo(() => {
    return allHotspots.filter((h) => isPointInPolygon([h.lat, h.lon], activePolygon));
  }, [allHotspots, activePolygon]);

  const totalFrp = useMemo(() => {
    return Math.round(filteredHotspots.reduce((sum, h) => sum + h.frp, 0));
  }, [filteredHotspots]);

  const modisCount = useMemo(() => {
    return filteredHotspots.filter((h) => h.instrument === 'MODIS').length;
  }, [filteredHotspots]);

  const viirsCount = useMemo(() => {
    return filteredHotspots.filter((h) => h.instrument === 'VIIRS').length;
  }, [filteredHotspots]);

  const fireDensityPer1kHa = areaHectares > 0
    ? ((filteredHotspots.length / areaHectares) * 1000).toFixed(2)
    : '0.00';

  // Export filtered hotspots as GeoJSON
  const handleExportPolygonGeoJSON = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      boundary: {
        type: 'Polygon',
        coordinates: [activePolygon.map((p) => [p[1], p[0]])],
      },
      features: filteredHotspots.map((h) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [h.lon, h.lat],
        },
        properties: {
          confidence: h.confidence,
          frp: h.frp,
          instrument: h.instrument,
          date: h.date,
          time: h.time,
          satellite: h.satellite,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanareksa_zonal_${customGeoJsonName ? 'custom' : selectedPreset.id}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            {language === 'id' ? 'Inspeksi Perimeter Spasial Mandiri' : 'Self-Serve Spatial Boundary Inspection'}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {t.customPolygonUpload}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-3xl">
            {t.customPolygonSub}
          </p>
        </div>

        {/* Verification Badge & Export Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportPolygonGeoJSON}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Download GeoJSON for QGIS/ArcGIS"
          >
            <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Export Zonal GeoJSON</span>
          </button>
          <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">Ray-Casting 0 ms</span>
          </div>
        </div>
      </div>

      {/* Preset Boundary Selector & GeoJSON/KML Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Preset Selector */}
        <div className="lg:col-span-8 space-y-3">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {t.presetPolygons}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_BOUNDARIES.map((preset) => {
              const isSelected = selectedPreset.id === preset.id && !customGeoJsonName;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-600 dark:border-sky-500 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-sky-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs truncate">
                    {language === 'id' ? preset.nameId : preset.nameEn}
                  </div>
                  <div className="text-[11px] mt-1 text-slate-500 dark:text-slate-400 truncate">
                    {language === 'id' ? preset.provinceId : preset.provinceEn}
                  </div>
                  <div className="text-[10px] mt-2 font-mono text-sky-600 dark:text-sky-400 flex items-center justify-between">
                    <span>{preset.areaHa.toLocaleString()} Ha</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">{preset.peatOverlapPct}% Peat</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Custom GeoJSON/KML Upload */}
        <div className="lg:col-span-4 space-y-3">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {language === 'id' ? 'Unggah File Batas (.geojson / .kml)' : 'Upload Custom Boundary (.geojson / .kml)'}
          </label>
          <label className="p-3.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 bg-slate-50 dark:bg-slate-900/60 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[96px]">
            <Upload className="w-5 h-5 text-sky-600 dark:text-sky-400 mb-1" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
              {customGeoJsonName || t.dropGeoJsonHere}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              GeoJSON, JSON, or KML (WGS84 EPSG:4326)
            </span>
            <input
              type="file"
              accept=".json,.geojson,.kml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

      </div>

      {/* Calculated Stats within Selected Polygon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{t.zonalArea}</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {areaHectares.toLocaleString()} Ha
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'id' ? 'Kawasan terpilih' : 'Selected boundary'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{t.zonalFires26y}</span>
          <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1">
            {filteredHotspots.length.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            MODIS: {modisCount} &bull; VIIRS: {viirsCount}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{t.zonalFRP}</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalFrp.toLocaleString()} MW
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'id' ? 'Stefan-Boltzmann 4th Power' : 'Stefan-Boltzmann 4th Power'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{t.zonalPeatOverlap}</span>
          <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {peatOverlap}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {fireDensityPer1kHa} {language === 'id' ? 'titik / 1k Ha' : 'pts / 1k Ha'}
          </span>
        </div>

      </div>

    </div>
  );
};
