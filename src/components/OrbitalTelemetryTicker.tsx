import React, { useState, useEffect } from 'react';
import { Satellite, Radio, Clock, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';
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

  const SATELLITE_STATUS = [
    {
      id: 'terra',
      name: 'TERRA (EOS AM-1)',
      sensor: 'MODIS 1km',
      status: language === 'id' ? 'AKTIF (10:30 LT)' : 'ACTIVE (10:30 LT)',
      orbit: 'LEO 705 km',
      color: 'emerald',
    },
    {
      id: 'aqua',
      name: 'AQUA (EOS PM-1)',
      sensor: 'MODIS 1km',
      status: language === 'id' ? 'AKTIF (13:30 LT)' : 'ACTIVE (13:30 LT)',
      orbit: 'LEO 705 km',
      color: 'emerald',
    },
    {
      id: 'snpp',
      name: 'SUOMI-NPP',
      sensor: 'VIIRS 375m',
      status: language === 'id' ? 'TERKALIBRASI' : 'CALIBRATED',
      orbit: 'LEO 824 km',
      color: 'sky',
    },
    {
      id: 'noaa20',
      name: 'NOAA-20 (JPSS-1)',
      sensor: 'VIIRS 375m',
      status: language === 'id' ? 'TERFUSI' : 'FUSED',
      orbit: 'LEO 824 km',
      color: 'sky',
    },
  ];

  return (
    <div className="w-full bg-[#0a0f1d] border-b border-slate-800 text-slate-300 text-[11px] font-mono select-none overflow-hidden transition-colors">
      <div className="w-full px-3 sm:px-6 h-8 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        
        {/* Left: Mission Status & Live Clock */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isLiveSync ? 'NASA FIRMS LIVE' : 'MISSION DATA VALIDATED'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-slate-200 font-semibold">{utcTime || '00:00:00 UTC'}</span>
          </div>
        </div>

        {/* Center: Live Orbit Constellation Ticker */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-[10px] sm:text-[11px]">
          {SATELLITE_STATUS.map((sat) => (
            <div key={sat.id} className="flex items-center gap-1.5">
              <span className={`w-1 h-1 rounded-full ${sat.color === 'emerald' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
              <span className="font-bold text-slate-100">{sat.name}</span>
              <span className="text-slate-500 hidden md:inline">[{sat.sensor}]</span>
              <span className="text-slate-400">{sat.status}</span>
            </div>
          ))}

          {/* Processing Latency & Algorithm Specs */}
          <div className="hidden lg:flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-4">
            <Cpu className="w-3 h-3 text-sky-400" />
            <span>Fusi Spasial 5.5 km Equal-Area</span>
          </div>
        </div>

        {/* Right: Telemetry Latency Badge */}
        <div className="hidden xl:flex items-center gap-2 shrink-0 text-[10px] text-slate-400">
          <span className="text-slate-500">Latensi Satelit:</span>
          <span className="font-bold text-sky-400 font-mono">~3.2 Jam</span>
        </div>

      </div>
    </div>
  );
};
