'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 20,
  totalItems = 0,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-6 py-8 border-t border-border/40 md:flex-row">
      {totalItems > 0 ? (
        <div className="text-sm text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full border border-border/50">
          Showing <span className="font-semibold text-foreground">{startIndex}</span> -{' '}
          <span className="font-semibold text-foreground">{endIndex}</span> of{' '}
          <span className="font-semibold text-foreground">{totalItems}</span>
        </div>
      ) : <div />}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-xl h-11 px-4 hover:bg-primary/5 hover:text-primary transition-all border-border/50 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-muted-foreground font-medium">...</span>
              ) : (
                <Button
                  variant={page === currentPage ? 'default' : 'ghost'}
                  onClick={() => onPageChange(Number(page))}
                  className={cn(
                    "min-w-[44px] h-11 rounded-xl font-medium transition-all",
                    page === currentPage 
                      ? "shadow-md shadow-primary/20" 
                      : "hover:bg-primary/5 hover:text-primary text-muted-foreground"
                  )}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-xl h-11 px-4 hover:bg-primary/5 hover:text-primary transition-all border-border/50 shadow-sm"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
