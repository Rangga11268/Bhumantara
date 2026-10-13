<div align="center">

  <img src="public/wanareksa_logo.svg" alt="Wanareksa Emblem" width="130" height="130" />

  # WANAREKSA
  ### Planetary Multi-Sensor Climatology & Indonesian Tropical Peatland Intelligence Suite
  ### Platform Harmonisasi Satelit Observasi Bumi & Intelijen Gambut Tropis Multi-Dekade

  [![NASA Space Apps Challenge](https://img.shields.io/badge/NASA_Space_Apps-2026_Global_Challenge-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)](https://www.spaceappschallenge.org/)
  [![Challenge Category](https://img.shields.io/badge/Challenge-MODIS_&_VIIRS_Harmonization-EA580C?style=for-the-badge)](https://www.spaceappschallenge.org/)
  [![Live Satellite Data](https://img.shields.io/badge/Data_Feed-NASA_FIRMS_NRT_&_GIBS-10B981?style=for-the-badge)](https://firms.modaps.eosdis.nasa.gov/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

  <p align="center">
    <strong>[ <a href="#-english">English</a> | <a href="#-bahasa-indonesia">Bahasa Indonesia</a> ]</strong>
  </p>

</div>

---

# 🇬🇧 English

## Executive Summary

**Wanareksa**—derived from Old Javanese/Kawi for **Rainforest (*Wana*)** and **Sentinel Guardian (*Reksa*)**—is an authoritative planetary climatology system developed for the NASA Space Apps Challenge 2026.

For over two decades, NASA Earth Observation satellites have tracked global active fire events:
1. **MODIS (Terra & Aqua)**: 1.0 km nadir footprint, operational since 2000.
2. **VIIRS (Suomi-NPP & NOAA-20)**: 375 m nadir footprint, operational since 2012.

Because VIIRS provides an observational ground footprint approximately **7 times smaller** than MODIS, a single contiguous tropical peatland fire front registers as **3 to 7 separate raw VIIRS detections**. 

Without mathematical and spatial harmonization, raw historical archives create a dangerous statistical illusion: **wildfire frequency appears to artificially triple post-2012**. This distorts long-term climate baselines, carbon emission accounting, and national peatland restoration policies across Indonesia's **14.9 million hectares of fragile peat dome ecosystems**.

**Wanareksa** resolves this distortion through:
* **5.5 km equal-area spatial binning** (neutralizing sensor footprint overcounting)
* **Stefan-Boltzmann Fire Radiative Power (FRP) cross-sensor calibration**
* **In-situ hydrological coupling with BRGM statutory Peat Water Table depths ($TMAG < -40\text{ cm}$)**
* **Frontline rapid-response dispatch pipelines** (instant WhatsApp SitRep formatting & RFC 7946 open GeoJSON GIS exports)

---

## Key Modules & Platform Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   WANAREKSA ARCHITECTURE                                 │
├────────────────────────────┬────────────────────────────┬────────────────────────────────┤
│    🛰️ SENSOR HARMONIZATION  │    🗺️ GIS & INTELLIGENCE   │    🛡️ MITIGATION & PROGNOSIS   │
├────────────────────────────┼────────────────────────────┼────────────────────────────────┤
│ • 5.5 km Spatial Binning   │ • Sovereign Boundary Lock  │ • NASA FIRMS NRT 24h Live Feed │
│ • Stefan-Boltzmann FRP     │   (Indonesia Archipelago)  │ • BRGM Peat Hydrology Physics  │
│ • 26-Year Climatology      │ • 2000-2026 Epoch Matrix   │ • 500-Run Monte Carlo Lab      │
│ • Optical Footprint Visual │ • Dual-Map Sensor Sync     │ • 1-Click Executive SitRep PDF │
│   Interactive Demonstrator │ • Custom Polygon Inspector │ • Frontline WhatsApp SitRep    │
└────────────────────────────┴────────────────────────────┴────────────────────────────────┘
```

### 1. Multi-Decadal Sensor Harmonization Core
- **5.5 km Equal-Area Grid Clustering**: Aggregates fragmented sub-pixel detections from overlapping satellite passes into discrete physical fire events ($A \approx 26.2\text{ km}^2$).
- **Radiometric FRP Normalization**:
  $$\text{FRP}_{\text{calibrated}} = (\text{FRP}_{\text{MODIS}} \times 1.00) + (\text{FRP}_{\text{VIIRS}} \times 0.88)$$
- **Burning Activity Index (BAI)**: Normalizes cluster density and thermal radiative flux onto a standardized 0–100 severity metric.
- **Statistical Anomaly Detection (Z-Score)**: Evaluates weekly fire activity against 26-year running baseline averages to flag catastrophic climate anomalies ($Z > +2.0\sigma$, e.g., 2015 Super El Niño and 2019 positive IOD).

### 2. Indonesian Archipelago GIS & Spatial Intelligence
- **Sovereign Boundary Lock**: Restricts navigation precisely to the Indonesian equatorial archipelago (`[-11.5° S, 94.0° E]` to `[6.5° N, 141.5° E]`) with zero map wander.
- **26-Year Historical Climatology Matrix**: 52-week annual matrix spanning 2000 to 2026, complete with 1-click disaster benchmarks (*2015 Super El Niño, 2019 IOD+, 2023 El Niño, 2022-2026 Restoration Era*).
- **Synchronized Dual-Map Comparator**: Real-time side-by-side inspection contrasting raw multi-sensor telemetry against calibrated clusters.
- **Peat Dome Polygon Inspector**: Interactive vector polygon tool delivering instant area calculations, total Megawatt output, and sub-surface smoldering risk assessments.

### 3. Frontline Mitigation Hub & Peat Hydrology
- **BRGM Peat Hydrology Physics**: Evaluates statutory Groundwater Table depth (TMAG) against the critical $-40\text{ cm}$ statutory boundary, smoldering burn depth, and carbon emissions ($1.75\text{ Gt CO}_2\text{e}$ peak benchmark).
- **Manggala Agni Dispatch Generator**: 1-click automated WhatsApp / SMS dispatch summaries detailing exact coordinates, regency names, and peat dome vulnerability indicators.
- **Executive SitRep Dossier**: High-resolution, printable A4 PDF reporting generated directly client-side via `jsPDF` and `html2canvas`.
- **Open Geospatial Interoperability**: Full export compatibility supporting RFC 7946 standard GeoJSON and calibrated CSV formats.

---

## Tech Stack & Design Standards

| Layer | Technologies |
|---|---|
| **Core Framework** | React 18.3, TypeScript 5.7, Vite 6.1 |
| **Design System** | Tailwind CSS 3.4, Strict Anti-Slop Guidelines, WCAG AA Verified Contrast |
| **Mapping & GIS** | Leaflet 1.9, CartoDB Voyager, Esri World Imagery |
| **Data Analytics** | Recharts 3.10 (Multi-series Area, Composed Bars, Polar Radar) |
| **Document Generation** | jsPDF 4.2, html2canvas 1.4, DOMPurify |
| **Live APIs** | NASA FIRMS REST API, Open-Meteo Planetary Telemetry |
| **Internationalization** | Comprehensive Bilingual Architecture (Bahasa Indonesia & English) |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Rangga11268/Wanareksa.git
cd Wanareksa

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev

# 4. Compile production build
npm run build
```

---

# 🇮🇩 Bahasa Indonesia

## Ringkasan Eksekutif

**Wanareksa**—berasal dari bahasa Jawa Kuno/Kawi untuk **Rimba Belantara (*Wana*)** dan **Sang Penjaga (*Reksa*)**—adalah platform intelijen dan harmonisasi data satelit multi-dekade untuk NASA Space Apps Challenge 2026.

Selama lebih dari dua dekade, satelit observasi bumi NASA telah memantau titik api kebakaran global:
1. **MODIS (Terra & Aqua)**: Resolusi piksel 1.0 km, beroperasi sejak tahun 2000.
2. **VIIRS (Suomi-NPP & NOAA-20)**: Resolusi piksel 375 m, beroperasi sejak tahun 2012.

Karena sensor VIIRS memiliki jejak optik **7 kali lebih rapat** daripada MODIS, satu garis kebakaran gambut tunggal terdeteksi sebagai **3 hingga 7 titik deteksi terpisah** pada data mentah VIIRS.

Tanpa harmonisasi matematis dan spasial, data historis mentah menciptakan ilusi statistik yang berbahaya: **frekuensi kebakaran hutan seolah-olah melonjak 300% pasca-2012**. Hal ini mendistorsi data acuan iklim jangka panjang dan perencanaan anggaran restorasi pada **14.9 juta hektar ekosistem kubah gambut Indonesia**.

**Wanareksa** menyelesaikan distorsi ini melalui:
* **Agregasi spasial sel 5.5 km equal-area** (menghilangkan overcounting pergantian sensor)
* **Kalibrasi daya radiasi termal Stefan-Boltzmann FRP (Megawatt)**
* **Korelasi hidrologi gambut nyata dengan batas kritis Tinggi Muka Air Gambut BRGM (TMAG < -40 cm)**
* **Pipeline aksi cepat lapangan** (generator disposisi WhatsApp regu Manggala Agni & ekspor terbuka GeoJSON standar RFC 7946)

---

## Hak Cipta & Lisensi

Dikembangkan dengan bangga oleh **Tim Wanareksa** untuk **NASA Space Apps Challenge 2026**.  
Didistribusikan di bawah lisensi terbuka [MIT License](LICENSE).
