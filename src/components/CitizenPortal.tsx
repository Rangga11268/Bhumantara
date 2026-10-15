import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AOIRegion, PRESET_AOIS, RawHotspot } from '../engine/harmonizer';
import { Language } from '../data/translations';
import { resolveHotspotLocation, getIndonesianLocalTime, DetailedLocationInfo } from '../utils/locationResolver';
import { fetchLiveWeather, LiveWeatherData } from '../services/weatherApi';
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
  Share2,
  Layers,
  Sparkles,
  Compass,
  ThermometerSun,
  ShieldCheck,
  Maximize2,
  Navigation,
  Crosshair,
  ExternalLink,
  Locate,
  X
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

  // Interactive Layperson Map Reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const labelsTileRef = useRef<L.TileLayer | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);

  // Basemap & Weather State
  const [mapBasemap, setMapBasemap] = useState<'satellite_labeled' | 'streets' | 'dark'>('satellite_labeled');
  const [hotspotFilter, setHotspotFilter] = useState<'all' | 'severe' | 'moderate'>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<{
    spot: RawHotspot;
    loc: DetailedLocationInfo;
    localTime: { timeFormatted: string; tz: string };
  } | null>(null);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);

  // Fetch real-time weather & wind for selected region
  useEffect(() => {
    let isMounted = true;
    fetchLiveWeather(selectedAOI.center[0], selectedAOI.center[1], selectedAOI.id)
      .then((data) => {
        if (isMounted) setLiveWeather(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [selectedAOI]);

  // Highest FRP hotspot in active region
  const highestHotspot = useMemo(() => {
    if (regionalHotspots.length === 0) return null;
    return [...regionalHotspots].sort((a, b) => b.frp - a.frp)[0];
  }, [regionalHotspots]);

  // Filtered hotspots for high-density canvas rendering (up to 1,000 points)
  const mapHotspots = useMemo(() => {
    let list = regionalHotspots;
    if (hotspotFilter === 'severe') {
      list = list.filter((h) => h.frp >= 35 || h.brightness >= 335);
    } else if (hotspotFilter === 'moderate') {
      list = list.filter((h) => h.frp >= 15);
    }
    const sorted = [...list].sort((a, b) => b.frp - a.frp);
    return sorted.slice(0, 1000);
  }, [regionalHotspots, hotspotFilter]);

  // Quick jump helper
  const handleFlyTo = (lat: number, lng: number, zoom = 9) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  // Populate citizen report from selected hotspot
  const handleUseHotspotForReport = (spot: RawHotspot, loc: DetailedLocationInfo) => {
    setCoords({ lat: spot.lat, lng: spot.lon });
    setUserLocationNote(`${loc.regency}, ${loc.district ? `Kec. ${loc.district}` : ''} (${loc.landscape})`);
    const reportSection = document.getElementById('citizen-whatsapp-report');
    if (reportSection) {
      reportSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic quick-jump chips per region
  const quickChips = useMemo(() => {
    if (selectedAOI.id === 'riau') {
      return [
        { label: 'Bengkalis & Siak', lat: 1.25, lng: 102.10, zoom: 9 },
        { label: 'Dumai & Rokan Hilir', lat: 1.68, lng: 101.44, zoom: 9 },
        { label: 'Pelalawan & Kampar', lat: 0.35, lng: 101.85, zoom: 9 },
      ];
    }
    if (selectedAOI.id === 'kalteng') {
      return [
        { label: 'Pulang Pisau (Sebangau)', lat: -2.75, lng: 114.05, zoom: 9 },
        { label: 'Palangka Raya', lat: -2.21, lng: 113.92, zoom: 9 },
        { label: 'Kotawaringin Timur (Sampit)', lat: -2.53, lng: 112.95, zoom: 9 },
      ];
    }
    if (selectedAOI.id === 'sumsel') {
      return [
        { label: 'Ogan Komering Ilir (OKI)', lat: -3.40, lng: 105.00, zoom: 9 },
        { label: 'Banyuasin & Sembilang', lat: -2.50, lng: 104.75, zoom: 9 },
        { label: 'Musi Banyuasin', lat: -2.89, lng: 103.81, zoom: 9 },
      ];
    }
    return [
      { label: 'Riau (Gambut Sumatera)', lat: 0.50, lng: 101.50, zoom: 7 },
      { label: 'Kalteng (Gambut Biosfer)', lat: -2.20, lng: 113.80, zoom: 7 },
      { label: 'Sumsel (Basin OKI)', lat: -3.00, lng: 104.50, zoom: 7 },
      { label: 'Kalbar (Ketapang)', lat: -1.50, lng: 110.30, zoom: 7 },
    ];
  }, [selectedAOI]);

  // Initialize Citizen Friendly Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      canvasRendererRef.current = L.canvas({ padding: 0.5 });

      const map = L.map(mapContainerRef.current, {
        center: selectedAOI.center,
        zoom: Math.max(selectedAOI.zoom - 1, 6),
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(selectedAOI.center, Math.max(selectedAOI.zoom - 1, 6));
    }
  }, [selectedAOI]);

  // Switch basemap tiles with explicit reference labels
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileRef.current) {
      map.removeLayer(baseTileRef.current);
      baseTileRef.current = null;
    }
    if (labelsTileRef.current) {
      map.removeLayer(labelsTileRef.current);
      labelsTileRef.current = null;
    }

    if (mapBasemap === 'satellite_labeled') {
      baseTileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, attribution: 'Esri World Imagery' }
      ).addTo(map);

      labelsTileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, pane: 'overlayPane' }
      ).addTo(map);
    } else if (mapBasemap === 'streets') {
      baseTileRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '&copy; OpenStreetMap' }
      ).addTo(map);
    } else {
      baseTileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, attribution: 'Esri Dark' }
      ).addTo(map);

      labelsTileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, pane: 'overlayPane' }
      ).addTo(map);
    }
  }, [mapBasemap]);

  // Render Hotspots & Wind Spread Cones onto Canvas
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    const canvas = canvasRendererRef.current;
    if (!map || !layerGroup || !canvas) return;

    layerGroup.clearLayers();

    // Render wind spread threat cones from severe fire clusters
    if (liveWeather && liveWeather.windDirectionDeg !== undefined) {
      const windDeg = liveWeather.windDirectionDeg;
      const targetDeg = (windDeg + 180) % 360;
      const targetRad = (targetDeg * Math.PI) / 180;
      const apertureRad = (28 * Math.PI) / 180;
      const coneLength = 0.16;

      mapHotspots.slice(0, 6).forEach((spot) => {
        if (spot.frp < 30) return;
        const apex: [number, number] = [spot.lat, spot.lon];
        const p1: [number, number] = [
          spot.lat + coneLength * Math.cos(targetRad - apertureRad),
          spot.lon + coneLength * Math.sin(targetRad - apertureRad),
        ];
        const pMid: [number, number] = [
          spot.lat + coneLength * 1.2 * Math.cos(targetRad),
          spot.lon + coneLength * 1.2 * Math.sin(targetRad),
        ];
        const p2: [number, number] = [
          spot.lat + coneLength * Math.cos(targetRad + apertureRad),
          spot.lon + coneLength * Math.sin(targetRad + apertureRad),
        ];

        L.polygon([apex, p1, pMid, p2], {
          color: '#f97316',
          fillColor: '#ea580c',
          fillOpacity: 0.16,
          weight: 1,
          dashArray: '3, 4',
          renderer: canvas,
        }).addTo(layerGroup);
      });
    }

    // Render Markers with High-Contrast Canvas
    mapHotspots.forEach((h) => {
      const isSevere = h.frp >= 40 || h.brightness >= 335;
      const isModerate = h.frp >= 15;
      const color = isSevere ? '#ef4444' : isModerate ? '#f97316' : '#eab308';
      const radius = isSevere ? 5.5 : isModerate ? 3.8 : 2.5;

      const marker = L.circleMarker([h.lat, h.lon], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: isSevere ? 1.5 : 0.6,
        opacity: 0.95,
        fillOpacity: 0.92,
        renderer: canvas,
      });

      const loc = resolveHotspotLocation(h.lat, h.lon, selectedAOI.id, language);
      const localTime = getIndonesianLocalTime(h.date, h.time, h.lon);
      const tempC = (h.brightness - 273.15).toFixed(1);

      marker.on('click', () => {
        setSelectedHotspot({ spot: h, loc, localTime });
      });

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; min-width: 250px; line-height: 1.45; color: #1e293b; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: ${color}; box-shadow: 0 0 6px ${color};"></span>
              <strong style="color: ${color}; font-size: 12px;">
                ${isSevere ? (isIndo ? '🔥 Bara Gambut Ekstrem' : '🔥 Severe Peat Fire') : isModerate ? (isIndo ? '⚠️ Api Permukaan' : '⚠️ Surface Fire') : (isIndo ? '🟡 Titik Hangat Awal' : '🟡 Warm Thermal Anomaly')}
              </strong>
            </div>
            <span style="font-size: 10px; font-weight: 700; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
              ${Math.round(h.frp)} MW
            </span>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${loc.regency}</div>
            ${loc.district ? `<div style="font-size: 11px; color: #475569; margin-top: 1px;">Kecamatan: <b>${loc.district}</b></div>` : ''}
            <div style="font-size: 11px; color: #0284c7; margin-top: 3px; font-weight: 600;">${loc.landscape}</div>
            ${loc.isPeatland ? `<div style="font-size: 10px; color: #b45309; margin-top: 2px; font-weight: 500;">🌱 ${loc.peatDepthEstimate}</div>` : ''}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px;">
            <div style="background: #f1f5f9; padding: 6px; border-radius: 6px;">
              <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Suhu Permukaan</span>
              <strong style="font-size: 12px; color: #0f172a;">${tempC}&deg;C</strong>
            </div>
            <div style="background: #f1f5f9; padding: 6px; border-radius: 6px;">
              <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Waktu Deteksi</span>
              <strong style="font-size: 12px; color: #0f172a;">${localTime.timeFormatted}</strong>
            </div>
          </div>

          <div style="font-size: 10px; color: #64748b; margin-bottom: 8px; display: flex; justify-content: space-between;">
            <span>Satelit: <b>${h.instrument} (${h.satellite})</b></span>
            <span>Keyakinan: <b>${h.confidence}%</b></span>
          </div>

          <div style="display: flex; gap: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <a href="${loc.googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #0284c7; color: #ffffff; padding: 6px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 600;">
              📍 Buka Google Maps
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });
      marker.addTo(layerGroup);
    });
  }, [mapHotspots, liveWeather, language, selectedAOI, isIndo]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200 text-slate-800 dark:text-slate-200">
      
      {/* 1. Header Bar: Quick Region Selector & Seamless Switch to Science Mode */}
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
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
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
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
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase border shrink-0 ${
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

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {threatTier.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
              {threatTier.desc}
            </p>
          </div>

          {/* Quick Metrics Tile (Clean 3-column responsive grid with full breathing room) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/80 dark:bg-[#0c121e]/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs w-full">
            <div className="p-2.5 text-center sm:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isIndo ? 'Titik Api Aktif' : 'Active Fires'}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums block mt-0.5">
                {activeCount.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 text-center sm:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isIndo ? 'Estimasi ISPU' : 'Estimated AQI'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
                {threatTier.ispuEstimate}
              </span>
            </div>

            <div className="p-2.5 text-center flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isIndo ? 'Status Masker' : 'Mask Status'}
              </span>
              <span className={`text-xs font-bold mt-1.5 ${threatTier.maskRecommended ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {threatTier.maskRecommended ? (isIndo ? 'Wajib Masker N95' : 'N95 Required') : (isIndo ? 'Kondisi Aman' : 'Normal Air')}
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

      {/* 2.5 INTERACTIVE VISUAL RADAR MAP (Peta Titik Api Nyata Ramah Warga & Akurat) */}
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {/* Map Header with Basemap & Filter Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isIndo ? 'Peta Satelit Real-Time: Titik Api, Bara Gambut & Sebaran Asap' : 'Live Satellite Map: Peat Fires, Smoldering & Smoke Drift'}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                  {selectedAOI.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  {mapHotspots.length} {isIndo ? 'Titik Ditampilkan' : 'Points Displayed'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isIndo
                  ? 'Citra satelit NASA beresolusi tinggi dilengkapi nama kota, jalan, batas kabupaten, dan estimasi kedalaman gambut.'
                  : 'High-resolution NASA observations with city names, roads, district boundaries, and peat depth data.'}
              </p>
            </div>
          </div>

          {/* Map Controls: Basemap & Hotspot Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Basemap Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setMapBasemap('satellite_labeled')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  mapBasemap === 'satellite_labeled'
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Citra Satelit Resolusi Tinggi dengan Nama Kota & Jalan"
              >
                <span>🛰️</span>
                <span>{isIndo ? 'Satelit + Label' : 'Satellite + Places'}</span>
              </button>
              <button
                onClick={() => setMapBasemap('streets')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  mapBasemap === 'streets'
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Peta Jalan, Desa, Parit & Sungai OpenStreetMap"
              >
                <span>🗺️</span>
                <span>{isIndo ? 'Jalan & Desa' : 'Streets & Towns'}</span>
              </button>
              <button
                onClick={() => setMapBasemap('dark')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  mapBasemap === 'dark'
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Peta Gelap untuk Kontras Titik Panas Maksimal"
              >
                <span>🌑</span>
                <span>{isIndo ? 'Kontras Malam' : 'Dark'}</span>
              </button>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setHotspotFilter('all')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  hotspotFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isIndo ? 'Semua' : 'All'}
              </button>
              <button
                onClick={() => setHotspotFilter('severe')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  hotspotFilter === 'severe'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                <span>🔴</span>
                <span>{isIndo ? 'Bara Kritis' : 'Severe'}</span>
              </button>
              <button
                onClick={() => setHotspotFilter('moderate')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  hotspotFilter === 'moderate'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                }`}
              >
                <span>🟠</span>
                <span>&gt;15 MW</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Focus Bar & Wind Telemetry */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#0a0f1d] border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Quick Focus Jump Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Navigation className="w-3 h-3 text-sky-500" />
              {isIndo ? 'Fokus Wilayah:' : 'Quick Focus:'}
            </span>

            <button
              onClick={() => handleFlyTo(selectedAOI.center[0], selectedAOI.center[1], selectedAOI.zoom)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
            >
              <span>🎯</span>
              <span>{isIndo ? 'Pusat Wilayah' : 'Reset View'}</span>
            </button>

            {highestHotspot && (
              <button
                onClick={() => handleFlyTo(highestHotspot.lat, highestHotspot.lon, 11)}
                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
              >
                <span>🔥</span>
                <span>{isIndo ? `Titik Terpanas (${Math.round(highestHotspot.frp)} MW)` : `Peak Fire (${Math.round(highestHotspot.frp)} MW)`}</span>
              </button>
            )}

            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleFlyTo(chip.lat, chip.lng, chip.zoom)}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 text-[11px] transition cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Live Wind Vector Telemetry */}
          {liveWeather && (
            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              <Compass className="w-3.5 h-3.5 text-sky-500 animate-spin" style={{ animationDuration: '8s' }} />
              <span>
                <b>{liveWeather.windSpeedKmH} km/h</b> &bull; Arah {Math.round(liveWeather.windDirectionDeg || 90)}&deg;
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                {isIndo ? 'Asap Terbawa Angin' : 'Downwind Plume'}
              </span>
            </div>
          )}
        </div>

        {/* The Leaflet Canvas */}
        <div className="relative w-full h-[380px] sm:h-[460px] bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Enhanced Radar Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md text-[11px] space-y-2 pointer-events-auto max-w-[270px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isIndo ? 'Legenda Akurasi Radar Satelit:' : 'Satellite Radar Legend:'}
            </span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-xs shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-medium leading-tight">
                {isIndo ? 'Bara Gambut Bawah Tanah (>40 MW)' : 'Severe Peat Smoldering (>40 MW)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-medium leading-tight">
                {isIndo ? 'Api Vegetasi / Permukaan (15-40 MW)' : 'Surface Fire (15-40 MW)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 border border-white shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-medium leading-tight">
                {isIndo ? 'Titik Hangat Awal (<15 MW)' : 'Warm Thermal Hotspot (<15 MW)'}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="w-3 h-2 border-b-2 border-orange-500 border-dashed inline-block" />
              <span className="text-slate-500 text-[10px]">
                {isIndo ? 'Kerucut Oranye: Proyeksi Arah Sebaran Asap' : 'Orange Cone: Smoke Drift Projection'}
              </span>
            </div>
            <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
              {isIndo ? '💡 Klik sembarang titik api untuk rincian desa & navigasi' : '💡 Click any point for subdistrict & navigation'}
            </div>
          </div>
        </div>

        {/* Selected Hotspot Detailed Inspection Panel */}
        {selectedHotspot && (
          <div className="p-4 bg-sky-50/80 dark:bg-sky-950/40 border-t border-sky-200 dark:border-sky-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedHotspot.loc.regency}
                  </span>
                  {selectedHotspot.loc.district && (
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      &bull; Kec. <b>{selectedHotspot.loc.district}</b>
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold">
                    {Math.round(selectedHotspot.spot.frp)} MW &bull; {(selectedHotspot.spot.brightness - 273.15).toFixed(1)}&deg;C
                  </span>
                </div>

                <p className="text-xs text-sky-900 dark:text-sky-300 font-medium">
                  {selectedHotspot.loc.landscape} {selectedHotspot.loc.isPeatland && `(${selectedHotspot.loc.peatDepthEstimate})`}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-0.5">
                  <span>GPS: {selectedHotspot.spot.lat.toFixed(5)}&deg;, {selectedHotspot.spot.lon.toFixed(5)}&deg;</span>
                  <span>Waktu: {selectedHotspot.localTime.timeFormatted}</span>
                  <span>Satelit: {selectedHotspot.spot.instrument}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons for Selected Hotspot */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={selectedHotspot.loc.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-sky-600 dark:text-sky-400 transition flex items-center gap-1.5 shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Rute Google Maps' : 'Google Maps'}</span>
              </a>

              <button
                onClick={() => handleUseHotspotForReport(selectedHotspot.spot, selectedHotspot.loc)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Lapor Titik Ini via WhatsApp' : 'Report via WhatsApp'}</span>
              </button>

              <button
                onClick={() => setSelectedHotspot(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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
            {/* Visual Particle Comparison Bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {isIndo ? 'Perbandingan Ukuran Partikel Asap vs Rambut Manusia:' : 'Particle Size Comparison (Why N95 is Mandatory):'}
              </span>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Rambut Manusia (~70 µm)</span>
                  <span className="font-bold">Masker Kain Biasa</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full w-full" />
                </div>

                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 pt-1">
                  <span>Debu Pasir / Serbuk (~10 µm)</span>
                  <span className="font-bold">Masker Bedah Medis</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[45%]" />
                </div>

                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 pt-1">
                  <span>Asap Gambut Beracun (PM2.5 &lt;2.5 µm)</span>
                  <span className="font-bold">HANYA N95 / KN95</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[12%] animate-pulse" />
                </div>
              </div>
            </div>

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
            {/* Visual Dry Spell Progress Bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  {isIndo ? 'Tingkat Kekeringan Lahan Gambut' : 'Peat Dryness Gauge'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {activeCount > 50 ? '82% Kritis Kering' : '38% Moderat'}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full w-[30%]" title="Aman Basah" />
                <div className="bg-amber-500 h-full w-[35%]" title="Mulai Surut" />
                <div className="bg-rose-500 h-full w-[35%]" title="Kritis Terbakar" />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>Basah (&lt;40cm)</span>
                <span>Siaga</span>
                <span className="text-rose-500 font-bold">Rawan Terbakar</span>
              </div>
            </div>

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
      <div id="citizen-whatsapp-report" className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
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
          {/* Card 1: 40cm Canal Rule with Visual Cross-Section Diagram */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                {isIndo ? '1. Aturan Parit 40 cm (PP 71/2014 & BRGM)' : '1. The 40 cm Ditch Water Rule'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold">
                Muka Air Tanah
              </span>
            </div>

            {/* Visual SVG Soil Cross Section */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800">
              <div className="space-y-1 font-mono text-[10px]">
                {/* Surface Ground */}
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold border-b border-emerald-500 pb-1">
                  <span>Permukaan Lahan Kebun (0 cm)</span>
                  <span>🌿 Lapisan Rumput</span>
                </div>
                {/* 0 to -40cm Zone (Safe Moist Saturated Zone) */}
                <div className="h-7 bg-amber-500/15 border-l-4 border-amber-500 px-2 flex items-center justify-between text-amber-700 dark:text-amber-300">
                  <span>Batas Kritis: 0 s/d -40 cm</span>
                  <span className="text-[9px] font-bold">ZONA AMAN (Gambut Basah)</span>
                </div>
                {/* Below -40cm Danger Zone */}
                <div className="h-8 bg-rose-500/20 border-l-4 border-rose-500 px-2 flex items-center justify-between text-rose-700 dark:text-rose-300 font-bold">
                  <span>Surut &gt; -40 cm</span>
                  <span className="text-[9px] animate-pulse">🔥 BAHAYA MUDAH TERBAKAR!</span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {isIndo
                ? 'Lahan gambut seperti spons raksasa. Jika air parit surut lebih dari 40 cm dari bibir tanah, pori-pori gambut terisi oksigen dan mudah meledak terbakar. Pasang sekat kanal dari karung pasir agar air tidak habis mengalir ke sungai.'
                : 'Peat acts like a giant sponge. If canal water drops lower than 40 cm below the surface, the peat dries out and becomes highly flammable. Close canal blocks to trap water in the soil.'}
            </p>
          </div>

          {/* Card 2: Peat Fire Extinguishing with Lance Injection Diagram */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                {isIndo ? '2. Cara Padamkan Bara: Jangan Semprot Atas!' : '2. Peat Fire Extinguishing: Deep Injection'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold">
                Tusuk & Suntik Air
              </span>
            </div>

            {/* Visual Action Diagram: Wrong vs Right */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
                <span className="font-bold block text-rose-600 dark:text-rose-400 mb-0.5">❌ SALAH: Semprot Atas</span>
                <span>Hanya basahi abu luar. Bara di kedalaman 1 meter tetap menjalar dan menyala lagi.</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block text-emerald-600 dark:text-emerald-400 mb-0.5">✅ BENAR: Suntik Pipa</span>
                <span>Tancapkan pipa pompa ke dalam tanah 50-100cm hingga tanah jadi bubur lumpur dingin.</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {isIndo
                ? 'Menyiram air dari atas hanya membuang ribuan liter air tanpa mematikan sumber api bawah tanah. Gunakan tombak pemadam (nozzle injeksi) yang ditancapkan ke dalam tanah sampai keluar gelembung uap air panas dan lumpur basah.'
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
