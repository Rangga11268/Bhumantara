import React, { useState } from 'react';
import { Language, translations } from '../data/translations';
import { AOIRegion, PRESET_AOIS } from '../engine/harmonizer';
import { Radio, RefreshCw, Settings2, ChevronDown, Volume2, VolumeX, Split, MapPin, Calendar, Share2, CheckCircle2, History, Sparkles, Printer } from 'lucide-react';
import { speakSituationBriefing } from '../utils/audioBriefing';

export type OverviewViewMode = 'main' | 'dual_map' | 'polygon';

interface DashboardControlBarProps {
  language: Language;
  selectedAOI: AOIRegion;
  onSelectAOI: (aoi: AOIRegion) => void;
  rawMode: boolean;
  setRawMode: (val: boolean) => void;
  isLiveSync: boolean;
  onToggleLiveSync: () => void;
  isLoadingLive: boolean;
  onOpenApiKeyModal: () => void;
  activeView: OverviewViewMode;
  onSelectView: (view: OverviewViewMode) => void;
  totalHotspots?: number;
  anomalyCount?: number;
  activeScenario?: string | null;
  onSelectScenario?: (id: string | null) => void;
  onShareLink?: () => void;
  isLinkCopied?: boolean;
  onOpenBriefing?: () => void;
}

export const DashboardControlBar: React.FC<DashboardControlBarProps> = ({
  language,
  selectedAOI,
  onSelectAOI,
  rawMode,
  setRawMode,
  isLiveSync,
  onToggleLiveSync,
  isLoadingLive,
  onOpenApiKeyModal,
  activeView,
  onSelectView,
  totalHotspots = 0,
  anomalyCount = 0,
  activeScenario = null,
  onSelectScenario,
  onShareLink,
  isLinkCopied = false,
  onOpenBriefing,
}) => {
  const t = translations[language];
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleToggleVoice = () => {
    speakSituationBriefing(
      selectedAOI,
      totalHotspots,
      anomalyCount,
      language,
      setIsSpeaking
    );
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl shadow-xs overflow-hidden space-y-0 transition-colors">
      
      {/* Primary Toolbar Controls */}
      <div className="px-4 sm:px-5 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">

        {/* Region Selector (Full width on mobile, max-w-md on desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <label htmlFor="aoi-select" className="text-[11px] font-bold text-[#86868b] dark:text-[#9ca3af] uppercase tracking-wider shrink-0">
            {t.region}
          </label>
          <div className="relative flex-1 w-full max-w-full md:max-w-md">
            <select
              id="aoi-select"
              name="aoi"
              aria-label={t.region}
              value={selectedAOI.id}
              onChange={(e) => {
                const aoi = PRESET_AOIS.find((a) => a.id === e.target.value);
                if (aoi) onSelectAOI(aoi);
              }}
              className="w-full appearance-none bg-[#f5f5f7] dark:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#374151] rounded-xl pl-3.5 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#1d1d1f] dark:focus:border-white cursor-pointer min-h-[44px]"
            >
              {PRESET_AOIS.map((aoi) => (
                <option key={aoi.id} value={aoi.id} className="bg-white dark:bg-[#1f2937] text-[#1d1d1f] dark:text-white">
                  {aoi.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b] dark:text-[#9ca3af] pointer-events-none" />
          </div>
        </div>

        {/* Space-Saving Aerospace Control Bar: Segmented Switch, Live Sync & Quick Toolbelt */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Mode Toggle (Apple style segmented switch) */}
          <div className="flex rounded-xl bg-[#e5e5ea] dark:bg-[#1f2937] p-0.5 text-xs font-medium h-9 items-center">
            <button
              onClick={() => setRawMode(false)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer h-7 flex items-center justify-center text-xs ${
                !rawMode
                  ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              {t.harmonized}
            </button>
            <button
              onClick={() => setRawMode(true)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer h-7 flex items-center justify-center text-xs ${
                rawMode
                  ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              {t.rawSensors}
            </button>
          </div>

          {/* NASA Live Sync Button */}
          <div className="flex rounded-xl border border-[#e5e5e7] dark:border-[#374151] overflow-hidden text-xs h-9">
            <button
              onClick={onToggleLiveSync}
              className={`flex items-center justify-center gap-1.5 px-3 py-1 font-medium transition-all cursor-pointer h-9 ${
                isLiveSync
                  ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#111827] font-semibold'
                  : 'bg-white dark:bg-[#111827] text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#1f2937]'
              }`}
            >
              {isLoadingLive ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Radio className={`w-3.5 h-3.5 ${isLiveSync ? 'text-rose-500 animate-pulse' : ''}`} />
              )}
              <span className="text-xs">{isLiveSync ? t.liveSyncActive : t.liveSync}</span>
            </button>
            <button
              onClick={onOpenApiKeyModal}
              title={t.apiKeySettings}
              className="px-2 bg-[#f5f5f7] dark:bg-[#1f2937] border-l border-[#e5e5e7] dark:border-[#374151] text-[#86868b] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white transition-colors cursor-pointer h-9 flex items-center justify-center"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compact Quick Action Toolbelt (Icon-Driven with Tooltips to Eliminate Button Bloat) */}
          <div className="flex items-center gap-1 bg-[#f5f5f7] dark:bg-[#151d2f] p-0.5 rounded-xl border border-[#e5e5e7] dark:border-[#1f2937]">
            {/* Voice Audio Briefing */}
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-lg transition-all cursor-pointer h-8 w-8 flex items-center justify-center ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-white dark:hover:bg-[#1f2937]'
              }`}
              title={isSpeaking ? t.stopVoice : (language === 'id' ? 'Dengarkan Briefing Suara AI' : 'Listen to Voice Briefing')}
              aria-label="Voice Briefing"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* 1-Click Executive Briefing */}
            {onOpenBriefing && (
              <button
                onClick={onOpenBriefing}
                className="p-2 rounded-lg text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-white dark:hover:bg-[#1f2937] transition-all cursor-pointer h-8 w-8 flex items-center justify-center"
                title={language === 'id' ? 'Buka Ringkasan Eksekutif (A4 PDF)' : 'Open Executive Briefing (A4 PDF)'}
                aria-label="Executive Briefing"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            {/* Shareable Analysis Permalink */}
            {onShareLink && (
              <button
                onClick={onShareLink}
                className={`p-2 rounded-lg transition-all cursor-pointer h-8 w-8 flex items-center justify-center ${
                  isLinkCopied
                    ? 'bg-emerald-600 text-white'
                    : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-white dark:hover:bg-[#1f2937]'
                }`}
                title={isLinkCopied ? t.shareLinkCopied : t.shareAnalysisLink}
                aria-label="Share Link"
              >
                {isLinkCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Historic Disaster Benchmark Case Studies Strip (Space-Efficient Compact Pills) */}
      {onSelectScenario && (
        <div className="px-4 sm:px-5 py-2 bg-[#f8fafc] dark:bg-[#0f172a] border-t border-[#e5e5e7] dark:border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#86868b] dark:text-[#9ca3af] font-bold text-[10px] uppercase tracking-wider shrink-0">
            <History className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.scenariosTitle}:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap flex-1 max-w-xl">
            {[
              {
                id: 'el_nino_2015',
                title: '2015 El Niño',
                subtitle: 'Kalteng',
                activeBg: 'bg-rose-600 text-white font-bold',
              },
              {
                id: 'iod_2019',
                title: '2019 IOD+',
                subtitle: 'Sumsel',
                activeBg: 'bg-amber-600 text-white font-bold',
              },
              {
                id: 'restoration_2023',
                title: '2023 BRGM',
                subtitle: 'Riau',
                activeBg: 'bg-emerald-600 text-white font-bold',
              },
            ].map((sc) => {
              const isSelected = activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(isSelected ? null : sc.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                    isSelected
                      ? `${sc.activeBg} border-transparent shadow-xs`
                      : 'bg-white dark:bg-[#151d2f] border-[#e5e5e7] dark:border-[#1f2937] text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                  title={`${sc.title} (${sc.subtitle})`}
                >
                  <Sparkles className="w-3 h-3 shrink-0 opacity-70" />
                  <span className="font-semibold">{sc.title}</span>
                  <span className="text-[10px] opacity-60">({sc.subtitle})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Segmented View Mode Switcher (Clean, fast, uncluttered) */}
      <div className="px-4 sm:px-5 py-3 bg-[#fbfbfd] dark:bg-[#0f172a] border-t border-[#e5e5e7] dark:border-[#1f2937] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Left: Biome Info & Client-Side Engine Badge */}
        <div className="flex items-center gap-2 text-[#6e6e73] dark:text-[#9ca3af] flex-wrap">
          <span className="font-semibold text-[#1d1d1f] dark:text-white">{selectedAOI.biome}</span>
          <span className="text-[#86868b] dark:text-[#6b7280] hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline text-[#86868b] dark:text-[#9ca3af]">{selectedAOI.description}</span>
          
          <span
            title={t.offlineEngineTooltip}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.offlineEngineBadge}</span>
          </span>
        </div>

        {/* Right: Segmented Tool Switcher - 100% Equal Width on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#e5e5ea] dark:bg-[#1f2937] rounded-xl p-1 gap-1 w-full md:w-auto">
          <button
            onClick={() => onSelectView('main')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
              activeView === 'main'
                ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.mainIntelCalendar}</span>
          </button>

          <button
            onClick={() => onSelectView('dual_map')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
              activeView === 'dual_map'
                ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <Split className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.dualMapCompare}</span>
          </button>

          <button
            onClick={() => onSelectView('polygon')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
              activeView === 'polygon'
                ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.polygonInspector}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
