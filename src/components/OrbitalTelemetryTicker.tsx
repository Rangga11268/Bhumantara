import React, { useState, useEffect } from 'react';
import { Satellite, Radio, Clock, Cpu, ShieldCheck, Flame, Zap } from 'lucide-react';
import { Language } from '../data/translations';

interface OrbitalTelemetryTickerProps {
  language: Language;
  isLiveSync?: boolean;
}

export const OrbitalTelemetryTicker: React.FC<OrbitalTelemetryTickerProps> = ({
  language,
  isLiveSync = false,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const TELEMETRY_FEED = [
    {
      id: 'terra',
      icon: Satellite,
      name: 'TERRA (EOS AM-1)',
      sensor: 'MODIS 1km',
      spec: 'Orbit 705 km · 10:30 LT',
      status: language === 'id' ? 'AKTIF' : 'ACTIVE',
    },
    {
      id: 'aqua',
      icon: Satellite,
      name: 'AQUA (EOS PM-1)',
      sensor: 'MODIS 1km',
      spec: 'Orbit 705 km · 13:30 LT',
      status: language === 'id' ? 'AKTIF' : 'ACTIVE',
    },
    {
      id: 'snpp',
      icon: Satellite,
      name: 'SUOMI-NPP',
      sensor: 'VIIRS 375m',
      spec: 'Orbit 824 km · 13:30 LT',
      status: language === 'id' ? 'TERKALIBRASI' : 'CALIBRATED',
    },
    {
      id: 'noaa20',
      icon: Satellite,
      name: 'NOAA-20 (JPSS-1)',
      sensor: 'VIIRS 375m',
      spec: 'I-Bands 3.9 μm · 01:30 LT',
      status: language === 'id' ? 'TERFUSI' : 'IN SYNC',
    },
    {
      id: 'firms',
      icon: Radio,
      name: 'NASA FIRMS FEED',
      sensor: 'NRT Data Stream',
      spec: language === 'id' ? 'Latensi ~3.2 Jam' : 'Latency ~3.2 hrs',
      status: 'VERIFIED',
    },
    {
      id: 'fusion',
      icon: Cpu,
      name: 'FUSI SPASIAL WANAREKSA',
      sensor: 'Equal-Area Grid',
      spec: '5.5 km Resolution',
      status: 'BIAS FIXED',
    },
    {
      id: 'peatland',
      icon: Flame,
      name: 'AMBANG TMAG BRGM',
      sensor: 'PP 71/2014 & PP 57/2016',
      spec: '-40 cm Water Table Limit',
      status: 'MONITORING',
    },
  ];

  return (
    <div className="w-full bg-[#070b14] border-b border-slate-800 text-slate-300 select-none overflow-hidden flex items-center h-10 transition-colors">
      
      {/* Pinned Left Mission Indicator */}
      <div className="h-full px-3 sm:px-4 bg-slate-950/95 border-r border-slate-800 flex items-center gap-2.5 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-100 font-sans uppercase hidden sm:inline">
            {isLiveSync ? 'NASA FIRMS LIVE' : 'MISSION TELEMETRY'}
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-slate-400 border-l border-slate-800 pl-2">
          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="text-slate-200 font-semibold">{utcTime || '00:00:00 UTC'}</span>
        </div>
      </div>

      {/* Infinite Scrolling Marquee Track with Edge Fade */}
      <div
        className="relative flex-1 overflow-hidden h-full flex items-center"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
        }}
      >
        <div className="animate-marquee flex items-center whitespace-nowrap pl-4 cursor-default">
          {TELEMETRY_FEED.concat(TELEMETRY_FEED).map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-[11px] font-mono shrink-0 text-slate-400 mr-8">
                <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-semibold text-slate-200 tracking-wide">{item.name}</span>
                <span className="text-slate-600">//</span>
                <span className="text-slate-300">{item.sensor}</span>
                <span className="text-slate-500 hidden md:inline">({item.spec})</span>
                <span className="text-slate-600">//</span>
                <span className="text-emerald-400 font-semibold tracking-wider text-[10px]">{item.status}</span>
                <span className="text-slate-800 ml-4 select-none">|</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
