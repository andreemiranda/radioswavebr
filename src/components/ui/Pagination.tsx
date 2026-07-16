import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className
}) => {
  // Logic to show page numbers around current
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-8", className)}>
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-10 h-10 rounded-xl"
      >
        <ChevronLeft size={20} />
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) => (
          <React.Fragment key={idx}>
            {page === '...' ? (
              <span className="px-2 text-theme-text-secondary/50 text-sm font-bold">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "primary" : "ghost"}
                size="sm"
                onClick={() => onPageChange(Number(page))}
                className={cn(
                  "w-10 h-10 rounded-xl font-black transition-all",
                  currentPage === page ? "shadow-lg scale-110" : "text-theme-text-secondary hover:text-theme-text-primary"
                )}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-10 h-10 rounded-xl"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
};
