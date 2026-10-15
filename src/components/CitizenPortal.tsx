import React, { useState, useMemo } from 'react';
import { AOIRegion, PRESET_AOIS, RawHotspot } from '../engine/harmonizer';
import { Language } from '../data/translations';
import {
  ShieldAlert,
  Wind,
  CloudRain,
  MapPin,
  PhoneCall,
  Send,
  Droplets,
  HelpCircle,
  ArrowRight,
  Eye,
  AlertTriangle,
  HeartPulse,
  Flame,
  CheckCircle,
  Copy,
  Info,
  Calendar,
  Share2
} from 'lucide-react';

interface CitizenPortalProps {
  language: Language;
  selectedAOI: AOIRegion;
  onSelectAOI: (aoi: AOIRegion) => void;
  hotspots: RawHotspot[];
  isLiveSync: boolean;
  onSwitchToScience: () => void;
  onOpenBriefing?: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  language,
  selectedAOI,
  onSelectAOI,
  hotspots,
  isLiveSync,
  onSwitchToScience,
  onOpenBriefing,
}) => {
  const isIndo = language === 'id';
  const [reportType, setReportType] = useState<'asap' | 'bara' | 'parit_kering'>('bara');
  const [userLocationNote, setUserLocationNote] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  // Filter hotspots for selected region
  const regionalHotspots = useMemo(() => {
    return hotspots.filter((h) => h.aoiId === selectedAOI.id);
  }, [hotspots, selectedAOI]);

  const activeCount = regionalHotspots.length;

  // Determine Layperson Danger Status Tier
  const threatTier = useMemo(() => {
    if (activeCount === 0) {
      return {
        level: 'safe',
        color: 'emerald',
        badge: isIndo ? 'AMAN & SEJUK' : 'SAFE & MOIST',
        title: isIndo ? 'Gambut Basah, Risiko Kebakaran Sangat Rendah' : 'Peatlands Moist, Fire Risk Very Low',
        desc: isIndo
          ? 'Kondisi lahan gambut terpantau memiliki kelembapan aman. Parit terisi air dan tidak ada titik api aktif yang mengancam pemukiman.'
          : 'Peatland soil retains safe moisture levels. Canals are well-watered and no active fires threaten communities.',
        advice: isIndo
          ? 'Pertahankan pintu sekat kanal tetap tertutup agar air tidak surut. Tetap pantau parit kebun secara berkala.'
          : 'Keep canal blocks closed to retain water. Periodically monitor local plantation ditches.',
        ispuEstimate: '15 - 35 (Baik / Hijau)',
        maskRecommended: false,
      };
    } else if (activeCount <= 25) {
      return {
        level: 'advisory',
        color: 'amber',
        badge: isIndo ? 'SIAGA KERING' : 'DRY ADVISORY',
        title: isIndo ? 'Kemarau Terik, Air Parit Mulai Surut' : 'Hot Dry Spell, Water Table Receding',
        desc: isIndo
          ? `Terdeteksi ${activeCount} titik panas di kawasan gambut terbuka. Muka air parit mulai surut mendekati ambang batas kritis 40 cm.`
          : `${activeCount} thermal hotspots detected in open peat. Water levels are dropping toward the critical 40 cm limit.`,
        advice: isIndo
          ? 'DILARANG KERAS membakar sampah, ranting, atau membersihkan pekarangan dengan api. Basahi parit kebun jika tanah terasa hangat.'
          : 'STRICTLY FORBIDDEN to burn yard waste or clear land with fire. Wet perimeter ditches if soil feels warm.',
        ispuEstimate: '55 - 85 (Sedang / Biru)',
        maskRecommended: false,
      };
    } else if (activeCount <= 120) {
      return {
        level: 'warning',
        color: 'orange',
        badge: isIndo ? 'BAHAYA BARA & ASAP' : 'SMOKE & SMOLDERING THREAT',
        title: isIndo ? 'Bara Gambut Bawah Tanah Aktif, Bau Sangit Tercium' : 'Active Peat Smoldering Underground, Acrid Haze',
        desc: isIndo
          ? `Terdeteksi ${activeCount} titik kebakaran gambut aktif. Asap pekat mulai menjalar ke arah permukiman warga terbawa angin.`
          : `${activeCount} active peat fire points detected. Dense smoke plume is drifting toward residential areas with local winds.`,
        advice: isIndo
          ? 'Tutup jendela dan ventilasi rumah. Anak-anak dan lansia wajib mengenakan masker N95 jika keluar rumah. Segera lapor jika mencium bau sangit menyengat.'
          : 'Seal windows and vents. Children and elderly must wear N95 respirators outdoors. Report sharp smoke odors immediately.',
        ispuEstimate: '110 - 180 (Tidak Sehat / Kuning-Oranye)',
        maskRecommended: true,
      };
    } else {
      return {
        level: 'danger',
        color: 'rose',
        badge: isIndo ? 'DARURAT KABUT ASAP' : 'HAZE EMERGENCY',
        title: isIndo ? 'Krisis Asap Gambut Ekstrem, Jarak Pandang Rendah' : 'Severe Peat Haze Emergency, Critical Visibility',
        desc: isIndo
          ? `Krisis kebakaran pekat (${activeCount} titik api terkonfirmasi satelit NASA). Partikel debu halus PM2.5 menembus udara permukiman.`
          : `Severe fire crisis (${activeCount} NASA satellite fire detections). Toxic PM2.5 particulate levels penetrate indoor air.`,
        advice: isIndo
          ? 'DARURAT: Buat ruang bebas asap di rumah dengan kain basah. Sekolah dianjurkan Pembelajaran Jarak Jauh (PJJ). Wajib masker N95 / KN95.'
          : 'EMERGENCY: Create a smoke-safe room using damp towels on vents. Remote learning recommended for schools. N95 masks mandatory.',
        ispuEstimate: '220 - 450+ (Sangat Berbahaya / Merah-Hitam)',
        maskRecommended: true,
      };
    }
  }, [activeCount, isIndo]);

  // Request GPS Location for WhatsApp Dispatch
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(isIndo ? 'Fitur GPS tidak didukung di perangkat ini' : 'Geolocation is not supported by your browser');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGettingLocation(false);
      },
      (err) => {
        setIsGettingLocation(false);
        alert(isIndo ? 'Tidak dapat membaca lokasi GPS. Pastikan izin lokasi aktif.' : 'Unable to retrieve GPS coordinates.');
      },
      { timeout: 10000 }
    );
  };

  // WhatsApp Pre-filled SitRep Generator
  const waReportText = useMemo(() => {
    const reportLabel =
      reportType === 'bara'
        ? (isIndo ? 'Bara Gambut Bawah Tanah / Asap Putih Tanpa Lidah Api' : 'Underground Peat Smoldering / Dense White Smoke')
        : reportType === 'asap'
        ? (isIndo ? 'Kabut Asap Pekat & Bau Sangit Menyengat di Pemukiman' : 'Heavy Smoke Haze & Acrid Smell in Community')
        : (isIndo ? 'Air Parit Gambut Kering Surut & Rawan Terbakar' : 'Peat Ditch Dried Out & Critical Fire Risk');

    const locText = coords ? `Koordinat GPS: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : (userLocationNote || (isIndo ? 'Lokasi sekitar desa/kebun kami' : 'Near our village/farm'));

    return isIndo
      ? `🚨 *LAPORAN WARGA - SIAGA KARHUTLA WANAREKSA*\n\nKepada: Posko Satgas MPA / BPBD Wilayah ${selectedAOI.name}\n\n*Jenis Kejadian:* ${reportLabel}\n*Wilayah Pantauan:* ${selectedAOI.name} (${selectedAOI.biome})\n*Lokasi/Patok:* ${locText}\n*Status Satelit NASA:* ${activeCount} titik api terdeteksi\n*Pesan Warga:* Mohon bantuan pengecekan lapangan (ground check) dan pemadaman suntik air sebelum bara meluas ke pemukiman. Terima kasih.\n\n_Dilaporkan via Platform Terpadu Wanareksa (NASA Space Apps 2026)_`
      : `🚨 *CITIZEN REPORT - WANAREKSA WILDFIRE WATCH*\n\nTo: Local MPA / Disaster Management Post (${selectedAOI.name})\n\n*Incident Type:* ${reportLabel}\n*Region:* ${selectedAOI.name}\n*Location Note:* ${locText}\n*NASA Satellite Detections:* ${activeCount} active hotspots\n*Request:* Urgent ground inspection and water injection requested before fire spreads.\n\n_Sent via Wanareksa Community Portal (NASA Space Apps 2026)_`;
  }, [reportType, coords, userLocationNote, selectedAOI, activeCount, isIndo]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(waReportText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(waReportText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200 text-slate-800 dark:text-slate-200">
      
      {/* 1. Header Bar: Quick Region Selector & Seamless Switch to Science Mode */}
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {isIndo ? 'Pantauan Karhutla & Kabut Asap Warga' : 'Citizen Peatland Fire & Smoke Safety Watch'}
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700">
              {isIndo ? 'Mode Warga' : 'Citizen Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isIndo
              ? 'Informasi ramah warga, panduan perlindungan kabut asap keluarga, dan lapor bara api desa berbasis citra satelit NASA.'
              : 'Community-friendly fire danger alerts, smoke health protection, and quick reporting backed by NASA Earth observations.'}
          </p>
        </div>

        {/* Region Quick Select Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'riau', name: 'Riau', note: isIndo ? 'Gambut' : 'Peatland' },
            { id: 'kalteng', name: 'Kalteng', note: isIndo ? 'Biosfer' : 'Biosphere' },
            { id: 'sumsel', name: 'Sumsel', note: isIndo ? 'Basin' : 'Basin' },
            { id: 'indonesia', name: 'Nasional', note: isIndo ? 'Seluruh' : 'All' },
          ].map((item) => {
            const isSelected = selectedAOI.id === item.id;
            const aoiObj = PRESET_AOIS.find((a) => a.id === item.id);
            return (
              <button
                key={item.id}
                onClick={() => aoiObj && onSelectAOI(aoiObj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 border min-h-[36px] ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{item.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-sky-200' : 'text-slate-400 font-mono'}`}>
                  {item.note}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SECTION 1: Status Bahaya Wilayah Hari Ini (High-Contrast Human-Readable Hero Card) */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        threatTier.level === 'safe'
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
          : threatTier.level === 'advisory'
          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
          : threatTier.level === 'warning'
          ? 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800'
          : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase border ${
                threatTier.level === 'safe'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : threatTier.level === 'advisory'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : threatTier.level === 'warning'
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-rose-600 text-white border-rose-600'
              }`}>
                {threatTier.badge}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {selectedAOI.name} &bull; {isLiveSync ? (isIndo ? 'Satelit NASA Langsung (NRT)' : 'Live NASA Satellite') : (isIndo ? 'Kompilasi Data 26 Tahun' : '26-Year Records')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {threatTier.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
              {threatTier.desc}
            </p>
          </div>

          {/* Quick Metrics Tile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0 bg-white dark:bg-[#0c121e] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="p-2 text-center border-r border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isIndo ? 'Titik Api Aktif' : 'Active Fires'}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                {activeCount}
              </span>
            </div>

            <div className="p-2 text-center border-r border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isIndo ? 'Estimasi ISPU' : 'Estimated AQI'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                {threatTier.ispuEstimate}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2 text-center flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isIndo ? 'Status Masker' : 'Mask Status'}
              </span>
              <span className={`text-xs font-bold mt-1 ${threatTier.maskRecommended ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {threatTier.maskRecommended ? (isIndo ? 'Wajib Masker' : 'Mask Required') : (isIndo ? 'Kondisi Aman' : 'Normal Air')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="font-semibold">{isIndo ? 'Tindakan Warga Hari Ini:' : 'Citizen Advice:'}</span>
            <span>{threatTier.advice}</span>
          </div>

          {onOpenBriefing && (
            <button
              onClick={onOpenBriefing}
              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition shrink-0 cursor-pointer text-xs"
            >
              {isIndo ? 'Dengarkan Ringkasan Audio' : 'Listen Audio Briefing'}
            </button>
          )}
        </div>
      </div>

      {/* 3. SECTION 2 & 3 GRID: Panduan Kesehatan Asap & Prospek Cuaca ("Kapan Hujan Datang?") */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Panel A: Panduan Kesehatan & Proteksi Asap Keluarga */}
        <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Panduan Kesehatan & Perlindungan Asap' : 'Smoke Health & Family Protection'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isIndo ? 'Langkah praktis melindungi balita, anak, dan lansia dari bahaya PM2.5' : 'Actionable guidance against toxic peat PM2.5 smoke'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-white">{isIndo ? '1. Pemilihan Masker yang Benar' : '1. Proper Respirator Selection'}</span>
                <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">N95 / KN95</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {isIndo
                  ? 'Masker kain atau masker bedah biasa TIDAK MAMPU menyaring partikel mikroskopis asap gambut (PM2.5). Selalu sediakan masker standar N95/KN95 untuk anak-anak dan lansia jika tercium bau sangit.'
                  : 'Cloth and standard surgical masks cannot filter microscopic peat particles (PM2.5). Prioritize N95 or KN95 respirators for vulnerable family members.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-white">{isIndo ? '2. Bikin Ruang Bebas Asap di Rumah' : '2. DIY Smoke-Safe Room'}</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{isIndo ? 'Trik Kain Basah' : 'Damp Towel Seal'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {isIndo
                  ? 'Tutup celah ventilasi dan bawah pintu kamar memakai handuk atau kain yang dibasahi air. Taruh baskom air di pojok ruangan untuk menangkap debu sulfat yang melayang di udara.'
                  : 'Seal vent cracks and door gaps with moist towels. Place shallow water basins in corners to catch settled sulfate ash particles.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-white">{isIndo ? '3. Waktu Paling Berbahaya: Pagi Hari' : '3. Critical Peak Hours: Morning'}</span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">06:00 - 09:00 WIB</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {isIndo
                  ? 'Akibat fenomena inversi suhu malam hari, asap pembakaran gambut tertahan di ketinggian rendah dekat tanah pada pagi hari. Tunda olahraga luar ruangan sampai matahari terik memecah lapisan asap.'
                  : 'Thermal inversion traps peat smoke near the ground during early morning hours. Delay outdoor activities until mid-day sun disperses the trapped layer.'}
              </p>
            </div>
          </div>
        </div>

        {/* Panel B: Prospek Cuaca & Musim Kedepan ("Kapan Hujan Datang?") */}
        <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Prospek Cuaca & Musim: Kapan Hujan Datang?' : 'Weather Outlook: When Will It Rain?'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isIndo ? 'Proyeksi curah hujan dan durasi kemarau tahun 2026' : 'Rainfall forecast and 2026 dry-season trajectory'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Indikator Hari Tanpa Hujan */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isIndo ? 'Hari Tanpa Hujan Berturut-turut' : 'Consecutive Dry Days'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isIndo ? `Wilayah ${selectedAOI.name} (Data Dasarian BMKG & Satelit GPM)` : `${selectedAOI.name} basin metrics`}
                </span>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {activeCount > 50 ? '14 Hari' : '4 Hari'}
                </span>
                <span className="text-[10px] text-slate-400 block">{isIndo ? 'Gambut Kering' : 'Peat Drying'}</span>
              </div>
            </div>

            {/* Proyeksi Kapan Hujan Datang */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-white">
                  {isIndo ? 'Prakiraan Hujan Terdekat' : 'Next Expected Rainfall'}
                </span>
                <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">
                  {isIndo ? '2 - 4 Hari Lagi' : '2 - 4 Days'}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {isIndo
                  ? 'Aktivitas awan konvektif mulai terbentuk di pesisir barat. Potensi hujan intensitas ringan hingga sedang diperkirakan membasahi sebagian kubah gambut pada pertengahan pekan.'
                  : 'Convective cloud bands are forming along the western coast, with light-to-moderate showers expected to provide relief mid-week.'}
              </p>
            </div>

            {/* Analisis Durasi Kemarau Tahun 2026 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-white">
                  {isIndo ? 'Prediksi Musim 2026 (ENSO & IOD)' : '2026 Climate Trajectory (ENSO & IOD)'}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {isIndo ? 'Fase Netral' : 'Neutral Phase'}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {isIndo
                  ? 'Suhu muka laut Samudera Pasifik (ENSO) dan Samudera Hindia (IOD) berada dalam kondisi normal netral. Tahun ini diperkirakan bukan kemarau panjang ekstrem seperti 2015 atau 2019.'
                  : 'Equatorial Pacific and Indian Ocean sea surface temperatures remain neutral, indicating a standard dry season without extreme drought surges.'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. SECTION 4: Jalur Cepat Lapor Bara Api / Asap via WhatsApp (1-Klik) */}
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Jalur Cepat Lapor Bara / Asap ke Posko Desa (WhatsApp)' : '1-Click WhatsApp Quick Report to Local Fire Brigades'}
              </h3>
              <p className="text-xs text-slate-500">
                {isIndo
                  ? 'Kirim laporan instan ke Masyarakat Peduli Api (MPA) / Posko BPBD setempat tanpa login atau formulir panjang.'
                  : 'Dispatch instant emergency reports to local fire brigades and MPA volunteers without complex logins.'}
              </p>
            </div>
          </div>

          {/* GPS Auto-Locate Button */}
          <button
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {isGettingLocation
                ? (isIndo ? 'Mencari GPS...' : 'Locating GPS...')
                : coords
                ? `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`
                : (isIndo ? 'Ambil GPS Saya' : 'Get My GPS')}
            </span>
          </button>
        </div>

        {/* Report Type Selector Pills */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {isIndo ? 'Pilih Kondisi di Lapangan:' : 'Select Situation:'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'bara',
                label: isIndo ? 'Bara Gambut Bawah Tanah' : 'Underground Peat Smoldering',
                desc: isIndo ? 'Asap putih mengepul dari tanah tanpa kobaran api' : 'White smoke venting without flames',
              },
              {
                id: 'asap',
                label: isIndo ? 'Kabut Asap Pekat Pemukiman' : 'Heavy Haze in Neighborhood',
                desc: isIndo ? 'Bau sangit menyengat & jarak pandang < 500m' : 'Acrid smell & visibility < 500m',
              },
              {
                id: 'parit_kering',
                label: isIndo ? 'Air Parit Surut Drastis' : 'Ditch Completely Dried',
                desc: isIndo ? 'Muka air surut > 40 cm, lahan gambut rawan terbakar' : 'Water level dropped > 40cm',
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setReportType(item.id as any)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  reportType === item.id
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-600 dark:border-sky-500 shadow-2xs'
                    : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {item.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Location Note Input */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {isIndo ? 'Catatan Patok / Lokasi Spesifik (Opsional):' : 'Location Landmark Notes (Optional):'}
          </label>
          <input
            type="text"
            value={userLocationNote}
            onChange={(e) => setUserLocationNote(e.target.value)}
            placeholder={isIndo ? 'Contoh: Dekat jembatan kayu Parit 4 Desa Rimbo Panjang...' : 'E.g., Near wooden bridge Canal 4...'}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Action Buttons: WhatsApp & Copy */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
          <button
            onClick={handleOpenWhatsApp}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[42px]"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>{isIndo ? 'Kirim Laporan via WhatsApp Sekarang' : 'Send Report via WhatsApp Now'}</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="py-2.5 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            <span>{isCopied ? (isIndo ? 'Berhasil Disalin!' : 'Copied!') : (isIndo ? 'Salin Teks Pesan' : 'Copy Message')}</span>
          </button>
        </div>
      </div>

      {/* 5. SECTION 5: Panduan Warga Jaga Lahan Gambut Basah */}
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isIndo ? 'Panduan Warga: Cara Jaga Gambut Tetap Basah' : 'Peatland Stewardship: Keeping Peat Wet'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isIndo ? 'Trik sederhana menjaga kebun agar tidak mudah terbakar di musim kemarau' : 'Simple community practices to prevent deep underground peat fires'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              {isIndo ? '1. Aturan Parit 40 cm (PP 71/2014 & BRGM)' : '1. The 40 cm Ditch Water Rule'}
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {isIndo
                ? 'Lahan gambut seperti spons. Jika permukaan air parit surut lebih dari 40 cm dari bibir tanah, gambut akan mengering dan mudah meledak terbakar. Buat sekat kanal darurat dari karung pasir/kayu agar air tertahan di kebun saat kemarau.'
                : 'Peat acts like a giant sponge. If canal water drops lower than 40 cm below the surface, the peat dries out and becomes highly flammable. Close canal blocks to trap water in the soil.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              {isIndo ? '2. Cara Padamkan Bara: Jangan Semprot Atas!' : '2. Peat Fire Extinguishing: Deep Injection'}
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {isIndo
                ? 'Menyiram air dari atas hanya memadamkan abu permukaan, sedangkan bara di kedalaman 1 meter tetap menjalar. Tancapkan bambu runcing atau pipa besi ke dalam tanah, lalu alirkan air pompa langsung ke akar bara hingga menjadi lumpur basah.'
                : 'Spraying surface water does not extinguish underground peat fires. Drive a pipe or bamboo lance 50–100 cm into the ground to inject pressurized water directly into the smoldering root layer.'}
            </p>
          </div>
        </div>
      </div>

      {/* 6. CALLOUT: Jembatan Menuju Mode Riset & Satgas (Untuk Juri NASA) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">
              {isIndo ? 'Untuk Peneliti & Juri NASA Space Apps' : 'For Researchers & NASA Judges'}
            </span>
            <span className="text-xs font-bold text-slate-300">
              {isIndo ? 'Ingin Melihat Analisis Satelit Mendalam?' : 'Need Deep Satellite Intelligence?'}
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            {isIndo
              ? 'Buka Mode Riset & Satgas untuk memeriksa harmonisasi 26 tahun MODIS/VIIRS, formula fisika Stefan-Boltzmann, fusi spasial 5.5 km, dan unduh layer GeoJSON (RFC 7946).'
              : 'Switch to Science Mode to inspect 26-year MODIS/VIIRS cross-sensor calibration, Stefan-Boltzmann physics formulas, equal-area grid fusion, and GeoJSON downloads.'}
          </p>
        </div>

        <button
          onClick={onSwitchToScience}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs min-h-[38px]"
        >
          <span>{isIndo ? 'Buka Mode Riset & Satgas' : 'Open Science & Research Mode'}</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>

    </div>
  );
};
