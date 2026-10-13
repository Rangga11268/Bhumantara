import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
  showNasaBadge?: boolean;
}

export const WanareksaEmblem: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Wanareksa Sentinel Emblem">
    <title>Wanareksa Sentinel Emblem</title>
    {/* Deep Blue NASA Planetary Core (Circular Mission Disc) */}
    <circle cx="128" cy="128" r="114" fill="#0B3D91" />

    {/* Outer Precision Aerospace Bezel Collar (Atmosphere Cyan + Deep Blue) */}
    <circle cx="128" cy="128" r="114" fill="none" stroke="#38BDF8" strokeWidth="3" />
    <circle cx="128" cy="128" r="108" fill="none" stroke="#0B3D91" strokeWidth="4" />

    {/* Indonesian Peatland Biosphere Horizon (Nadir Curvature) */}
    <path d="M 28,152 A 114,114 0 0 0 228,152 C 182,186 74,186 28,152 Z" fill="#059669" />

    {/* NASA Orbital Trajectory Ellipse (Pure White, Sun-Synchronous Polar Track) */}
    <ellipse cx="128" cy="128" rx="112" ry="34" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeDasharray="140 20" transform="rotate(-28 128 128)" />

    {/* Supersonic Chevron 'W' (Twin Aerospace Vectors Slicing Orbit) */}
    {/* Left Wing (Pristine Aerospace White for High Contrast) */}
    <polygon points="58,164 96,66 128,136 108,146 96,114 76,164" fill="#FFFFFF" />

    {/* Right Wing (NASA Supersonic Red Vector) */}
    <polygon points="198,164 160,66 128,136 148,146 160,114 180,164" fill="#FC3D21" />

    {/* Central Aerospace Chevron Apex Union */}
    <polygon points="128,78 142,118 128,136 114,118" fill="#FFFFFF" />

    {/* Fire Radiative Power (FRP) Thermal Core Node */}
    <circle cx="128" cy="78" r="10" fill="#FC3D21" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="128" cy="78" r="4.5" fill="#FDE047" />

    {/* Satellite Sentinel Transponder at Orbital Apex */}
    <circle cx="216" cy="80" r="6" fill="#FFFFFF" />
    <circle cx="216" cy="80" r="3" fill="#0B3D91" />

    {/* Four Cardinal Telemetry Crosshair Coordinates */}
    <rect x="127" y="6" width="2" height="6" fill="#FC3D21" />
    <rect x="127" y="244" width="2" height="6" fill="#059669" />
    <rect x="6" y="127" width="6" height="2" fill="#38BDF8" />
    <rect x="244" y="127" width="6" height="2" fill="#38BDF8" />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showSubtitle = true,
  showNasaBadge = true,
}) => {
  const sizeMap = {
    sm: {
      emblem: 'w-7 h-7 min-w-[28px] max-w-[28px]',
      nasa: 'w-6 h-6 min-w-[24px] max-w-[24px]',
      title: 'text-xs sm:text-sm font-bold',
      sub: 'text-[9px]',
      cross: 'text-[11px]',
    },
    md: {
      emblem: 'w-7.5 h-7.5 sm:w-9 sm:h-9 min-w-[30px] max-w-[36px]',
      nasa: 'w-6.5 h-6.5 sm:w-8 sm:h-8 min-w-[26px] max-w-[32px]',
      title: 'text-sm sm:text-base font-bold',
      sub: 'text-[10px]',
      cross: 'text-xs',
    },
    lg: {
      emblem: 'w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] max-w-[44px]',
      nasa: 'w-8 h-8 sm:w-9.5 sm:h-9.5 min-w-[32px] max-w-[38px]',
      title: 'text-base sm:text-lg font-extrabold',
      sub: 'text-xs',
      cross: 'text-sm',
    },
  };

  const { emblem, nasa, title, sub, cross } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 max-w-full overflow-hidden ${className}`}>
      {/* Dual Logo Lockup: Wanareksa Emblem × NASA Meatball */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Wanareksa Emblem (Adaptive SVG for light and dark modes) */}
        <div className={`flex items-center justify-center shrink-0 ${emblem} filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)]`}>
          <WanareksaEmblem className="w-full h-full object-contain" />
        </div>

        {showNasaBadge && (
          <>
            {/* Minimal Cross Divider */}
            <span className={`text-[#86868b] dark:text-[#6b7280] font-medium opacity-60 select-none shrink-0 ${cross}`}>
              ×
            </span>

            {/* Official NASA Insignia */}
            <div className={`flex items-center justify-center shrink-0 ${nasa} rounded-full overflow-hidden shadow-2xs`}>
              <img
                src="/nasa_meatball.svg"
                alt="NASA Insignia"
                className="w-full h-full max-w-full max-h-full object-contain shrink-0"
                loading="eager"
              />
            </div>
          </>
        )}
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center min-w-0 leading-tight shrink truncate">
        <div className={`tracking-tight text-[#1d1d1f] dark:text-white font-bold flex items-center gap-1.5 truncate ${title}`}>
          <span className="truncate">Wanareksa</span>
        </div>
        {showSubtitle && (
          <span className={`text-[#86868b] dark:text-[#9ca3af] tracking-normal font-medium hidden sm:block truncate ${sub}`}>
            NASA Space Apps 2026
          </span>
        )}
      </div>
    </div>
  );
};
