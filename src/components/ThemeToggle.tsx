import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center gap-1 p-1 rounded-full bg-black/10 border border-white/5 backdrop-blur-sm group",
        className
      )}
      title={theme === 'dark' ? 'Mudar para Tema Brasil' : 'Mudar para Tema Escuro'}
    >
      <div className={cn(
        "absolute inset-1 w-6 h-6 rounded-full bg-theme-primary transition-all duration-500 ease-[var(--ease-premium)] shadow-accent-glow",
        theme === 'brazil' ? "translate-x-0" : "translate-x-7"
      )} />
      
      <div className={cn(
        "relative z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110",
        theme === 'brazil' ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" : "text-white/40 group-hover:text-white"
      )}>
        <Sun size={14} fill={theme === 'brazil' ? "currentColor" : "none"} />
      </div>
      
      <div className={cn(
        "relative z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110",
        theme === 'dark' ? "text-theme-header drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" : "text-white/40 group-hover:text-white"
      )}>
        <Moon size={14} fill={theme === 'dark' ? "currentColor" : "none"} />
      </div>
    </button>
  );
};
