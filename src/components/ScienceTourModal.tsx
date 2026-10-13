import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  Cpu,
  Flame,
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle2,
  Keyboard,
  Compass
} from 'lucide-react';
import { Language, translations } from '../data/translations';

interface ScienceTourModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: 'overview' | 'lab' | 'mitigation' | 'data-hub' | 'team') => void;
}

export const ScienceTourModal: React.FC<ScienceTourModalProps> = ({
  language,
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const t = translations[language];
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'briefing' | 'shortcuts'>('briefing');

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && activeTab === 'briefing') {
        setCurrentSlide((prev) => Math.min(prev + 1, 2));
      } else if (e.key === 'ArrowLeft' && activeTab === 'briefing') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, onClose]);

  if (!isOpen) return null;

  const slides = [
    {
      step: '01',
      badge: language === 'id' ? 'Paradoks Pergeseran Sensor' : 'The Sensor Shift Paradox',
      title: language === 'id' ? 'Mengapa Data Kebakaran 2012–2026 Tampak Melonjak 300%?' : 'Why Post-2012 Fire Counts Artificially Tripled',
      desc: language === 'id'
        ? 'Sebelum 2012, pemantauan mengandalkan sensor MODIS (1 km). Masuknya sensor VIIRS (375 m) di Suomi-NPP menghasilkan piksel 7x lebih rapat. Tanpa harmonisasi, satu kebakaran yang sama terhitung sebagai 5–9 titik terpisah, menciptakan ilusi lonjakan kebakaran yang menyesatkan pengambil kebijakan.'
        : 'Prior to 2012, Earth observation relied on MODIS (1 km). The addition of VIIRS (375 m) on Suomi-NPP introduced 7x smaller pixels. Without harmonization, a single fire front is counted as 5 to 9 discrete points, misleading policy makers into believing wildfire frequency tripled.',
      visual: (
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
          <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 font-mono">MODIS (2000–2011)</span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">1 km</span>
            </div>
            <div className="h-20 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-dashed border-blue-300 dark:border-blue-800 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                1 Hit
              </div>
            </div>
            <p className="text-[10px] text-[#6e6e73] dark:text-[#9ca3af] leading-tight text-center">
              {language === 'id' ? '1 Footprint Piksel Luas' : '1 Wide Pixel Footprint'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-amber-200 dark:border-amber-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 font-mono">VIIRS (2012–2026)</span>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">375 m</span>
            </div>
            <div className="h-20 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-dashed border-amber-300 dark:border-amber-800 grid grid-cols-3 gap-1 p-1.5 place-items-center">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px] font-bold shadow-xs">
                  •
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#6e6e73] dark:text-[#9ca3af] leading-tight text-center">
              {language === 'id' ? '6–9 Titik Api Terpisah' : '6–9 Fragmented Detections'}
            </p>
          </div>
        </div>
      )
    },
    {
      step: '02',
      badge: language === 'id' ? 'Mesin Harmonisasi 5.5 km' : '5.5 km Harmonization Engine',
      title: language === 'id' ? 'Spatial Equal-Area Binning & Kalibrasi Energi FRP' : 'Equal-Area Binning & Radiative Power Normalization',
      desc: language === 'id'
        ? 'Wanareksa mengelompokkan deteksi tumpang-tindih ke dalam sel heksagonal 5.5 km dan mengalibrasi Fire Radiative Power (FRP Megawatts) menggunakan hukum radiasi Planck & Stefan-Boltzmann, memulihkan integritas perbandingan 2000–2026.'
        : 'Wanareksa aggregates co-located multi-sensor detections into 5.5 km equal-area spatial bins and cross-calibrates Fire Radiative Power (FRP Megawatts) via Stefan-Boltzmann thermal physics, restoring true multi-decadal comparability.',
      visual: (
        <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'id' ? 'Proses Kalibrasi Lintas Sensor' : 'Cross-Sensor Calibration Pipeline'}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">
              5.5 km Equal-Area Grid
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 rounded-xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937]">
              <div className="text-[10px] text-[#86868b] dark:text-[#9ca3af] uppercase font-bold">Raw VIIRS</div>
              <div className="font-bold text-red-600 dark:text-red-400 text-sm mt-0.5">384 Pts</div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] flex flex-col justify-center items-center">
              <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Binning</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-bold">Harmonized</div>
              <div className="font-bold text-emerald-700 dark:text-emerald-300 text-sm mt-0.5">42 Clusters</div>
            </div>
          </div>
        </div>
      )
    },
    {
      step: '03',
      badge: language === 'id' ? 'Mitigasi Lahan Gambut & Lapangan' : 'Peatland Hydrology & Field Impact',
      title: language === 'id' ? 'Integrasi Muka Air Tanah Gambut (TMAG < -40 cm)' : 'Groundwater Level (TMAG < -40 cm) & Carbon Protection',
      desc: language === 'id'
        ? 'Mengintegrasikan ambang batas hidrologis BRGM (PP No. 71/2014) untuk mendeteksi ancaman bara api bawah tanah (smoldering) sebelum merembet, dilengkapi generator disposisi tim patroli Manggala Agni dan Masyarakat Peduli Api.'
        : 'Directly integrates Indonesian statutory peat hydrology thresholds (TMAG < -40 cm) to prevent deep smoldering peat ignition, coupled with instant WhatsApp/SMS dispatch for Manggala Agni frontline fire brigades.',
      visual: (
        <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500" />
              <span>{language === 'id' ? 'Ambang Kritis Gambut BRGM' : 'BRGM Statutory Peat Threshold'}</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400">
              TMAG &lt; -40 cm = Extreme
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] flex items-center justify-between text-xs">
            <span className="text-[#6e6e73] dark:text-[#9ca3af]">
              {language === 'id' ? 'Aksi Lapangan:' : 'Field Directives:'}
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {language === 'id' ? 'Penyekatan Kanal & Re-wetting' : 'Canal Blocking & Re-wetting'}
            </span>
          </div>
        </div>
      )
    }
  ];

  const shortcuts = [
    { key: '0', label: language === 'id' ? 'Buka Misi & Ikhtisar Eksekutif' : 'Open Mission Story Tab' },
    { key: '1', label: language === 'id' ? 'Buka Tab Intelijen & Peta' : 'Open Intel & Map Tab' },
    { key: '2', label: language === 'id' ? 'Buka Lab Harmonisasi' : 'Open Harmonization Lab' },
    { key: '3', label: language === 'id' ? 'Buka Pusat Mitigasi & SitRep' : 'Open Mitigation Hub & SitRep' },
    { key: '4', label: language === 'id' ? 'Buka Pusat Data Satelit & Ekspor' : 'Open Data Hub & GeoJSON Export' },
    { key: '5', label: language === 'id' ? 'Buka Profil Kreator & Berkas Ilmiah' : 'Open Creator Dossier' },
    { key: 'L', label: language === 'id' ? 'Toggle NASA FIRMS Live Sync' : 'Toggle NASA FIRMS Live Sync' },
    { key: 'T', label: language === 'id' ? 'Toggle Tema Dark / Light' : 'Toggle Dark / Light Theme' },
    { key: '?', label: language === 'id' ? 'Buka Modal Briefing & Shortcut' : 'Open Briefing & Shortcuts Modal' },
    { key: 'ESC', label: language === 'id' ? 'Tutup Dialog / Modal' : 'Close Active Modal' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5e5e7] dark:border-[#1f2937] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-white">
                {t.tourModalTitle}
              </h2>
              <p className="text-[11px] text-[#86868b] dark:text-[#9ca3af]">
                {t.tourModalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#1f2937] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation: Briefing vs Shortcuts - Equal Width */}
        <div className="px-4 sm:px-6 pt-3 pb-2 grid grid-cols-2 gap-2 border-b border-[#e5e5e7] dark:border-[#1f2937] bg-[#fbfbfd] dark:bg-[#151d2f]">
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center min-h-[40px] flex items-center justify-center ${
              activeTab === 'briefing'
                ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                : 'text-[#86868b] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            {language === 'id' ? 'Ringkasan Ilmiah' : 'Science Briefing'}
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer text-center min-h-[40px] ${
              activeTab === 'shortcuts'
                ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                : 'text-[#86868b] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.shortcutsTitle}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'briefing' ? (
            <div className="space-y-4">
              {/* Step indicator */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider truncate">
                  Step {slides[currentSlide].step} / 03 &bull; {slides[currentSlide].badge}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx
                          ? 'w-6 bg-emerald-600 dark:bg-emerald-400'
                          : 'w-2 bg-[#e5e5e7] dark:bg-[#374151]'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-xs sm:text-sm text-[#515154] dark:text-[#d1d5db] leading-relaxed">
                  {slides[currentSlide].desc}
                </p>
              </div>

              {/* Visual Demo Card */}
              {slides[currentSlide].visual}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af]">
                {language === 'id'
                  ? 'Gunakan tombol keyboard berikut untuk navigasi cepat dan kendali penuh tanpa mouse:'
                  : 'Use these keyboard shortcuts for seamless zero-latency navigation and hands-free control:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {shortcuts.map((sc) => (
                  <div
                    key={sc.key}
                    className="p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] flex items-center justify-between"
                  >
                    <span className="text-[#515154] dark:text-[#d1d5db]">{sc.label}</span>
                    <kbd className="px-2 py-1 rounded bg-white dark:bg-[#111827] border border-[#d1d5db] dark:border-[#374151] font-mono text-[11px] font-bold text-[#1d1d1f] dark:text-white shadow-2xs">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls - Stacked with Equal Width on Mobile */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-[#e5e5e7] dark:border-[#1f2937] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#fbfbfd] dark:bg-[#151d2f]">
          {activeTab === 'briefing' ? (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
                disabled={currentSlide === 0}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-[#1d1d1f] dark:text-white border border-[#e5e5e7] dark:border-[#1f2937] bg-white dark:bg-[#111827] hover:bg-[#f5f5f7] dark:hover:bg-[#1f2937] disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'id' ? 'Sebelumnya' : 'Previous'}</span>
              </button>

              {currentSlide < 2 ? (
                <button
                  onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, 2))}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                >
                  <span>{language === 'id' ? 'Langkah Berikutnya' : 'Next Step'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectTab) onSelectTab('overview');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'id' ? 'Mulai Eksplorasi Data' : 'Explore Platform'}</span>
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#1d1d1f] hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 transition shadow-xs cursor-pointer min-h-[44px]"
              >
                {language === 'id' ? 'Tutup Panduan' : 'Close Guide'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
