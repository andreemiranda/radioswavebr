import React from 'react';
import { Radio, Search, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

interface MobileBottomNavProps {
  activeTab: 'guia' | 'search' | 'favorites';
  onTabChange: (tab: 'guia' | 'search' | 'favorites') => void;
  isPlaying?: boolean;
  favoritesCount?: number;
}

const tabs = [
  { id: 'guia' as const,      label: 'Início',     icon: Radio  },
  { id: 'search' as const,    label: 'Populares',  icon: Search },
  { id: 'favorites' as const, label: 'Favoritos',  icon: Star   },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  isPlaying = false,
  favoritesCount = 0,
}) => {
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';

  return (
    <nav
      className={cn(
        // Only visible on mobile — hidden on sm+ (640 px and above)
        "fixed bottom-0 left-0 right-0 z-[150] sm:hidden",
        "flex items-stretch justify-around border-t",
        isBrazil
          ? "bg-white border-[#E2E8F0]"
          : "bg-theme-surface/95 backdrop-blur-xl border-theme-border"
      )}
      style={{
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        const showBadge = id === 'favorites' && favoritesCount > 0;

        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-[3px] relative",
              "transition-all duration-200 active:scale-90 active:opacity-70",
              "select-none touch-manipulation"
            )}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active pill indicator at top */}
            <div
              className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full transition-all duration-300",
                isActive
                  ? cn("w-8", isBrazil ? "bg-[#009C3B]" : "bg-theme-primary")
                  : "w-0 bg-transparent"
              )}
            />

            {/* Icon + badges */}
            <div className="relative mt-1">
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={cn(
                  "transition-all duration-200",
                  isActive
                    ? isBrazil ? "text-[#009C3B]" : "text-theme-primary"
                    : "text-[#94A3B8]",
                  isActive && "scale-110"
                )}
                fill={isActive && id === 'favorites' ? 'currentColor' : 'none'}
              />

              {/* Live playing dot on Geral tab */}
              {id === 'guia' && isPlaying && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white animate-live-pulse",
                    isBrazil ? "bg-[#009C3B]" : "bg-theme-primary"
                  )}
                />
              )}

              {/* Favorites count badge */}
              {showBadge && (
                <span
                  className={cn(
                    "absolute -top-1 -right-2 min-w-[16px] h-4 px-[3px] rounded-full",
                    "text-[9px] font-black flex items-center justify-center text-white leading-none",
                    isBrazil ? "bg-[#009C3B]" : "bg-theme-primary"
                  )}
                >
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                "text-[10px] font-bold tracking-wide transition-colors duration-200",
                isActive
                  ? isBrazil ? "text-[#009C3B]" : "text-theme-primary"
                  : "text-[#94A3B8]"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
