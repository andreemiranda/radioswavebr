import React, { useState } from 'react';
import { Radio } from 'lucide-react';
import { RadioStation } from '../types';
import { cn } from '../lib/utils';

interface StationImageProps {
  station: RadioStation;
  size?: number;
  className?: string;
}

/**
 * Brazil Flag SVG Badge
 */
const BrazilFlagBadge = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    viewBox="0 0 720 504" 
    className={cn("rounded-sm border border-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]", className)}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="720" height="504" fill="#009b3a" />
    <path fill="#fedf00" d="m360 43.2 316.8 208.8L360 460.8 43.2 252z" />
    <circle fill="#0431af" cx="360" cy="252" r="100.8" />
  </svg>
);

/**
 * Default fallback icon when station favicon is missing or fails to load
 */
const DefaultRadioIcon = ({ size }: { size: number }) => (
  <div 
    className="relative bg-[#FFDF00] flex items-center justify-center rounded-xl shadow-inner overflow-hidden border border-white/20"
    style={{ width: size, height: size }}
  >
    <Radio className="text-[#009C3B] drop-shadow-sm" size={size * 0.5} />
    <BrazilFlagBadge 
      className="absolute bottom-1 right-1" 
      style={{ width: size * 0.35, height: 'auto' }}
    />
  </div>
);

/**
 * Component to display station images with proper fallbacks.
 * Shows a branded Brazilian radio icon if the image is missing or broken.
 */
export const StationImage: React.FC<StationImageProps> = ({ 
  station, 
  size = 52,
  className = "" 
}) => {
  const [error, setError] = useState(false);
  const hasFavicon = station.favicon && station.favicon.startsWith('http');

  if (error || !hasFavicon) {
    return (
      <div className={cn("shrink-0", className)}>
        <DefaultRadioIcon size={size} />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-white/10 rounded-xl shrink-0 border border-white/5 shadow-sm transition-transform group-hover:scale-105",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={station.favicon}
        alt={station.name}
        onError={() => setError(true)}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      <BrazilFlagBadge 
        className="absolute bottom-1 right-1 z-10" 
        style={{ width: size * 0.35, height: 'auto' }}
      />
    </div>
  );
};
