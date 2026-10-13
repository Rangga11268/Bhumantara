import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Layers,
  Flame,
  Globe,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Radio,
  Share2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Language, translations } from '../data/translations';
import { AOIRegion, PRESET_AOIS } from '../engine/harmonizer';

interface JudgesEvaluationGuideProps {
  language: Language;
  selectedAOI: AOIRegion;
  onSelectAOI: (aoi: AOIRegion) => void;
  rawMode: boolean;
  setRawMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  onSelectScenario: (scenarioId: string | null) => void;
  activeScenario: string | null;
  onSelectTab: (tab: 'overview' | 'lab' | 'mitigation' | 'data-hub' | 'team') => void;
  onOpenTour: () => void;
}

export const JudgesEvaluationGuide: React.FC<JudgesEvaluationGuideProps> = ({
  language,
  selectedAOI,
  onSelectAOI,
  rawMode,
  setRawMode,
  onSelectScenario,
  activeScenario,
  onSelectTab,
  onOpenTour,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      id: 'paradox',
      title: language === 'id' ? '1. Paradoks Sensor (Raw vs Harmonisasi)' : '1. Sensor Paradox (Raw vs Harmonized)',
      badge: rawMode ? (language === 'id' ? 'Mode Mentah Aktif' : 'Raw Mode Active') : (language === 'id' ? 'Terkalibrasi' : 'Harmonized'),
      badgeColor: rawMode ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      desc: language === 'id'
        ? 'Perhatikan lonjakan semu 300% pada data mentah pasca-2012 akibat masuknya VIIRS (375m). Aktifkan saklar kalibrasi untuk melihat data sebenarnya.'
        : 'Observe the artificial 300% surge in raw post-2012 data when VIIRS (375m) launched. Toggle the calibration switch to see equalized truth.',
      actionLabel: rawMode
        ? (language === 'id' ? 'Terapkan Kalibrasi Fisika (Harmonisasi)' : 'Apply Physics Calibration (Harmonize)')
        : (language === 'id' ? 'Lihat Data Mentah Tidak Akurat (Raw)' : 'View Uncorrected Raw Surge (Raw)'),
      onAction: () => setRawMode((prev) => !prev),
      secondaryAction: () => {
        const kalteng = PRESET_AOIS.find((a) => a.id === 'kalteng') || PRESET_AOIS[1];
        onSelectAOI(kalteng);
      },
      secondaryLabel: language === 'id' ? 'Fokus Kalteng' : 'Focus Central Kalimantan',
    },
    {
      num: 2,
      id: 'scenarios',
      title: language === 'id' ? '2. Simulasi 3 Skenario Karhutla Nyata' : '2. Simulate 3 Historic Fire Crises',
      badge: activeScenario ? (language === 'id' ? 'Kasus Aktif' : 'Scenario Active') : (language === 'id' ? 'Pilih Kasus' : 'Select Case'),
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
      desc: language === 'id'
        ? 'Bandingkan krisis asap El Niño 2015, anomali IOD+ 2019, dan efektivitas restorasi sekat kanal BRGM (2022–2026) secara instan.'
        : 'Instantly benchmark the 2015 El Niño smoke crisis, 2019 IOD+ anomaly, and 2022–2026 BRGM canal-blocking restoration impact.',
      actionLabel: language === 'id' ? 'Uji Kasus El Niño 2015' : 'Test 2015 El Niño Crisis',
      onAction: () => onSelectScenario('el_nino_2015'),
      secondaryAction: () => onSelectScenario('restoration_2023'),
      secondaryLabel: language === 'id' ? 'Uji Restorasi BRGM' : 'Test BRGM Restoration',
    },
    {
      num: 3,
      id: 'lab',
      title: language === 'id' ? '3. Uji Rumus Fisika & Simulasi Monte Carlo' : '3. Test Physics Engine & Monte Carlo Lab',
      badge: language === 'id' ? 'Lab Ilmiah' : 'Science Lab',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
      desc: language === 'id'
        ? 'Jelajahi kalibrasi energi Stefan-Boltzmann, kurva Muka Air Tanah Gambut (TMAG < -40 cm), dan simulasi ketidakpastian 500 iterasi Monte Carlo.'
        : 'Explore Stefan-Boltzmann thermal energy models, BRGM Peat Water Table curves (TMAG < -40 cm), and 500-run Monte Carlo uncertainty simulations.',
      actionLabel: language === 'id' ? 'Buka Lab Harmonisasi' : 'Open Harmonization Lab',
      onAction: () => onSelectTab('lab'),
      secondaryAction: onOpenTour,
      secondaryLabel: language === 'id' ? 'Tur 30 Detik' : '30-Sec Tour',
    },
    {
      num: 4,
      id: 'mitigation',
      title: language === 'id' ? '4. Disposisi WhatsApp & Ekspor GIS (QGIS)' : '4. WhatsApp SitRep & GeoJSON GIS Export',
      badge: language === 'id' ? 'Aksi Nyata' : 'Field Action',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      desc: language === 'id'
        ? 'Kirim format pesan tanggap darurat Manggala Agni via WhatsApp, salin koordinat GPS, dan unduh layer GeoJSON poligon 5.5 km (RFC 7946).'
        : 'Generate instant WhatsApp field sitreps for Manggala Agni brigades, copy GPS coordinates, and export RFC 7946 GeoJSON polygons for QGIS/ArcGIS.',
      actionLabel: language === 'id' ? 'Buka Pusat Mitigasi' : 'Open Field Mitigation',
      onAction: () => onSelectTab('mitigation'),
      secondaryAction: () => onSelectTab('data-hub'),
      secondaryLabel: language === 'id' ? 'Pusat Data & GeoJSON' : 'Data Hub & GeoJSON',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-900/10 via-emerald-900/5 to-transparent dark:from-blue-950/40 dark:via-emerald-950/20 dark:to-transparent border border-blue-200/80 dark:border-blue-900/50 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#1d1d1f] dark:text-white tracking-tight">
                {language === 'id' ? 'Panduan Cepat & Alur Eksplorasi Interaktif' : 'Quick-Start Interactive Exploration Guide'}
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                {language === 'id' ? 'Panduan Cepat' : 'Quick Guide'}
              </span>
            </div>
            <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] mt-0.5">
              {language === 'id'
                ? 'Jelajahi inovasi sains, peta satelit multi-sensor, dan sistem mitigasi karhutla Wanareksa melalui 4 alur langkah berikut:'
                : "Explore Wanareksa's multi-sensor science, satellite intelligence, and field mitigation across 4 guided steps:"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer shrink-0"
          title={isCollapsed ? (language === 'id' ? 'Tampilkan Panduan' : 'Expand Guide') : (language === 'id' ? 'Sembunyikan Panduan' : 'Collapse Guide')}
        >
          <span className="hidden sm:inline">{isCollapsed ? (language === 'id' ? 'Buka Panduan' : 'Expand') : (language === 'id' ? 'Tutup' : 'Collapse')}</span>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Roadmap Grid */}
      {!isCollapsed && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-blue-200/60 dark:border-blue-900/40">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                activeStep === step.num
                  ? 'bg-white dark:bg-[#111827] border-blue-500 dark:border-blue-400 shadow-md ring-1 ring-blue-500/20'
                  : 'bg-white/80 dark:bg-[#111827]/80 border-[#e5e5e7] dark:border-[#1f2937] hover:border-blue-300 dark:hover:border-blue-800'
              }`}
              onClick={() => setActiveStep(step.num)}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-xs text-[#1d1d1f] dark:text-white truncate">
                    {step.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#6e6e73] dark:text-[#9ca3af] leading-relaxed line-clamp-3">
                  {step.desc}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    step.onAction();
                  }}
                  className="w-full py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[34px]"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3 h-3 shrink-0" />
                </button>

                {step.secondaryAction && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      step.secondaryAction();
                    }}
                    className="w-full py-1 px-2 border border-[#e5e5e7] dark:border-[#374151] hover:bg-black/5 dark:hover:bg-white/5 text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white rounded-lg text-[11px] font-medium transition cursor-pointer min-h-[28px] text-center"
                  >
                    {step.secondaryLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
