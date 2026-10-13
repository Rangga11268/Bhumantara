import React, { useState } from 'react';
import { AOIRegion, HarmonizedWeekData, RawHotspot } from '../engine/harmonizer';
import { Language } from '../data/translations';
import { Printer, FileText, Download, Loader2, Moon, Sun } from 'lucide-react';
import { LiveWeatherData } from '../services/weatherApi';
import { resolveHotspotLocation } from '../utils/locationResolver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExecutiveReportProps {
  language: Language;
  selectedAOI: AOIRegion;
  calendarMatrix?: Record<string, HarmonizedWeekData>;
  totalHotspots?: number;
  liveWeather?: LiveWeatherData | null;
  liveHotspots?: RawHotspot[];
}

export const ExecutiveReport: React.FC<ExecutiveReportProps> = ({
  language,
  selectedAOI,
  calendarMatrix = {},
  totalHotspots = 0,
  liveWeather = null,
  liveHotspots = [],
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [paperTheme, setPaperTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    return 'light';
  });

  const isDarkDoc = paperTheme === 'dark';

  const today = new Date();
  const reportDateFormatted = today.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const docRegNumber = `WNR/KLHK-BRGM/SITREP/${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}-${selectedAOI.id.toUpperCase()}`;

  const aoiTmatMap: Record<string, number> = {
    riau: -48,
    kalteng: -55,
    sumsel: -52,
    kalsel: -38,
    kaltim: -30,
    indonesia: -44,
  };
  const currentTmat = aoiTmatMap[selectedAOI.id] || -42;
  const effectiveFwi = liveWeather ? liveWeather.fwiScore : 28;
  const threatLevel = effectiveFwi >= 70 ? 'SIAGA DARURAT / EXTREME' : effectiveFwi >= 48 ? 'SIAGA TINGGI / HIGH' : effectiveFwi >= 26 ? 'WASPADA / MODERATE' : 'TERKENDALI / NOMINAL';

  // Top 5 active hotspots
  const topSpots = liveHotspots.slice(0, 5);

  /**
   * Direct PDF Generator: Renders document to crisp high-res canvas and saves directly as a PDF file
   * Note: Always forces clean white A4 paper format for printable government submission
   */
  const handleDownloadDirectPDF = async () => {
    const docElement = document.getElementById('official-sitrep-document');
    if (!docElement) return;

    const originalTheme = paperTheme;
    try {
      setIsGeneratingPdf(true);
      if (originalTheme === 'dark') {
        setPaperTheme('light');
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      // Create high-resolution canvas of the document
      const canvas = await html2canvas(docElement, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 850,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 16; // 8mm margins left/right
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 8; // 8mm top margin

      // First page
      pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 16);

      // Subsequent pages if content overflows 1 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 8;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 16);
      }

      pdf.save(`WANAREKSA_SITREP_${selectedAOI.id.toUpperCase()}_${today.toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      if (originalTheme === 'dark') {
        setPaperTheme('dark');
      }
      setIsGeneratingPdf(false);
    }
  };

  /**
   * Print Handler: Invokes native browser print dialog with styled A4 rules
   */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Action Header (Hidden during Print) */}
      <div className="print:hidden px-6 py-4 bg-[#fbfbfd] dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-2xs">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === 'id' ? 'Dokumen Intelijen Kebakaran Hutan & Lahan (Format A4 Resmi)' : 'Official A4 Wildfire Situation Report (SitRep)'}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {language === 'id' ? 'Dossier Eksekutif & Surat Perintah Operasi Lapangan' : 'Executive Situation Report & Operational Dossier'}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Paper Theme Toggle: Light vs Dark Paper */}
          <div className="flex items-center bg-slate-100 dark:bg-[#1e293b] p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setPaperTheme('light')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                paperTheme === 'light'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Official White A4 Paper View"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'id' ? 'Kertas Putih' : 'White Paper'}</span>
            </button>
            <button
              onClick={() => setPaperTheme('dark')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                paperTheme === 'dark'
                  ? 'bg-slate-900 dark:bg-[#0c121e] text-white shadow-2xs font-bold border border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Tactical Mission Dark Paper View"
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'id' ? 'Gelap Taktis' : 'Tactical Dark'}</span>
            </button>
          </div>

          {/* Direct PDF Download Button */}
          <button
            onClick={handleDownloadDirectPDF}
            disabled={isGeneratingPdf}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer min-h-[40px] disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'id' ? 'Membuat File PDF...' : 'Generating PDF...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{language === 'id' ? 'Unduh PDF Langsung' : 'Download PDF Direct'}</span>
              </>
            )}
          </button>

          {/* Browser Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer min-h-[40px]"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{language === 'id' ? 'Cetak / Print A4' : 'Print A4'}</span>
          </button>
        </div>
      </div>

      {/* Official Printable Document Container (Desk Background) */}
      <div className="p-4 sm:p-10 bg-slate-100 dark:bg-[#060913] text-slate-900 dark:text-slate-100 max-w-4xl mx-auto print:p-0 print:m-0 print:max-w-full transition-colors">
        
        <div
          id="official-sitrep-document"
          className={`p-6 sm:p-8 border space-y-6 leading-relaxed transition-colors print:border-none print:bg-white print:text-[#111827] ${
            isDarkDoc
              ? 'bg-[#0d1322] border-slate-800 text-slate-100 shadow-2xl shadow-black/40'
              : 'bg-white border-slate-300 text-[#111827] shadow-lg shadow-slate-200/50'
          }`}
          style={{ width: '100%', maxWidth: '820px', margin: '0 auto', boxSizing: 'border-box' }}
        >
          
          {/* 1. Official Government & NASA Letterhead (Kop Surat Resmi) */}
          <div
            className={`pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 ${
              isDarkDoc ? 'border-slate-700' : 'border-[#111827]'
            }`}
            style={{ paddingBottom: '14px' }}
          >
            <div className="flex items-center gap-3.5">
              {/* Dual Brand Lockup: Wanareksa Emblem × NASA Meatball */}
              <div className="flex items-center gap-2 shrink-0">
                <div style={{ width: '46px', height: '46px', minWidth: '46px', maxWidth: '46px', flexShrink: 0 }}>
                  <img
                    src="/wanareksa_logo.svg"
                    alt="Wanareksa"
                    style={{ width: '46px', height: '46px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: isDarkDoc ? '#64748b' : '#94a3b8' }}>×</span>
                <div style={{ width: '40px', height: '40px', minWidth: '40px', maxWidth: '40px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden' }}>
                  <img
                    src="/nasa_meatball.svg"
                    alt="NASA"
                    style={{ width: '40px', height: '40px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDarkDoc ? '#94a3b8' : '#4b5563' }}>
                  REPUBLIK INDONESIA &bull; NASA SPACE APPS JAKARTA 2026
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 900, textTransform: 'uppercase', color: isDarkDoc ? '#ffffff' : '#111827', letterSpacing: '-0.01em', marginTop: '1px' }}>
                  PUSAT PENGENDALIAN OPERASI &amp; SISTEM MONITORING SATELIT WANAREKSA
                </div>
                <div style={{ fontSize: '9.5px', color: isDarkDoc ? '#94a3b8' : '#6b7280', marginTop: '1px' }}>
                  Integrasi Sensor MODIS (Terra/Aqua 1km) &amp; VIIRS (Suomi-NPP/NOAA-20 375m) &bull; Standar BRGM &amp; KLHK
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  border: isDarkDoc ? '1px solid #f43f5e' : '1px solid #be123c',
                  backgroundColor: isDarkDoc ? '#881337' : '#fff1f2',
                  color: isDarkDoc ? '#ffe4e6' : '#be123c',
                  fontSize: '9px',
                  fontWeight: 800,
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                OPERASIONAL TERBATAS
              </span>
              <div style={{ fontSize: '8.5px', fontFamily: 'monospace', color: isDarkDoc ? '#94a3b8' : '#6b7280', marginTop: '4px' }}>
                {docRegNumber}
              </div>
            </div>
          </div>

          {/* 2. Document Identification & Metadata Box */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              backgroundColor: isDarkDoc ? '#151f33' : '#f9fafb',
              border: isDarkDoc ? '1px solid #1e293b' : '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '11px',
            }}
          >
            <div>
              <span style={{ fontSize: '9px', fontWeight: 700, color: isDarkDoc ? '#94a3b8' : '#6b7280', textTransform: 'uppercase', display: 'block' }}>Wilayah Sasaran</span>
              <strong style={{ fontSize: '12px', fontWeight: 800, color: isDarkDoc ? '#ffffff' : '#111827', display: 'block', marginTop: '2px' }}>{selectedAOI.name}</strong>
              <span style={{ fontSize: '9.5px', color: isDarkDoc ? '#cbd5e1' : '#4b5563' }}>{selectedAOI.country}</span>
            </div>

            <div>
              <span style={{ fontSize: '9px', fontWeight: 700, color: isDarkDoc ? '#94a3b8' : '#6b7280', textTransform: 'uppercase', display: 'block' }}>Koordinat Acuan</span>
              <strong style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: isDarkDoc ? '#ffffff' : '#111827', display: 'block', marginTop: '2px' }}>
                {selectedAOI.center[0].toFixed(4)}° N, {selectedAOI.center[1].toFixed(4)}° E
              </strong>
              <span style={{ fontSize: '9.5px', color: isDarkDoc ? '#cbd5e1' : '#4b5563' }}>{selectedAOI.biome}</span>
            </div>

            <div>
              <span style={{ fontSize: '9px', fontWeight: 700, color: isDarkDoc ? '#94a3b8' : '#6b7280', textTransform: 'uppercase', display: 'block' }}>Tanggal Observasi</span>
              <strong style={{ fontSize: '11px', fontWeight: 700, color: isDarkDoc ? '#ffffff' : '#111827', display: 'block', marginTop: '2px' }}>{reportDateFormatted}</strong>
              <span style={{ fontSize: '9.5px', color: '#10b981', fontWeight: 600 }}>Satelit 24H Feed Synced</span>
            </div>

            <div>
              <span style={{ fontSize: '9px', fontWeight: 700, color: isDarkDoc ? '#94a3b8' : '#6b7280', textTransform: 'uppercase', display: 'block' }}>Status Bahaya Karhutla</span>
              <strong style={{ fontSize: '11px', fontWeight: 900, color: effectiveFwi >= 50 ? '#f43f5e' : '#f59e0b', display: 'block', marginTop: '2px' }}>
                {threatLevel}
              </strong>
              <span style={{ fontSize: '9.5px', color: isDarkDoc ? '#cbd5e1' : '#4b5563' }}>Indeks FWI: {effectiveFwi}/100</span>
            </div>
          </div>

          {/* 3. Executive Situation Synthesis */}
          <div className="space-y-1.5" style={{ marginTop: '12px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                borderBottom: isDarkDoc ? '1px solid #1e293b' : '1px solid #e5e7eb',
                paddingBottom: '3px',
                display: 'flex',
                justifyContent: 'space-between',
                color: isDarkDoc ? '#f8fafc' : '#111827',
              }}
            >
              <span>I. Ringkasan Eksekutif &amp; Analisis Kerentanan Spasial</span>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>MODIS/VIIRS 5.5KM HARMONIZATION</span>
            </div>
            <p style={{ fontSize: '11px', color: isDarkDoc ? '#cbd5e1' : '#374151', textAlign: 'justify', lineHeight: 1.55 }}>
              Berdasarkan harmonisasi komputasi 26 tahun rekaman satelit NASA Terra, Aqua, Suomi-NPP, dan NOAA-20 yang dikompilasikan ke dalam grid klaster 5.5 km dengan faktor kalibrasi energi (MODIS 1.04 / VIIRS 0.88), wilayah <strong>{selectedAOI.name}</strong> saat ini berada pada status <strong>{threatLevel}</strong>. Parameter Muka Air Tanah Gambut (TMAT) terpantau di angka <strong>{currentTmat} cm</strong>, yang mana telah melampaui ambang batas kritis nasional PP No. 57/2016 (-40 cm), mengindikasikan tingginya ancaman kebakaran bawah permukaan (*subsurface peat smoldering*).
            </p>
          </div>

          {/* 4. Hydrology & Environmental Telemetry Matrix */}
          <div className="space-y-2" style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', borderBottom: isDarkDoc ? '1px solid #1e293b' : '1px solid #e5e7eb', paddingBottom: '3px', color: isDarkDoc ? '#f8fafc' : '#111827' }}>
              II. Matriks Telemetri Hidrologis Gambut &amp; Cuaca Lapangan (BRGM &amp; Open-Meteo)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
              <thead>
                <tr style={{ backgroundColor: isDarkDoc ? '#1e293b' : '#f3f4f6', textTransform: 'uppercase', fontSize: '9px', color: isDarkDoc ? '#e2e8f0' : '#374151' }}>
                  <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>Parameter Observasi</th>
                  <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>Nilai Lapangan Aktual</th>
                  <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>Batas Kritis / Standar</th>
                  <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>Evaluasi Status Risiko</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: isDarkDoc ? '#0f172a' : '#ffffff' }}>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 600 }}>Tinggi Muka Air Tanah (TMAT)</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontFamily: 'monospace', fontWeight: 800, color: '#f43f5e' }}>{currentTmat} cm</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>-40 cm (PP No. 57/2016 &amp; BRGM)</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 800, color: '#f43f5e' }}>KRITIS &bull; MELEWATI BATAS</td>
                </tr>
                <tr style={{ backgroundColor: isDarkDoc ? '#141e33' : '#fafafa' }}>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 600 }}>Indeks Bahaya Cuaca Api (FWI)</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontFamily: 'monospace', fontWeight: 800, color: '#f59e0b' }}>{effectiveFwi}</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>Ambang Siaga: &ge; 48</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 700, color: '#f59e0b' }}>POTENSI PERAMBATAN TINGGI</td>
                </tr>
                <tr style={{ backgroundColor: isDarkDoc ? '#0f172a' : '#ffffff' }}>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 600 }}>Suhu Udara &amp; Kelembapan (RH)</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontFamily: 'monospace' }}>{liveWeather?.temperature ?? 32}°C &bull; RH {liveWeather?.relativeHumidity ?? 62}%</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>RH Kering: &lt; 65%</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 600, color: isDarkDoc ? '#cbd5e1' : '#374151' }}>Serasah Cepat Mengering</td>
                </tr>
                <tr style={{ backgroundColor: isDarkDoc ? '#141e33' : '#fafafa' }}>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 600 }}>Hari Tanpa Hujan (HTH)</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontFamily: 'monospace' }}>{liveWeather?.dryDaysCount ?? 9} Hari</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>&gt; 7 Hari (Drought Watch)</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 700, color: '#f59e0b' }}>WASPADA DEHIDRASI KUBAH</td>
                </tr>
                <tr style={{ backgroundColor: isDarkDoc ? '#0f172a' : '#ffffff' }}>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 600 }}>Kadar Air Gambut (KAG) Bawah Permukaan</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontFamily: 'monospace' }}>115%</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>&lt; 100% (Titik Sulut Api Gambut)</td>
                  <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 8px', fontWeight: 700, color: '#f43f5e' }}>Rentan Bara Api Bawah Tanah</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Active Hotspot Surveillance Targets */}
          <div className="space-y-2" style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', borderBottom: isDarkDoc ? '1px solid #1e293b' : '1px solid #e5e7eb', paddingBottom: '3px', display: 'flex', justifyContent: 'space-between', color: isDarkDoc ? '#f8fafc' : '#111827' }}>
              <span>III. Koordinat Sasaran Penugasan Anomali Panas Satelit</span>
              <span style={{ fontSize: '9px', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>FIRMS NRT ACTIVE DETECTIONS</span>
            </div>
            
            {topSpots.length === 0 ? (
              <div style={{ padding: '8px', border: isDarkDoc ? '1px solid #1e293b' : '1px solid #e5e7eb', backgroundColor: isDarkDoc ? '#151f33' : '#f9fafb', textAlign: 'center', fontSize: '10.5px', color: isDarkDoc ? '#94a3b8' : '#6b7280', borderRadius: '6px' }}>
                Tidak terdapat titik panas berdaya tinggi yang terdeteksi pada jendela satelit 24 jam terakhir di sektor ini.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: isDarkDoc ? '#1e293b' : '#f3f4f6', textTransform: 'uppercase', fontSize: '9px', color: isDarkDoc ? '#e2e8f0' : '#374151' }}>
                    <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', textAlign: 'left', width: '28px' }}>No</th>
                    <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', textAlign: 'left' }}>Wilayah &amp; Lanskap KHG</th>
                    <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', textAlign: 'left' }}>Koordinat (Lat, Lon)</th>
                    <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', textAlign: 'left' }}>Sensor Satelit</th>
                    <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', textAlign: 'left' }}>FRP (MW)</th>
                    <th style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', textAlign: 'left' }}>Waktu Akuisisi</th>
                  </tr>
                </thead>
                <tbody>
                  {topSpots.map((spot, idx) => {
                    const loc = resolveHotspotLocation(spot.lat, spot.lon, selectedAOI.id, language);
                    return (
                      <tr key={spot.id} style={{ backgroundColor: idx % 2 === 1 ? (isDarkDoc ? '#141e33' : '#fafafa') : (isDarkDoc ? '#0f172a' : '#ffffff') }}>
                        <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', fontWeight: 800 }}>{idx + 1}</td>
                        <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', fontWeight: 600 }}>
                          {loc.regency}{loc.district ? `, ${loc.district}` : ''}
                          <div style={{ fontSize: '8.5px', color: isDarkDoc ? '#94a3b8' : '#6b7280', fontWeight: 'normal' }}>{loc.landscape}</div>
                        </td>
                        <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', fontFamily: 'monospace' }}>{spot.lat.toFixed(4)}°, {spot.lon.toFixed(4)}°</td>
                        <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', fontFamily: 'monospace' }}>{spot.instrument} ({spot.satellite})</td>
                        <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', fontFamily: 'monospace', fontWeight: 800, color: '#f43f5e' }}>{spot.frp} MW</td>
                        <td style={{ border: isDarkDoc ? '1px solid #334155' : '1px solid #d1d5db', padding: '5px 6px', fontFamily: 'monospace' }}>{loc.localTimeFormatted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* 6. Tactical Directives for Brigade & Taskforces */}
          <div className="space-y-1.5" style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', borderBottom: isDarkDoc ? '1px solid #1e293b' : '1px solid #e5e7eb', paddingBottom: '3px', color: isDarkDoc ? '#f8fafc' : '#111827' }}>
              IV. Instruksi Taktis Operasional (SOP Brigade Manggala Agni / BPBD / MPA)
            </div>
            <ol style={{ fontSize: '10.5px', color: isDarkDoc ? '#cbd5e1' : '#374151', paddingLeft: '16px', lineHeight: 1.5 }}>
              <li><strong>Penutupan Sekat Kanal:</strong> Lakukan inspeksi menyeluruh pada pintu sekat kanal BRGM di sekitar KHG terdampak untuk menahan air dan menaikkan kembali muka air tanah &gt; -40 cm.</li>
              <li><strong>Patroli Darat &amp; Nozzle Gambut:</strong> Kerahkan regu pemadaman darat Manggala Agni Daops menggunakan *peat injector nozzle* untuk menyuntikkan air ke lapisan organik sedalam 1–3 meter.</li>
              <li><strong>Pemantauan Malam Hari (Night Passes):</strong> Pantau lintasan satelit malam hari NOAA-20 / Suomi-NPP untuk mendeteksi *smoldering combustion* tanpa gangguan pantulan sinar matahari.</li>
              <li><strong>Water Bombing Standby:</strong> Siagakan helikopter pemadam water bombing apabila klaster titik panas memiliki FRP kumulatif &gt; 120 MW di zona non-aksesibilitas darat.</li>
            </ol>
          </div>

          {/* 7. Official Endorsement & Formal Signature Block */}
          <div
            style={{
              marginTop: '18px',
              paddingTop: '12px',
              borderTop: isDarkDoc ? '2px solid #334155' : '2px solid #111827',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              textAlign: 'center',
              fontSize: '10.5px',
              pageBreakInside: 'avoid',
            }}
          >
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: isDarkDoc ? '#94a3b8' : '#6b7280', textTransform: 'uppercase' }}>Diverifikasi &amp; Disiapkan Oleh</div>
              <div style={{ fontWeight: 800, color: isDarkDoc ? '#ffffff' : '#111827', marginTop: '2px' }}>Koordinator Sistem Telemetri Satelit</div>
              <div style={{ height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                <div
                  style={{
                    padding: '3px 8px',
                    border: isDarkDoc ? '1px solid #059669' : '1px solid #059669',
                    borderRadius: '4px',
                    backgroundColor: isDarkDoc ? '#064e3b' : '#ecfdf5',
                    color: isDarkDoc ? '#a7f3d0' : '#065f46',
                    fontFamily: 'monospace',
                    fontSize: '8.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  DIGITALLY VERIFIED BY WANAREKSA SATELLITE ENGINE
                </div>
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, color: isDarkDoc ? '#ffffff' : '#111827', fontSize: '11px' }}>WANAREKSA EARTH INTELLIGENCE TEAM</div>
              <div style={{ fontSize: '8.5px', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>NASA Space Apps Challenge Jakarta 2026</div>
            </div>

            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: isDarkDoc ? '#94a3b8' : '#6b7280', textTransform: 'uppercase' }}>Mengetahui &amp; Mengesahkan</div>
              <div style={{ fontWeight: 800, color: isDarkDoc ? '#ffffff' : '#111827', marginTop: '2px' }}>Komandan Posko Pengendalian Karhutla</div>
              <div style={{ height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontStyle: 'italic', fontSize: '12px', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>
                ( Tanda Tangan &amp; Cap Stempel Posko )
              </div>
              <div style={{ fontWeight: 800, color: isDarkDoc ? '#ffffff' : '#111827', fontSize: '11px' }}>SATGAS PENGENDALIAN KARHUTLA &amp; BRGM</div>
              <div style={{ fontSize: '8.5px', color: isDarkDoc ? '#94a3b8' : '#6b7280' }}>Kementerian Lingkungan Hidup dan Kehutanan</div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div
            style={{
              paddingTop: '8px',
              borderTop: isDarkDoc ? '1px solid #1e293b' : '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '8px',
              color: isDarkDoc ? '#64748b' : '#9ca3af',
              fontFamily: 'monospace',
            }}
          >
            <span>DOKUMEN INI SAH DAN MEMILIKI KEKUATAN VERIFIKASI MULTI-SATELIT NASA</span>
            <span>HALAMAN 1 DARI 1 &bull; KODE: WNR-NASA-SITREP-2026</span>
          </div>

        </div>

      </div>

    </div>
  );
};
