import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-4" aria-label="Pagination">
      <button
        className="px-2 py-1 rounded border disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        &lt;
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={`px-2 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-200' : ''}`}
          onClick={() => onPageChange(i + 1)}
          aria-label={`Page ${i + 1}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="px-2 py-1 rounded border disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
