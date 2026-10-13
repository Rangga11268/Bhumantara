/**
 * regionalPeatProfiles.ts
 * Comprehensive database of Indonesian Peatland Hydrological Units (KHG),
 * groundwater thresholds (TMAG), peat depths, canal blocking infrastructure (BRGM),
 * and province-specific tactical directives.
 * 
 * Covering all 13 preset AOIs in the Wanareksa NASA Harmonization Suite.
 */

export interface RegionalPeatProfile {
  id: string;
  name: string;
  shortLabelId: string;
  shortLabelEn: string;
  island: string;
  khgName: string;
  peatDepth: string;
  isDeepPeat: boolean;
  tmag: number; // Groundwater table in cm (PP 57/2016 threshold is -40 cm)
  kag: number; // Peat moisture content in % (< 100% is ignition threshold)
  canalBlocks: number; // BRGM monitored canal blocks count
  nearestWaterSource: string;
  risk: 'extreme' | 'high' | 'moderate' | 'nominal';
  fwi: number;
  recommendationSquad: string;
  tacticalDirectives: string[];
}

export const REGIONAL_PEAT_PROFILES: Record<string, RegionalPeatProfile> = {
  riau: {
    id: 'riau',
    name: 'Riau (Semenanjung Kampar & Giam Siak)',
    shortLabelId: 'Riau (Kampar & Siak)',
    shortLabelEn: 'Riau (Kampar & Siak)',
    island: 'Sumatera',
    khgName: 'KHG Sungai Siak - Sungai Kampar (Kubah Gambut Semenanjung Kampar)',
    peatDepth: '4.8 – 7.0 m (Gambut Sangat Dalam)',
    isDeepPeat: true,
    tmag: -48,
    kag: 112,
    canalBlocks: 142,
    nearestWaterSource: 'Kanal Primer Konsesi HTI & Sungai Siak',
    risk: 'extreme',
    fwi: 28.4,
    recommendationSquad: '2 Regu Manggala Agni Daops Siak + MPA Desa Sungai Apit (Tombak Suntik Gambut)',
    tacticalDirectives: [
      'Segera tutup sekat kanal di sepanjang Saluran Primer Semenanjung Kampar untuk menaikkan muka air tanah > -40 cm.',
      'Operasikan stik suntik gambut (peat injection lance) sedalam 2–3 meter pada zona perbatasan konsesi dan kubah lindung.',
      'Siagakan water bombing heli BNPB jika FRP kumulatif melampaui 80 MW di area semak rawa non-akses darat.',
      'Koordinasikan posko MPA Desa Peduli Gambut di Dayun dan Teluk Meranti untuk patroli sekat kanal harian.'
    ]
  },
  kalteng: {
    id: 'kalteng',
    name: 'Kalimantan Tengah (Eks-PLG & TN Sebangau)',
    shortLabelId: 'Kalteng (Eks-PLG & Sebangau)',
    shortLabelEn: 'C. Kalimantan (Ex-PLG)',
    island: 'Kalimantan',
    khgName: 'Kawasan Eks-PLG Blok A & C (KHG Sungai Kahayan - Sungai Sebangau)',
    peatDepth: '5.5 – 9.0 m (Kubah Gambut Raksasa Borneo)',
    isDeepPeat: true,
    tmag: -55,
    kag: 96,
    canalBlocks: 280,
    nearestWaterSource: 'Saluran Primer Induk (SPI) Eks-PLG & Sungai Kahayan',
    risk: 'extreme',
    fwi: 32.1,
    recommendationSquad: '3 Regu Manggala Agni Daops Kapuas/Palangka Raya + Damkar Swasta',
    tacticalDirectives: [
      'Prioritaskan pembasahan kembali (rewetting) zona kanal bocor di eks-PLG Blok A (Dadahup-Mengkatip).',
      'Waspadai smoldering combustion bawah tanah karena KAG < 100% telah melewati ambang batas sulut bara api.',
      'Aktifkan sumur bor darurat BRGM di sepanjang koridor jalan Trans-Kalimantan dan batas TN Sebangau.',
      'Ajukan water bombing helikopter tipe Kamov/Mi-8 untuk pemadaman api tajuk yang memicu loncatan bara api.'
    ]
  },
  sumsel: {
    id: 'sumsel',
    name: 'Sumatera Selatan (Kubah Gambut OKI & Banyuasin)',
    shortLabelId: 'Sumsel (Kubah Gambut OKI)',
    shortLabelEn: 'S. Sumatra (OKI Peat Dome)',
    island: 'Sumatera',
    khgName: 'KHG Sungai Sugihan - Sungai Saleh (Lanskap Gambut OKI & Cengal)',
    peatDepth: '3.5 – 5.8 m (Kubah Gambut Dalam OKI)',
    isDeepPeat: true,
    tmag: -52,
    kag: 104,
    canalBlocks: 210,
    nearestWaterSource: 'Kanal Sekunder Perkebunan & Sungai Sugihan',
    risk: 'extreme',
    fwi: 29.5,
    recommendationSquad: 'Satgas Gabungan TNI/Polri, BPBD OKI & Manggala Agni Daops Lahat/OKI',
    tacticalDirectives: [
      'Gelar sekat bakar basah di sepanjang perbatasan kebun sawit dan kawasan lindung gambut Cengal-Tulung Selapan.',
      'Lakukan penggenangan terkendali pada saluran drainase perkebunan kelapa sawit di sekitar titik koordinat aktif.',
      'Pantau lintasan angin tenggara yang berpotensi meniupkan kabut asap pekat menuju Palembang dan Jambi.',
      'Kombinasikan pemadaman darat mekanis dengan pompa apung (floating pump) dari kanal sekunder terdekat.'
    ]
  },
  kalbar: {
    id: 'kalbar',
    name: 'Kalimantan Barat (Ketapang & Kubu Raya)',
    shortLabelId: 'Kalbar (Ketapang & Kubu Raya)',
    shortLabelEn: 'W. Kalimantan (Ketapang)',
    island: 'Kalimantan',
    khgName: 'KHG Sungai Pawan - Sungai Tolak (Kubah Gambut Pesisir Ketapang)',
    peatDepth: '3.8 – 6.2 m (Gambut Pesisir Dalam)',
    isDeepPeat: true,
    tmag: -46,
    kag: 114,
    canalBlocks: 165,
    nearestWaterSource: 'Sungai Pawan, Kanal Primer Perkebunan & Parit Desa',
    risk: 'extreme',
    fwi: 27.8,
    recommendationSquad: 'Manggala Agni Daops Ketapang & Pontianak + MPA Pesisir',
    tacticalDirectives: [
      'Patroli intensif di koridor semak belukar terbuka sekitar Bandara Rahadi Oesman dan perbatasan Kubu Raya.',
      'Pertahankan elevasi air kanal minimum -30 cm dengan mengoperasikan pintu bendung sekat kanal BRGM.',
      'Gunakan metode suntik gambut bertingkat (multi-stage lance) untuk memadamkan akar gambut pakis yang terbakar.',
      'Siapkan tangki penampungan air portabel di tepi jalur rintis jalan desa untuk suplai air continue regu darat.'
    ]
  },
  kalsel: {
    id: 'kalsel',
    name: 'Kalimantan Selatan (Banjarbaru & Barito)',
    shortLabelId: 'Kalsel (Banjarbaru & Barito)',
    shortLabelEn: 'S. Kalimantan (Banjarbaru)',
    island: 'Kalimantan',
    khgName: 'KHG Sungai Barito - Sungai Negara & Dataran Rawa Gambut Banjarbaru',
    peatDepth: '3.0 – 4.5 m (Gambut Sedang-Dalam)',
    isDeepPeat: false,
    tmag: -38,
    kag: 126,
    canalBlocks: 95,
    nearestWaterSource: 'Saluran Irigasi Riam Kanan & Sungai Martapura',
    risk: 'high',
    fwi: 22.0,
    recommendationSquad: 'BPBD Prov Kalsel, Manggala Agni Banjar & Damkar Swasta Banjarmasin',
    tacticalDirectives: [
      'Fokuskan perlindungan perimeter lingkar luar Bandara Internasional Syamsudin Noor Banjarbaru dari kabut asap.',
      'Buka saluran suplesi air dari bendung terdekat menuju kawasan rawa gambut Guntung Damar.',
      'Lakukan pembasahan serasah berkala dua kali sehari pada jam puncak pengeringan (11.00–15.00 WITA).',
      'Koordinasikan MPA kelurahan untuk memantau aktivitas pembukaan lahan tanpa bakar (PLTB).'
    ]
  },
  kaltim: {
    id: 'kaltim',
    name: 'Kalimantan Timur (Kutai & Buffer IKN)',
    shortLabelId: 'Kaltim (Buffer IKN & Kutai)',
    shortLabelEn: 'E. Kalimantan (IKN Buffer)',
    island: 'Kalimantan',
    khgName: 'KHG Sungai Mahakam - Danau Semayang & Koridor Ekologis Ibu Kota Nusantara',
    peatDepth: '2.5 – 4.0 m (Gambut Dataran Rendah)',
    isDeepPeat: false,
    tmag: -30,
    kag: 142,
    canalBlocks: 60,
    nearestWaterSource: 'Danau Jempang, Sungai Kedang Pahu & Sungai Mahakam',
    risk: 'moderate',
    fwi: 16.8,
    recommendationSquad: 'Satgas Pengendalian Karhutla Otorita IKN & Manggala Agni Samarinda',
    tacticalDirectives: [
      'Pantau ketat perimeter hutan lindung Bukit Soeharto dan koridor rimba penyangga Kawasan Inti IKN.',
      'Lakukan patroli darat preventif pada lahan terbuka mineral bersemak yang mudah terbakar oleh radiasi matahari.',
      'Manfaatkan embung retensi dan intake air Sungai Sepaku untuk pasokan air cepat armada tangki.',
      'Terapkan sensor telemetri cuaca mikro otomatis di sepanjang jalur poros Balikpapan-Samarinda.'
    ]
  },
  sumatera: {
    id: 'sumatera',
    name: 'Pulau Sumatera (Riau, Sumsel, Jambi, Aceh)',
    shortLabelId: 'Pulau Sumatera (Regional)',
    shortLabelEn: 'Sumatra Island (Regional)',
    island: 'Sumatera',
    khgName: 'Bentang Alam Koridor Gambut Lintas Provinsi (Semenanjung Kampar, OKI, TN Berbak, Rawa Tripa)',
    peatDepth: '4.2 – 7.5 m (Rata-rata Gambut Pesisir Timur)',
    isDeepPeat: true,
    tmag: -50,
    kag: 106,
    canalBlocks: 420,
    nearestWaterSource: 'Jaringan Kanal Primer Konsesi & Sungai-Sungai Utama Sumatera',
    risk: 'extreme',
    fwi: 28.9,
    recommendationSquad: 'Komando Satgas Karhutla Terpadu Sumatera (Pusdalops BNPB / KLHK)',
    tacticalDirectives: [
      'Mobilisasi armada gabungan lintas provinsi dengan prioritas pertama pada klaster dengan FRP > 60 MW.',
      'Aktifkan Operasi Modifikasi Cuaca (OMC / TMC) penyemaian awan NaCl di atas koridor atmosfer Riau-Jambi-Sumsel.',
      'Instruksikan seluruh pemegang konsesi HTI dan sawit untuk menyiagakan regu pemadam internal 24 jam.',
      'Kordinasikan pemantauan kualitas udara (ISPU / PM2.5) di stasiun Pekanbaru, Palembang, dan perbatasan Selat Malaka.'
    ]
  },
  kalimantan: {
    id: 'kalimantan',
    name: 'Pulau Kalimantan (Kalteng, Kalbar, Kalsel, Kaltim)',
    shortLabelId: 'Pulau Kalimantan (Regional)',
    shortLabelEn: 'Borneo Island (Regional)',
    island: 'Kalimantan',
    khgName: 'Kubah Gambut Trans-Borneo (Eks-PLG, Sebangau, Barito, Pawan, Kapuas)',
    peatDepth: '4.8 – 8.5 m (Rata-rata Gambut Tropis Kalimantan)',
    isDeepPeat: true,
    tmag: -52,
    kag: 102,
    canalBlocks: 600,
    nearestWaterSource: 'Sungai-Sungai Purba Kalimantan & Jaringan Kanal Eks-PLG',
    risk: 'extreme',
    fwi: 30.5,
    recommendationSquad: 'Komando Gabungan Satgas Terpadu Kalimantan & Armada Helikopter BNPB',
    tacticalDirectives: [
      'Gelar operasi pemadaman terpadu helikopter water bombing di kubah gambut dalam terisolasi.',
      'Pastikan sekat kanal BRGM di seluruh DAS Kahayan, Sebangau, dan Barito dalam posisi tertutup sempurna.',
      'Sediakan logistik masker respirasi N95 dan fasilitas ruang oksigen darurat di fasilitas kesehatan terdampak.',
      'Tingkatkan patroli gabungan darat TNI/Polri/Manggala Agni untuk mencegah pembakaran lahan disengaja.'
    ]
  },
  jawa_bali: {
    id: 'jawa_bali',
    name: 'Jawa & Bali (TN Bromo, Ijen, Baluran, Merbabu)',
    shortLabelId: 'Jawa & Bali (Gunung & Savana)',
    shortLabelEn: 'Java & Bali (Montane & Savanna)',
    island: 'Jawa & Bali',
    khgName: 'Kawasan Hutan Pegunungan Vulkanik & Savana Tropis (TN Baluran - Bromo Tengger Semeru)',
    peatDepth: '< 0.5 m (Tanah Mineral Vulkanik & Serasah Pinus)',
    isDeepPeat: false,
    tmag: -25,
    kag: 45,
    canalBlocks: 12,
    nearestWaterSource: 'Mata Air Gunung, Danau Kawah & Tangki Mobil Damkar',
    risk: 'high',
    fwi: 24.2,
    recommendationSquad: 'Petugas Balai Taman Nasional, BPBD Daerah & Masyarakat Mitra Polhut (MMP)',
    tacticalDirectives: [
      'Fokuskan pembuatan sekat bakar manual (fire breaks) selebar 3–5 meter pada lereng bervegetasi savana kering.',
      'Gunakan gepyok manual dan pompa punggung (backpack pump) untuk memadamkan api serasah permukaan yang merambat cepat.',
      'Tutup sementara jalur pendakian gunung yang berada di radius 5 km dari garis api aktif.',
      'Waspadai angin lembah kencang yang dapat mempercepat laju perambatan api ke arah puncak.'
    ]
  },
  nusa_tenggara: {
    id: 'nusa_tenggara',
    name: 'Nusa Tenggara (Sumba, Timor, Flores, Sumbawa)',
    shortLabelId: 'Nusa Tenggara (Sabana Kering)',
    shortLabelEn: 'Lesser Sunda (Savanna)',
    island: 'Kepulauan Nusa Tenggara',
    khgName: 'Bentang Alam Sabana Semi-Arid & Padang Penggembalaan Kering (Sumba-Timor)',
    peatDepth: '< 0.3 m (Tanah Mineral Litosol/Vertisol Bebatuan)',
    isDeepPeat: false,
    tmag: -20,
    kag: 32,
    canalBlocks: 8,
    nearestWaterSource: 'Embung Pertanian & Sungai Musiman',
    risk: 'high',
    fwi: 26.0,
    recommendationSquad: 'BPBD NTT/NTB, Koramil, Polsek & Kelompok Peternak Desa',
    tacticalDirectives: [
      'Gelar sekat bakar di sekeliling permukiman adat dan padang gembala ternak sapi/kuda.',
      'Manfaatkan ranting basah dan alat tradisional pemukul api untuk melokalisasi kobaran api rumput terbuka.',
      'Amankan persediaan pakan ternak kering di lumbung desa dari potensi percikan bara api tertiup angin.',
      'Koordinasikan jadwal pembersihan lahan warga secara serentak dengan pengawasan regu jaga desa.'
    ]
  },
  sulawesi: {
    id: 'sulawesi',
    name: 'Pulau Sulawesi (Morowali, Konawe, Luwu, Gorontalo)',
    shortLabelId: 'Pulau Sulawesi (Konawe & Morowali)',
    shortLabelEn: 'Sulawesi Island',
    island: 'Sulawesi',
    khgName: 'Koridor Hutan Wallacea & Rawa Gambut Dataran Rendah Konawe-Morowali',
    peatDepth: '1.5 – 3.2 m (Gambut Dataran Rendah Pesisir)',
    isDeepPeat: false,
    tmag: -32,
    kag: 135,
    canalBlocks: 35,
    nearestWaterSource: 'Sungai Konaweha, Danau Matano & Saluran Rawa',
    risk: 'moderate',
    fwi: 18.5,
    recommendationSquad: 'Manggala Agni Daops Tinanggea/Palu & BPBD Kabupaten',
    tacticalDirectives: [
      'Awasi kawasan rawa gambut di sekitar pesisir Konawe Utara dan kawasan industri tambang nikel.',
      'Siagakan pompa air bergerak di dekat sumber air alami sungai untuk mengamankan perimeter pemukiman.',
      'Lakukan sosialisasi pencegahan pembakaran lahan perladangan berpindah di lereng bukit.',
      'Periksa secara berkala kelembapan lantai hutan sekunder di sekitar area konsesi perkebunan.'
    ]
  },
  papua: {
    id: 'papua',
    name: 'Papua & Maluku (Merauke, Mappi, Bintuni, Asmat, Seram)',
    shortLabelId: 'Papua & Maluku (Merauke & Bintuni)',
    shortLabelEn: 'Papua & Maluku (Merauke)',
    island: 'Papua & Maluku',
    khgName: 'Kawasan Rawa Gambut Pesisir Asmat-Bintuni & Sabana Basah Dataran Merauke-Mappi',
    peatDepth: '3.0 – 5.5 m (Rawa Gambut Tropis Pesisir)',
    isDeepPeat: true,
    tmag: -35,
    kag: 155,
    canalBlocks: 48,
    nearestWaterSource: 'Sungai Maro, Sungai Digul & Rawa Pesisir',
    risk: 'moderate',
    fwi: 19.8,
    recommendationSquad: 'BPBD Kab. Merauke, Manggala Agni Daops Merauke & Masyarakat Adat',
    tacticalDirectives: [
      'Gunakan perahu ketinting bermesin tempel untuk memobilisasi pompa apung melalui alur sungai rawa.',
      'Gandeng tetua masyarakat adat marind dalam pemantauan kearifan lokal berburu tanpa membakar sabana.',
      'Lakukan pembasahan dini pada pulau-pulau hutan sagu dan rawa gambut yang mulai surut airnya.',
      'Pantau data hotspot satelit VIIRS malam hari untuk melacak titik bakar di pedalaman tanpa akses darat.'
    ]
  },
  indonesia: {
    id: 'indonesia',
    name: 'Seluruh Indonesia (National Overview)',
    shortLabelId: 'Seluruh Indonesia (Nasional)',
    shortLabelEn: 'National Overview (All Indonesia)',
    island: 'Republik Indonesia',
    khgName: 'Kubah Gambut Prioritas Restorasi Nasional (7 Provinsi Target BRGM & KLHK)',
    peatDepth: '4.5 m (Rata-rata Gambut Nasional 14.9 Juta Ha)',
    isDeepPeat: true,
    tmag: -45,
    kag: 115,
    canalBlocks: 1120,
    nearestWaterSource: 'Jaringan Sungai Utama & Ribuan Sekat Kanal Restorasi BRGM',
    risk: 'extreme',
    fwi: 26.5,
    recommendationSquad: 'Pusat Komando Operasi Nasional Karhutla (KLHK, BNPB, BRGM & TNI/Polri)',
    tacticalDirectives: [
      'Distribusikan alokasi armada helikopter water bombing secara dinamis berbasis peringkat FRP klaster tertinggi.',
      'Koordinasikan posko satgas terpadu di 7 provinsi prioritas (Riau, Jambi, Sumsel, Kalbar, Kalteng, Kalsel, Papua).',
      'Integrasikan telemetri stasiun SIPALAGA BRGM untuk memverifikasi TMAG -40 cm secara real-time.',
      'Terapkan penegakan hukum tegas terhadap korporasi yang membiarkan areal konsesinya mengalami kekeringan dan kebakaran.'
    ]
  }
};

/**
 * Helper to safely get profile by AOI id with fallback to riau/indonesia
 */
export function getRegionalPeatProfile(aoiId: string): RegionalPeatProfile {
  if (REGIONAL_PEAT_PROFILES[aoiId]) {
    return REGIONAL_PEAT_PROFILES[aoiId];
  }
  // Try finding case-insensitive or partial match
  const match = Object.values(REGIONAL_PEAT_PROFILES).find(p => 
    p.id.toLowerCase() === aoiId.toLowerCase() || 
    aoiId.toLowerCase().includes(p.id.toLowerCase())
  );
  return match || REGIONAL_PEAT_PROFILES['riau'];
}

/**
 * Calculates Tactical Fire Triage Level (Level 1 - 4)
 */
export function calculateFireTriage(maxFrp: number, tmag: number, isDeepPeat: boolean): {
  level: 1 | 2 | 3 | 4;
  labelId: string;
  labelEn: string;
  actionId: string;
  actionEn: string;
  colorHex: string;
  badgeClass: string;
} {
  if (maxFrp >= 70 && tmag <= -40 && isDeepPeat) {
    return {
      level: 1,
      labelId: 'LEVEL 1: KRITIS KATASTROPIK (BOM AIR WAJIB)',
      labelEn: 'LEVEL 1: CATASTROPHIC PEAT FIRE (WATER BOMBING MANDATORY)',
      actionId: 'Segera kerahkan Helikopter Water Bombing BNPB. Api membara di kubah gambut dalam dengan energi radiasi sangat masif.',
      actionEn: 'Immediate BNPB Water Bombing Helicopter deployment required. Extreme subsurface peat smoldering in deep dome.',
      colorHex: '#e11d48',
      badgeClass: 'bg-rose-600 text-white border-rose-700'
    };
  } else if (maxFrp >= 35 || tmag <= -40) {
    return {
      level: 2,
      labelId: 'LEVEL 2: SIAGA TINGGI (REGU DARAT + NOZZLE SUNTIK)',
      labelEn: 'LEVEL 2: HIGH PRIORITY (GROUND TROOPS + INJECTION LANCE)',
      actionId: 'Kerahkan regu darat Manggala Agni + MPA dengan tombak suntik gambut (peat lance). Muka air tanah melewati batas aman.',
      actionEn: 'Dispatch Manggala Agni brigades and community patrols with peat injection nozzles. Groundwater table breached.',
      colorHex: '#ea580c',
      badgeClass: 'bg-orange-600 text-white border-orange-700'
    };
  } else if (maxFrp >= 15 || tmag <= -30) {
    return {
      level: 3,
      labelId: 'LEVEL 3: WASPADA MODERAT (PATROLI RUTIN & SEKAT KANAL)',
      labelEn: 'LEVEL 3: MODERATE ALERT (PATROL & CANAL BLOCK CHECK)',
      actionId: 'Inspeksi pintu sekat kanal BRGM dan lakukan pembasahan preventif pada serasah kering batas perimeter.',
      actionEn: 'Inspect BRGM canal gates and perform preventive wetting along perimeter dry litter.',
      colorHex: '#d97706',
      badgeClass: 'bg-amber-600 text-white border-amber-700'
    };
  }
  return {
    level: 4,
    labelId: 'LEVEL 4: TERKENDALI NOMINAL (MONITORING SATELIT)',
    labelEn: 'LEVEL 4: NOMINAL CONTROL (SATELLITE SURVEILLANCE)',
    actionId: 'Kondisi stabil. Lanjutkan pemantauan overpass satelit NASA Terra/Aqua dan NOAA-20 secara berkala.',
    actionEn: 'Stable conditions. Maintain scheduled satellite overpass surveillance.',
    colorHex: '#059669',
    badgeClass: 'bg-emerald-600 text-white border-emerald-700'
  };
}
