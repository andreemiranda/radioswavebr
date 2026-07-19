import React from 'react';
import { Radio } from 'lucide-react';
import { cn } from '../lib/utils';

interface StationImageProps {
  /** station prop kept for API compatibility — icon is always the official app brand */
  station?: unknown;
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
 * Component to display station images.
 * Always shows the official app branded icon — standardized across all stations
 * (local and API) for a consistent, uniform look and zero external HTTP requests.
 */
export const StationImage: React.FC<StationImageProps> = ({ 
  size = 52,
  className = "" 
}) => {
  return (
    <div className={cn("shrink-0", className)}>
      <DefaultRadioIcon size={size} />
    </div>
  );
};
