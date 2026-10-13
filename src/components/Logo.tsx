import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
  showNasaBadge?: boolean;
}

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
      {/* Dual Logo Lockup: Bhumantara Emblem × NASA Meatball */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Bhumantara Emblem */}
        <div className={`flex items-center justify-center shrink-0 ${emblem}`}>
          <img
            src="/bhumantara_logo.svg"
            alt="Bhumantara Emblem"
            className="w-full h-full max-w-full max-h-full object-contain shrink-0 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            loading="eager"
          />
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
          <span className="truncate">Bhumantara</span>
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
