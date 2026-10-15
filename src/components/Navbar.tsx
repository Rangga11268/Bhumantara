import React, { useState } from 'react';
import { Logo } from './Logo';
import { Language, translations } from '../data/translations';
import { Menu, X, Sun, Moon, Compass, BookOpen, Globe2, SlidersHorizontal, ShieldAlert, Database, Users } from 'lucide-react';

export type NavTab = 'story' | 'overview' | 'lab' | 'mitigation' | 'data-hub' | 'team';
export type ThemeMode = 'system' | 'light' | 'dark';
export type AppMode = 'citizen' | 'science';

interface NavbarProps {
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  appMode: AppMode;
  onToggleAppMode: (mode: AppMode) => void;
  onOpenTeam?: () => void;
  onOpenTour?: () => void;
  isLiveSync?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  activeTab,
  onSelectTab,
  appMode,
  onToggleAppMode,
  onOpenTeam,
  onOpenTour,
  isLiveSync = false,
  theme = 'light',
  onToggleTheme,
}) => {
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'story' as NavTab, label: t.navStory, icon: BookOpen },
    { id: 'overview' as NavTab, label: t.navOverview, icon: Globe2 },
    { id: 'lab' as NavTab, label: t.navLab, icon: SlidersHorizontal },
    { id: 'mitigation' as NavTab, label: t.navMitigation, icon: ShieldAlert },
    { id: 'data-hub' as NavTab, label: t.navData, icon: Database },
    { id: 'team' as NavTab, label: t.navTeam, icon: Users },
  ];

  const themeLabel = theme === 'dark'
    ? (language === 'id' ? 'Ganti ke Mode Terang' : 'Switch to Light Mode')
    : (language === 'id' ? 'Ganti ke Mode Gelap' : 'Switch to Dark Mode');

  return (
    <>
      <header className="print:hidden sticky top-0 z-[1000] bg-white/90 dark:bg-[#0c121e]/90 backdrop-blur-xl border-b border-[#e5e5e7] dark:border-[#1f2937] transition-all w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => onSelectTab('overview')}>
            <Logo size="md" />
          </div>

          {/* Desktop Dual-Mode Switcher & Navigation Dock */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Primary Mode Switcher (Mode Warga vs Mode Riset) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs shrink-0">
              <button
                onClick={() => onToggleAppMode('citizen')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                  appMode === 'citizen'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={t.modeCitizenDesc}
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{t.modeCitizen}</span>
              </button>

              <button
                onClick={() => onToggleAppMode('science')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                  appMode === 'science'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={t.modeScienceDesc}
              >
                <Globe2 className="w-3.5 h-3.5 shrink-0" />
                <span>{t.modeScience}</span>
              </button>
            </div>

            {/* Science Navigation Sub-Tabs (Visible when in Science Mode) */}
            {appMode === 'science' && (
              <nav className="flex items-center bg-[#f0f2f5] dark:bg-[#141d2e] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs animate-in fade-in duration-150">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-white dark:bg-[#0c121e] text-slate-900 dark:text-white shadow-xs border border-slate-200/70 dark:border-slate-700/70 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      title={item.label}
                    >
                      <Icon className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                        isActive 
                          ? (item.id === 'mitigation' ? 'text-rose-500 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400')
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }`} />
                      <span className="hidden lg:inline">{item.label}</span>
                      <span className="lg:hidden">{item.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Live Indicator */}
            {isLiveSync && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-[#1d1d1f] dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                NASA FIRMS Live
              </span>
            )}

            {/* Direct Dark / Light Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                aria-label={themeLabel}
                title={themeLabel}
                className="p-1.5 sm:p-2 rounded-full text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#1f2937] transition border border-[#e5e5e7] dark:border-[#374151] flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer group"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-[#515154] group-hover:-rotate-12 transition-transform" />
                )}
              </button>
            )}

            {/* Language Switch */}
            <div className="flex items-center bg-[#e5e5ea] dark:bg-[#1f2937] rounded-full p-0.5 text-[11px] font-medium">
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-semibold'
                    : 'text-[#86868b] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onToggleLanguage('id')}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  language === 'id'
                    ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-semibold'
                    : 'text-[#86868b] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            {/* 30-Sec Science Briefing Tour Button */}
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="hidden xl:inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl border border-sky-600/30 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all cursor-pointer shadow-2xs"
                title={language === 'id' ? 'Buka Ringkasan Ilmiah 30 Detik (Pintasan: ?)' : 'Open 30-Second Science Briefing (Shortcut: ?)'}
              >
                <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>{t.scienceTourBtn}</span>
                <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-white dark:bg-[#111827] border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200">
                  ?
                </kbd>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#1d1d1f] dark:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1001] md:hidden bg-black/40 backdrop-blur-xs pt-14 flex flex-col">
          <div className="bg-white dark:bg-[#111827] border-b border-[#e5e5e7] dark:border-[#1f2937] p-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Mode Switcher */}
            <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs gap-1">
              <button
                onClick={() => {
                  onToggleAppMode('citizen');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 ${
                  appMode === 'citizen'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.modeCitizen}</span>
              </button>

              <button
                onClick={() => {
                  onToggleAppMode('science');
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 ${
                  appMode === 'science'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>{t.modeScience}</span>
              </button>
            </div>

            {/* Tour & Nav Items */}
            {onOpenTour && (
              <button
                onClick={() => {
                  onOpenTour();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition min-h-[40px] cursor-pointer bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>{t.scienceTourBtn}</span>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider">
                  {language === 'id' ? 'Ringkasan 30 Detik' : '30-Sec Briefing'}
                </span>
              </button>
            )}

            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition min-h-[42px] cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-slate-100 dark:bg-[#1f2937] text-slate-900 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a2333] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Theme & Language Bar */}
            <div className="pt-3 border-t border-[#e5e5e7] dark:border-[#1f2937] flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#86868b] dark:text-[#9ca3af]">
                {language === 'id' ? 'Tema Tampilan:' : 'Theme Mode:'}
              </span>

              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition border border-[#e5e5e7] dark:border-[#374151] bg-[#f5f5f7] dark:bg-[#1f2937] text-[#1d1d1f] dark:text-white"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'id' ? 'Mode Gelap (Aktif)' : 'Dark (Active)'}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{language === 'id' ? 'Mode Terang (Aktif)' : 'Light (Active)'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
