import React from 'react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

export const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface FilterPanelProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  genres: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedState,
  onStateChange,
  selectedGenre,
  onGenreChange,
  genres
}) => {
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';

  return (
    <div className={cn(
      "space-y-8 p-8 transition-all duration-300",
      isBrazil 
        ? "bg-white border-2 border-[#E2E8F0] rounded-[2.5rem] shadow-[0_12px_40px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]" 
        : "bg-theme-surface border border-theme-border rounded-[2rem] shadow-player space-y-6 p-6"
    )}>
      {/* States Filter */}
      <div>
        <h4 className={cn(
          "text-[11px] font-black uppercase tracking-[0.2em] mb-5 ml-1",
          isBrazil ? "text-[#009C3B]" : "text-theme-text-secondary/60"
        )}>Estado (UF)</h4>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onStateChange('')}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border uppercase tracking-wider",
              selectedState === '' 
                ? isBrazil
                  ? "bg-[#002776] text-white border-[#002776] shadow-[0_6px_20px_rgba(0,39,118,0.35)]"
                  : "bg-theme-primary text-white border-theme-primary shadow-accent-glow" 
                : isBrazil
                  ? "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F0FDF4] hover:text-[#009C3B] hover:border-[#009C3B]/30 hover:-translate-y-0.5"
                  : "bg-theme-bg text-theme-text-secondary border-theme-border hover:bg-theme-primary/5 hover:text-theme-primary hover:border-theme-primary/20 hover:-translate-y-0.5"
            )}
          >
            Todos
          </button>
          {BR_STATES.map(uf => (
            <button
              key={uf}
              onClick={() => onStateChange(uf === selectedState ? '' : uf)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border uppercase tracking-wider",
                selectedState === uf 
                  ? isBrazil
                    ? "bg-[#002776] text-white border-[#002776] shadow-[0_6px_20px_rgba(0,39,118,0.35)] scale-110"
                    : "bg-theme-primary text-white border-theme-primary shadow-accent-glow scale-110" 
                  : isBrazil
                    ? "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F0FDF4] hover:text-[#009C3B] hover:border-[#009C3B]/30 hover:-translate-y-0.5"
                    : "bg-theme-bg text-theme-text-secondary border-theme-border hover:bg-theme-primary/5 hover:text-theme-primary hover:border-theme-primary/20 hover:-translate-y-0.5"
              )}
            >
              {uf}
            </button>
          ))}
        </div>
      </div>

      {/* Genres Filter (Popular Tags) */}
      <div>
        <h4 className={cn(
          "text-[11px] font-black uppercase tracking-[0.2em] mb-5 ml-1",
          isBrazil ? "text-[#009C3B]" : "text-theme-text-secondary/60"
        )}>Gênero</h4>
        <div className="flex flex-wrap gap-2.5">
          {genres.slice(0, 15).map(genre => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre === selectedGenre ? '' : genre)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 border capitalize tracking-wide",
                selectedGenre === genre 
                  ? isBrazil
                    ? "bg-[#009C3B] text-white border-[#009C3B] shadow-[0_6px_20px_rgba(0,156,59,0.35)] scale-110"
                    : "bg-theme-accent text-theme-header border-theme-accent shadow-accent-glow scale-110" 
                  : isBrazil
                    ? "bg-[#F1F5F9] text-[#475569] border-[#E1E8F0] hover:bg-[#FDFCE8] hover:text-[#A16207] hover:border-[#CA8A04]/40 hover:-translate-y-0.5"
                    : "bg-theme-bg text-theme-text-secondary border-theme-border hover:bg-theme-accent/5 hover:text-theme-header hover:border-theme-accent/20 hover:-translate-y-0.5"
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

