import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    if (page <= 3) {
      end = Math.min(4, totalPages - 1);
    }
    if (page >= totalPages - 2) {
      start = Math.max(totalPages - 3, 2);
    }

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');

    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Previous page"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex items-center justify-center w-9 h-9 text-sm text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={[
              'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              p === page
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50',
            ].join(' ')}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Next page"
      >
        <HiOutlineChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

export default Pagination;
