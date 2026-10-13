import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
  showNasaBadge?: boolean;
}

export const WanareksaEmblem: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Wanareksa Sentinel Emblem</title>
    {/* Outer Aerospace Sentinel Ring - dynamic contrast in light vs dark */}
    <path
      d="M 128,14 A 114,114 0 1 0 128,242 A 114,114 0 1 0 128,14 Z M 128,24 A 104,104 0 1 1 128,232 A 104,104 0 1 1 128,24 Z"
      className="fill-[#0B3D91] dark:fill-[#38BDF8] transition-colors duration-200"
    />
    
    {/* North Petal: Zenith Telemetry (Peatland Emerald) */}
    <path
      d="M 128,34 C 150,62 166,88 154,112 C 146,124 137,128 128,128 C 119,128 110,124 102,112 C 90,88 106,62 128,34 Z"
      className="fill-[#059669] dark:fill-[#10B981] transition-colors duration-200"
    />
    
    {/* South Petal: Nadir Biosphere (Peatland Emerald) */}
    <path
      d="M 128,222 C 106,194 90,168 102,144 C 110,132 119,128 128,128 C 137,128 146,132 154,144 C 166,168 150,194 128,222 Z"
      className="fill-[#059669] dark:fill-[#10B981] transition-colors duration-200"
    />
    
    {/* West Petal: Western Orbital Swath (NASA Deep Blue / Luminous Sky) */}
    <path
      d="M 34,128 C 62,106 88,90 112,102 C 124,110 128,119 128,128 C 128,137 124,146 112,154 C 88,166 62,150 34,128 Z"
      className="fill-[#0B3D91] dark:fill-[#60A5FA] transition-colors duration-200"
    />
    
    {/* East Petal: Eastern Orbital Swath (NASA Deep Blue / Luminous Sky) */}
    <path
      d="M 222,128 C 194,150 168,166 144,154 C 132,146 128,137 128,128 C 128,119 132,110 144,102 C 168,90 194,106 222,128 Z"
      className="fill-[#0B3D91] dark:fill-[#60A5FA] transition-colors duration-200"
    />

    {/* Four Cardinal Telemetry Crosshair Nodes */}
    <circle cx="80" cy="80" r="10" className="fill-[#0B3D91] dark:fill-[#38BDF8] transition-colors duration-200" />
    <circle cx="176" cy="80" r="10" className="fill-[#0B3D91] dark:fill-[#38BDF8] transition-colors duration-200" />
    <circle cx="80" cy="176" r="10" className="fill-[#059669] dark:fill-[#10B981] transition-colors duration-200" />
    <circle cx="176" cy="176" r="10" className="fill-[#059669] dark:fill-[#10B981] transition-colors duration-200" />

    {/* Central Aperture Lens Collar */}
    <path
      d="M 128,102 A 26,26 0 1 0 128,154 A 26,26 0 1 0 128,102 Z M 128,114 A 14,14 0 1 1 128,142 A 14,14 0 1 1 128,114 Z"
      className="fill-[#0B3D91] dark:fill-[#94A3B8] transition-colors duration-200"
    />

    {/* Central Fire Radiative Power (FRP) Thermal Core */}
    <circle cx="128" cy="128" r="9" className="fill-[#D97706] dark:fill-[#F59E0B]" />
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
