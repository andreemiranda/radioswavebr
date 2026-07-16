import React, { useState, useEffect, useMemo } from 'react';
import { Radio, Search, SlidersHorizontal, Signal, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { radioService } from '../services/radioService';
import { RadioStation } from '../types';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { Footer } from '../components/Footer';
import { FilterPanel } from '../components/FilterPanel';
import { RadioCard } from '../components/RadioCard';
import { Pagination } from '../components/ui/Pagination';
import { RadioCardSkeleton } from '../components/ui/Skeleton';
import { usePlayer } from '../context/PlayerContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { CUSTOM_STATIONS } from '../data/customStations';

const LIMIT = 24;

const Home: React.FC = () => {
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<'guia' | 'search' | 'favorites'>('guia');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  // --- PLAYER FROM CONTEXT ---
  const { 
    playing, 
    isPlaying, 
    playStation, 
    toggleFavorite, 
    isFavorite, 
    favorites 
  } = usePlayer();

  // --- QUERIES ---
  
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => radioService.getTags(30),
  });
  
  const genres = useMemo(() => {
    if (Array.isArray(tagsData?.data)) {
      return tagsData.data.map(t => t.name);
    }
    return [];
  }, [tagsData]);

  /**
   * Merges a filtered list of local/custom stations with a page of API
   * results into a single, stable, page-by-page sequence — regardless of how
   * many custom stations exist or match. Custom stations always come first in
   * the overall sequence; once they're exhausted, subsequent pages are filled
   * purely from the API with correctly shifted offsets. This guarantees every
   * station (manually added or from Radio Browser) is reachable exactly once
   * through both top/bottom pagination and text search.
   */
  const fetchMergedPage = async (
    customMatches: RadioStation[],
    fetchApiPage: (limit: number, offset: number) => Promise<{ data: RadioStation[]; total: number; success: boolean }>
  ) => {
    const customCount = customMatches.length;
    const itemsBeforeThisPage = (page - 1) * LIMIT;

    if (itemsBeforeThisPage < customCount) {
      // This page still has some custom stations left to show, possibly
      // followed by the start (or continuation) of the API results.
      const customStart = itemsBeforeThisPage;
      const customSlice = customMatches.slice(customStart, customStart + LIMIT);
      const remaining = LIMIT - customSlice.length;

      const apiResult = remaining > 0
        ? await fetchApiPage(remaining, 0)
        : { data: [] as RadioStation[], total: 0, success: true };

      return {
        success: apiResult.success,
        data: [...customSlice, ...apiResult.data],
        total: apiResult.total + customCount,
      };
    }

    // All custom stations have already been shown on earlier pages — this
    // page comes purely from the API, offset by how many API items were
    // already consumed by previous pages.
    const apiOffset = itemsBeforeThisPage - customCount;
    const apiResult = await fetchApiPage(LIMIT, apiOffset);

    return {
      success: apiResult.success,
      data: apiResult.data,
      total: apiResult.total + customCount,
    };
  };

  const { 
    data: stationsData, 
    isLoading, 
    isError, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['stations', activeTab, searchQuery, selectedState, selectedGenre, page],
    queryFn: async () => {
      if (activeTab === 'favorites') return { data: favorites, total: favorites.length, success: true };

      const isSearch = activeTab === 'search' || !!selectedState || !!selectedGenre || !!searchQuery;

      if (isSearch) {
        // Normalize strings: lowercase + strip diacritics so searches without
        // accents still find stations whose names have them (e.g. "visao" finds
        // "Visão", "radio" finds "Rádio", "forro" finds "Forró").
        const normalize = (s: string) =>
          s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const query = normalize(searchQuery.trim());
        const matchingCustom = CUSTOM_STATIONS.filter(s => {
          const nameMatch = !query || normalize(s.name).includes(query);
          const tagMatch = !selectedGenre || (s.tags ?? []).some(t => normalize(t).includes(normalize(selectedGenre)));
          const stateMatch = !selectedState || normalize(s.state ?? '') === normalize(selectedState);
          return nameMatch && tagMatch && stateMatch;
        });

        return fetchMergedPage(matchingCustom, (limit, offset) =>
          radioService.searchStations({
            name: searchQuery,
            tag: selectedGenre,
            state: selectedState,
            limit,
            offset,
          })
        );
      }

      // Guia tab: all custom stations, then the general Brazil station list.
      return fetchMergedPage(CUSTOM_STATIONS, (limit, offset) =>
        radioService.getBrazilStations(limit, offset)
      );
    },
    placeholderData: (previousData) => previousData,
  });

  // --- HANDLERS ---

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
    setActiveTab('search');
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state === '' ? '' : (prev => prev === state ? '' : state));
    setPage(1);
    setActiveTab('search');
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre === '' ? '' : (prev => prev === genre ? '' : genre));
    setPage(1);
    setActiveTab('search');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRadioPlay = (station: RadioStation) => {
    playStation(station);
  };

  const handleToggleFavorite = (e: React.MouseEvent, station: RadioStation) => {
    e.stopPropagation();
    toggleFavorite(station);
  };

  const totalPages = useMemo(() => {
    if (!stationsData || typeof stationsData.total !== 'number') return 0;
    return Math.ceil(stationsData.total / LIMIT);
  }, [stationsData]);

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300 bg-theme-bg text-theme-text-primary font-body"
    )}>
      <header className={cn(
        "sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300",
        isBrazil 
          ? "bg-[#009C3B] text-white shadow-[0_4px_20px_rgba(0,0,0,0.14),0_1px_6px_rgba(0,0,0,0.08)]" 
          : "bg-theme-header/98 backdrop-blur-md text-white border-b border-white/5 shadow-elevation-2"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-default animate-pulse-ring shrink-0",
              isBrazil 
                ? "bg-[#FFDF00] text-[#009C3B] shadow-[0_4px_20px_rgba(255,223,0,0.55),0_2px_8px_rgba(255,223,0,0.30)] hover:scale-112 hover:rotate-8 hover:shadow-[0_8px_32px_rgba(255,223,0,0.70),0_4px_14px_rgba(255,223,0,0.45)]" 
                : "bg-theme-primary text-white shadow-accent-glow hover:scale-112 hover:rotate-8 hover:shadow-premium-accent-hover"
            )}>
              <Radio size={20} className={cn("sm:w-[22px] sm:h-[22px]", isBrazil ? "text-[#009C3B]" : "text-white")} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-display font-black leading-none tracking-tight truncate">Radio Wave Brasil</h1>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-[0.15em] mt-1 hidden sm:block",
                isBrazil ? "text-white/60" : "text-theme-primary opacity-90"
              )}>Premium Stream</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ThemeToggle className={isBrazil ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-white/5 border-white/5 hover:bg-white/10"} />
            
            <div className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300",
              isBrazil
                ? "bg-white/15 border-white/20 text-white shadow-[0_2px_10px_rgba(0,156,59,0.3)]"
                : isFetching 
                  ? "bg-theme-accent/20 border-theme-accent/20 text-theme-accent shadow-accent-glow" 
                  : isPlaying 
                    ? "bg-theme-primary/10 border-theme-primary/20 text-theme-primary shadow-accent-glow" 
                    : "bg-white/5 border-white/5 text-white/40"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                isBrazil
                  ? "bg-[#4ade80] animate-live-pulse"
                  : isFetching 
                    ? "bg-theme-accent animate-live-pulse" 
                    : isPlaying 
                      ? "bg-theme-primary animate-live-pulse" 
                      : "bg-white/20"
              )} />
              {isFetching ? 'Sync' : isPlaying ? 'Ao Vivo' : 'Radio'}
            </div>
            {isError && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => refetch()} 
                className="text-white/60 hover:text-white transition-colors"
              >
                <RefreshCw size={16} />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-8 pb-32 overflow-hidden">
        <section className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <form className="flex-1 flex gap-2 sm:gap-3" onSubmit={handleSearch}>
              <div className="relative flex-1 group min-w-0">
                <Search className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                  isBrazil 
                    ? "text-[#009C3B] group-focus-within:text-[#009C3B]" 
                    : "text-theme-text-secondary/40 group-focus-within:text-theme-primary"
                )} size={20} />
                <input 
                  type="text" 
                  className={cn(
                    "w-full h-[52px] sm:h-[56px] py-3 pl-12 pr-4 transition-all duration-300 font-bold",
                    isBrazil
                      ? "bg-white border-2 border-[#E2E8F0] rounded-2xl text-[15px] text-[#0F172A] placeholder-[#0F172A]/30 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] focus:border-[#009C3B] focus:shadow-[0_0_0_4px_rgba(0,156,59,0.12),0_4px_16px_rgba(0,0,0,0.08)] focus:outline-none"
                      : "bg-theme-surface border border-theme-border rounded-xl text-theme-text-primary placeholder:text-theme-text-secondary/30 focus:outline-none focus:ring-1 focus:ring-theme-primary/40 focus:border-theme-primary/50 shadow-sm"
                  )}
                  placeholder="Nome da rádio ou palavra-chave..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className={cn(
                  "h-[52px] sm:h-[56px] shrink-0 rounded-2xl px-5 sm:px-8 font-black uppercase tracking-widest text-xs transition-all duration-300",
                  isBrazil
                    ? "bg-[#009C3B] text-white shadow-[0_4px_16px_rgba(0,156,59,0.35),0_2px_8px_rgba(0,0,0,0.10)] hover:bg-[#007A2F] hover:shadow-[0_8px_24px_rgba(0,156,59,0.45)] hover:-translate-y-0.5"
                    : "bg-theme-primary text-white shadow-accent-glow hover:shadow-premium-accent-hover hover:-translate-y-0.5 active:scale-95"
                )}
              >
                Buscar
              </Button>
            </form>
            
            <Button 
              variant="outline" 
              className={cn(
                "h-[52px] sm:h-[56px] shrink-0 rounded-2xl px-5 sm:px-6 border transition-all duration-300 font-black uppercase tracking-widest text-[11px]",
                showFilters 
                  ? isBrazil 
                    ? "bg-[#009C3B]/5 border-[#009C3B]/30 text-[#009C3B] shadow-inner" 
                    : "bg-theme-primary/5 border-theme-primary/30 text-theme-primary shadow-inner"
                  : isBrazil
                    ? "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#009C3B]/30 hover:bg-[#F0FDF4]/50 shadow-sm"
                    : "bg-theme-surface border-theme-border text-theme-text-secondary hover:border-theme-primary/30 hover:bg-theme-primary/5 shadow-sm"
              )}
              onClick={() => {
                setShowFilters(!showFilters);
              }}
            >
              <SlidersHorizontal size={18} className="mr-2 opacity-60" />
              <span>Filtros</span>
            </Button>
          </div>
        </section>

        {showFilters && (
          <div className="mb-10 animate-slide-up-fade">
            <FilterPanel 
              selectedState={selectedState}
              onStateChange={handleStateChange}
              selectedGenre={selectedGenre}
              onGenreChange={handleGenreChange}
              genres={genres}
            />
          </div>
        )}

        <nav className={cn(
          "flex items-center gap-8 mb-10 overflow-x-auto no-scrollbar scroll-smooth border-b",
          isBrazil ? "border-[#E2E8F0]/80" : "border-theme-border"
        )}>
          {[
            { id: 'guia' as const, label: '📋 Geral' },
            { id: 'search' as const, label: '🔍 Populares' },
            { id: 'favorites' as const, label: '⭐ Favoritos' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={cn(
                "pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative whitespace-nowrap outline-none px-1",
                activeTab === tab.id 
                  ? isBrazil ? "text-[#002776]" : "text-theme-primary" 
                  : "text-[#94A3B8] hover:text-[#475569] hover:scale-105"
              )}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className={cn(
                  "absolute bottom-[-2px] left-0 right-0 h-[3px] rounded-t-full animate-tab-indicator",
                  isBrazil 
                    ? "bg-gradient-to-r from-[#009C3B] to-[#002776] shadow-[0_-3px_16px_rgba(0,39,118,0.45)]" 
                    : "bg-theme-primary"
                )} />
              )}
            </button>
          ))}
        </nav>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RadioCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className={cn(
            "text-center py-20 rounded-[2rem] border shadow-card animate-in fade-in zoom-in-95 duration-300",
            isBrazil ? "bg-white border-[#E2E8F0]" : "bg-theme-surface border-theme-border"
          )}>
            <Signal className="mx-auto mb-6 text-theme-text-secondary/20" size={80} />
            <h3 className={cn("text-xl font-display font-black mb-2", isBrazil ? "text-[#009C3B]" : "text-theme-primary")}>Conexão Interrompida</h3>
            <p className="text-theme-text-secondary font-semibold mb-6">Não conseguimos sintonizar as rádios agora.</p>
            <Button onClick={() => refetch()} variant="outline" className={isBrazil ? "border-[#009C3B] text-[#009C3B] hover:bg-[#009C3B]/5" : "border-theme-primary text-theme-primary hover:bg-theme-primary/10"}>Tentar Novamente</Button>
          </div>
        ) : (stationsData?.data?.length ?? 0) === 0 ? (
          <div className={cn(
            "text-center py-20 rounded-[2rem] border shadow-card",
            isBrazil ? "bg-white border-[#E2E8F0]" : "bg-theme-surface border-theme-border"
          )}>
            <Signal className="mx-auto mb-4 text-theme-text-secondary/20" size={60} />
            <p className="text-theme-text-secondary/60 font-bold tracking-widest uppercase text-sm">Nenhuma rádio encontrada.</p>
            {(searchQuery || selectedGenre || selectedState) && (
              <Button 
                variant="ghost" 
                className={cn(
                  "mt-4 font-black uppercase text-xs tracking-widest",
                  isBrazil ? "text-[#009C3B] hover:bg-[#009C3B]/5" : "text-theme-primary hover:bg-theme-primary/5"
                )} 
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setSelectedState('');
                  setSelectedGenre('');
                  setPage(1);
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            {activeTab !== 'favorites' && totalPages > 1 && (
              <Pagination 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-0 mb-6"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.isArray(stationsData?.data) && stationsData.data.map((station, index) => (
                <RadioCard 
                  key={station.id}
                  station={station}
                  index={index % 12}
                  isPlaying={isPlaying && playing?.id === station.id}
                  isActive={playing?.id === station.id}
                  isFavorite={isFavorite(station.id)}
                  onPlay={handleRadioPlay}
                  onFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {activeTab !== 'favorites' && totalPages > 1 && (
              <Pagination 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>

      <Footer />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Home;

