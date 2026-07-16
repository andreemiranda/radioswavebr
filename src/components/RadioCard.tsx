import React from 'react';
import { Play, Pause, Star } from 'lucide-react';
import { Card } from './ui/Card';
import { StationImage } from './StationImage';
import { RadioStation } from '../types';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

interface RadioCardProps {
  station: RadioStation;
  isPlaying: boolean;
  isActive: boolean;
  isFavorite: boolean;
  onPlay: (station: RadioStation) => void;
  onFavorite: (e: React.MouseEvent, station: RadioStation) => void;
  index?: number;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  station,
  isPlaying,
  isActive,
  isFavorite,
  onPlay,
  onFavorite,
  index = 0
}) => {
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';
  return (
    <Card 
      active={isActive}
      style={isBrazil ? { animationDelay: `${index * 0.06}s` } : {}}
      className={cn(
        "flex items-center gap-4 group cursor-pointer h-full animate-in fade-in zoom-in-95 duration-500 transition-all",
        "hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]",
        isBrazil
          ? cn(
              "rounded-2xl border-2",
              isActive 
                ? "bg-white/98 border-[#FFDF00] animate-active-glow" 
                : "bg-white border-transparent shadow-card hover:shadow-card-hover hover:border-[#FFDF00]/40"
            )
          : cn(
              "rounded-xl border",
              isActive 
                ? "bg-theme-primary/5 border-theme-primary/40 animate-active-glow shadow-accent-glow" 
                : "bg-theme-surface border-theme-border shadow-elevation-1 hover:shadow-elevation-2 hover:border-theme-primary/30"
            )
      )}
      onClick={() => onPlay(station)}
    >
      <StationImage 
        station={station as any} 
        size={64} 
        className={cn(
          "rounded-2xl shadow-sm transition-all duration-300",
          "group-hover:scale-[1.12] group-hover:-rotate-2",
          isBrazil 
            ? "shadow-[0_2px_10px_rgba(0,0,0,0.12)] group-hover:shadow-[0_6px_20px_rgba(0,156,59,0.30)]" 
            : "group-hover:shadow-accent-glow"
        )}
      />
      
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "text-[15px] font-display font-black leading-tight mb-0.5 line-clamp-3 break-words [hyphens:none] [-webkit-hyphens:none]",
          isBrazil ? "text-[#009C3B]" : "text-theme-text-primary"
        )} title={station.name} lang="pt-BR">
          {station.name}
        </h3>
        <div className={cn(
          "flex items-center gap-2 text-[10px] uppercase tracking-wider",
          isBrazil ? "font-black text-[#009C3B]/65" : "font-semibold text-theme-text-secondary opacity-60"
        )}>
          {station.state ? `${station.state} · ` : ''}{station.codec || 'MP3'} · {station.bitrate ? `${station.bitrate}kbps` : 'Auto'}
        </div>
        
        {isActive && isPlaying && (
          <div className="flex items-end gap-0.5 h-3 mt-2.5">
            {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
              <span 
                key={i} 
                className={cn(
                  "w-[3px] rounded-full",
                  isBrazil ? "bg-[#009C3B]" : "bg-theme-primary"
                )}
                style={{ 
                  animation: `wave 0.8s infinite ease-in-out`, 
                  animationDelay: `${delay}s`,
                  minHeight: '4px',
                  boxShadow: isBrazil ? '0 0 6px rgba(0,156,59,0.5)' : '0 0 6px var(--theme-primary)'
                }} 
              />
            ))}
          </div>
        )}

        <div className="flex gap-1.5 mt-2.5 overflow-hidden">
          {station.tags?.slice(0, 2).map((t, idx) => (
            <span 
              key={idx} 
              className={cn(
                "text-[9px] px-2 py-0.5 rounded-md font-bold tracking-wider leading-none uppercase transition-all duration-200",
                isBrazil 
                  ? "bg-[#009C3B]/5 text-[#009C3B]/65 border border-[#009C3B]/12 hover:bg-[#009C3B]/14 hover:text-[#009C3B] hover:border-[#009C3B]/28 hover:shadow-[0_2px_8px_rgba(0,156,59,0.15)] hover:-translate-y-px" 
                  : "bg-theme-text-secondary/5 text-theme-text-secondary border border-transparent hover:border-theme-primary/20 hover:text-theme-primary hover:bg-theme-primary/5"
              )}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <button 
          className={cn(
            "p-2 rounded-full transition-all duration-250",
            isFavorite
              ? cn(
                  "animate-star-pop",
                  isBrazil
                    ? "bg-[#009C3B] text-[#FFDF00] scale-112 shadow-[0_3px_14px_rgba(0,156,59,0.45)]"
                    : "text-theme-accent scale-110 drop-shadow-[0_0_8px_var(--theme-accent)]"
                )
              : cn(
                  "hover:scale-[1.28] hover:rotate-[15deg]",
                  isBrazil
                    ? "text-[#009C3B]/20 hover:text-[#FFDF00] hover:shadow-[0_2px_10px_rgba(255,223,0,0.35)]"
                    : "text-theme-text-secondary/30 hover:text-theme-accent"
                )
          )}
          onClick={(e) => onFavorite(e, station)}
          title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Star size={isBrazil ? 18 : 16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-250 shadow-premium-accent",
          isActive
            ? "animate-pulse-ring shadow-accent-glow"
            : "hover:scale-[1.2] shadow-premium-accent-hover",
          isBrazil
            ? isActive
              ? "bg-[#009C3B] text-[#FFDF00] border-brasil-yellow/20"
              : "bg-[#FFDF00] text-[#009C3B] border-transparent"
            : isActive
              ? "bg-theme-primary text-white border-white/10"
              : "bg-theme-surface text-theme-text-secondary border border-theme-border group-hover:border-theme-primary/30 group-hover:text-theme-primary"
        )}>
          {isActive && isPlaying ? (
            <Pause size={isBrazil ? 20 : 18} fill="currentColor" />
          ) : (
            <Play size={isBrazil ? 20 : 18} fill="currentColor" className="ml-0.5" />
          )}
        </div>
      </div>
    </Card>
  );
};
