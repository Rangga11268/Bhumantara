import React, { useState } from 'react';
import { 
  Download, 
  Key, 
  FileSpreadsheet, 
  Code2,
  Map as MapIcon,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { AOIRegion, HarmonizedWeekData } from '../engine/harmonizer';
import { Language, translations } from '../data/translations';
import { scientificReferences, ScientificReference } from '../data/scientificReferences';

interface DataHubProps {
  language: Language;
  selectedAOI: AOIRegion;
  calendarMatrix: Record<string, HarmonizedWeekData>;
  onOpenApiKeyModal: () => void;
  userMapKey: string;
}

export const DataHub: React.FC<DataHubProps> = ({
  language,
  selectedAOI,
  calendarMatrix,
  onOpenApiKeyModal,
  userMapKey,
}) => {
  const t = translations[language];
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'json' | 'geojson'>('csv');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // NASA Constellation Data
  const satellites = [
    { name: 'Terra (EOS AM-1)', sensor: 'MODIS', orbit: '10:30 AM / 10:30 PM', resolution: '1.0 km', waveband: '3.9 μm & 11 μm' },
    { name: 'Aqua (EOS PM-1)', sensor: 'MODIS', orbit: '1:30 PM / 1:30 AM', resolution: '1.0 km', waveband: '3.9 μm & 11 μm' },
    { name: 'Suomi-NPP', sensor: 'VIIRS', orbit: '1:30 PM / 1:30 AM', resolution: '375 m', waveband: 'I4 & I5 Bands' },
    { name: 'NOAA-20 (JPSS-1)', sensor: 'VIIRS', orbit: '1:30 PM / 1:30 AM', resolution: '375 m', waveband: 'I4 & I5 Bands' },
    { name: 'NOAA-21 (JPSS-2)', sensor: 'VIIRS', orbit: '1:30 PM / 1:30 AM', resolution: '375 m', waveband: 'I4 & I5 Bands' },
  ];

  const handleCopyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredReferences = selectedCategory === 'all'
    ? scientificReferences
    : scientificReferences.filter((r) => r.category === selectedCategory);

  const handleExport = () => {
    if (downloadFormat === 'csv') {
      const headers = 'Year,Week,Month,Raw_MODIS_Count,Raw_VIIRS_Count,Raw_Total_Detections,Harmonized_Clusters_5_5km,Calibrated_FRP_MW,Burning_Activity_Index,Z_Score,Is_Critical_Period,Is_Unusual_Spike\n';
      const rows = Object.values(calendarMatrix)
        .map((d) =>
          `${d.year},${d.week},${d.month},${d.rawModisCount},${d.rawViirsCount},${d.rawTotalCount},${d.harmonizedClusterCount},${d.totalFrpCalibrated},${d.burningActivityIndex},${d.zScore},${d.isCriticalPeriod ? 'TRUE' : 'FALSE'},${d.isUnusualCondition ? 'TRUE' : 'FALSE'}`
        )
        .join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wanareksa_${selectedAOI.id}_2000_2026_Calibrated.csv`;
      link.click();
    } else if (downloadFormat === 'json') {
      const jsonContent = JSON.stringify(calendarMatrix, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wanareksa_${selectedAOI.id}_2000_2026_Calibrated.json`;
      link.click();
    } else {
      // RFC 7946 Standard GeoJSON FeatureCollection with 5.5km Bounding Polygons
      const centerLat = selectedAOI.center[0];
      const centerLon = selectedAOI.center[1];
      const deltaDeg = 0.025; // ~5.5 km grid cell width in equator degrees

      const features = Object.values(calendarMatrix).map((d, index) => {
        const latOffset = ((index % 12) - 6) * deltaDeg;
        const lonOffset = ((Math.floor(index / 12) % 12) - 6) * deltaDeg;
        const cellCenterLat = centerLat + latOffset;
        const cellCenterLon = centerLon + lonOffset;

        return {
          type: 'Feature',
          id: `wanareksa_${selectedAOI.id}_${d.year}_w${d.week}`,
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [cellCenterLon - deltaDeg / 2, cellCenterLat - deltaDeg / 2],
                [cellCenterLon + deltaDeg / 2, cellCenterLat - deltaDeg / 2],
                [cellCenterLon + deltaDeg / 2, cellCenterLat + deltaDeg / 2],
                [cellCenterLon - deltaDeg / 2, cellCenterLat + deltaDeg / 2],
                [cellCenterLon - deltaDeg / 2, cellCenterLat - deltaDeg / 2]
              ]
            ]
          },
          properties: {
            region_id: selectedAOI.id,
            region_name: selectedAOI.name,
            year: d.year,
            week: d.week,
            month: d.month,
            raw_modis_count: d.rawModisCount,
            raw_viirs_count: d.rawViirsCount,
            raw_total_count: d.rawTotalCount,
            harmonized_clusters_5_5km: d.harmonizedClusterCount,
            calibrated_frp_mw: d.totalFrpCalibrated,
            burning_activity_index: d.burningActivityIndex,
            z_score: d.zScore,
            is_critical_window: d.isCriticalPeriod,
            is_unusual_anomaly: d.isUnusualCondition,
            crs: 'EPSG:4326 - WGS 84',
            data_source: 'NASA EOS / JPSS FIRMS Harmonized by Wanareksa'
          }
        };
      });

      const geoJsonData = {
        type: 'FeatureCollection',
        name: `Wanareksa_${selectedAOI.id}_5_5km_Grid_2000_2026`,
        crs: {
          type: 'name',
          properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
        },
        features
      };

      const blob = new Blob([JSON.stringify(geoJsonData, null, 2)], { type: 'application/geo+json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wanareksa_${selectedAOI.id}_2000_2026_GIS.geojson`;
      link.click();
    }
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Editorial Header */}
      <div className="space-y-2 pt-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          {language === 'id' ? 'Arsip & Sumber Data Terbuka' : 'Open Data & Satellite Registry'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.dataHubTitle}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          {t.dataHubDesc}
        </p>
      </div>

      {/* 2-Column: Satellite Constellation & Export Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Constellation Registry */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
            {t.constellationTitle}
          </h2>

          <div className="space-y-2">
            {satellites.map((sat) => (
              <div
                key={sat.name}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{sat.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      {sat.sensor}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {t.equatorPass} {sat.orbit}
                  </div>
                </div>

                <div className="text-right sm:self-center text-[11px] text-slate-900 dark:text-white">
                  <span className="font-semibold block font-mono">{sat.resolution}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">{sat.waveband}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Engine Card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              {t.exportDatasetTitle}
            </h2>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
                  {t.fileFormat}:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setDownloadFormat('csv')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-medium min-h-[44px] transition cursor-pointer text-xs ${
                      downloadFormat === 'csv'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 shrink-0" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => setDownloadFormat('json')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-medium min-h-[44px] transition cursor-pointer text-xs ${
                      downloadFormat === 'json'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Code2 className="w-4 h-4 shrink-0" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => setDownloadFormat('geojson')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-medium min-h-[44px] transition cursor-pointer text-xs ${
                      downloadFormat === 'geojson'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <MapIcon className="w-4 h-4 shrink-0" />
                    <span>GeoJSON (GIS)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {t.selectedDataset}:
                </label>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                  {selectedAOI.name} (2000 – 2026 Archive)
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition shadow-xs min-h-[44px] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadDatasetFile}</span>
            </button>

            <button
              onClick={onOpenApiKeyModal}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium min-h-[40px] cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{userMapKey ? t.nasaMapKeyInstalled : t.configurePersonalMapKey}</span>
            </button>
          </div>
        </div>
      </div>

      {/* NASA Science & DOI Citations Registry */}
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t.scienceRegistry}
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              {t.scienceRegistrySub}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: language === 'id' ? 'Semua' : 'All' },
              { id: 'satellite', label: 'MODIS/VIIRS' },
              { id: 'physics', label: 'Stefan-Boltzmann' },
              { id: 'policy', label: 'BRGM / PP 71' },
              { id: 'api', label: 'NASA API' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* References List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredReferences.map((ref) => {
            const isBibtexCopied = copiedId === `bibtex-${ref.id}`;
            const isApaCopied = copiedId === `apa-${ref.id}`;

            return (
              <div
                key={ref.id}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {ref.category}
                      </span>
                      <span className="text-xs font-mono text-sky-600 dark:text-sky-400">
                        {ref.year}
                      </span>
                      {ref.doi && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition"
                        >
                          DOI: {ref.doi}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {ref.title}
                    </h3>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {ref.authors} &bull; <span className="italic">{ref.publication}</span>
                    </div>
                  </div>

                  {/* Copy Citation Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start">
                    <button
                      onClick={() => handleCopyCitation(ref.apa, `apa-${ref.id}`)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1 transition cursor-pointer"
                      title="Copy APA Citation"
                    >
                      {isApaCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{isApaCopied ? t.copiedCitation : t.copyApa}</span>
                    </button>
                    <button
                      onClick={() => handleCopyCitation(ref.bibtex, `bibtex-${ref.id}`)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1 transition cursor-pointer"
                      title="Copy BibTeX Citation"
                    >
                      {isBibtexCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Code2 className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{isBibtexCopied ? t.copiedCitation : t.copyBibtex}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ref.abstract}
                </p>

                <div className="p-2.5 rounded-lg bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 text-xs text-sky-900 dark:text-sky-300 flex items-start gap-2">
                  <span className="font-semibold shrink-0">Impact in Wanareksa:</span>
                  <span>{ref.keyTakeaway}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
