import { useState, useMemo, useCallback } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineArrowUp, HiOutlineArrowDown, HiOutlineBars3 } from 'react-icons/hi2';
import Pagination from './Pagination';

function SkeletonRow({ colCount }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

function DataTable({
  columns = [],
  data = [],
  loading = false,
  pagination,
  onSearch,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data found.',
  actions,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSearchChange = useCallback(
    (e) => {
      const val = e.target.value;
      setSearchValue(val);
      if (onSearch) onSearch(val);
    },
    [onSearch]
  );

  const handleSort = useCallback(
    (key) => {
      if (!columns.find((c) => c.key === key)?.sortable) return;
      setSortDir((prev) => (sortKey === key && prev === 'asc' ? 'desc' : 'asc'));
      setSortKey(key);
    },
    [columns, sortKey]
  );

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const colCount = columns.length + (actions ? 1 : 0);
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {onSearch && (
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <div className="relative w-full sm:w-72">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={[
                    'px-4 py-3 whitespace-nowrap',
                    col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : '',
                  ].join(' ')}
                >
                  <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? (
                      <HiOutlineArrowUp className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <HiOutlineArrowDown className="w-3.5 h-3.5 text-blue-600" />
                    )
                  )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 whitespace-nowrap">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} colCount={colCount} />
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <HiOutlineBars3 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIdx) => (
                <tr
                  key={row.id ?? rowIdx}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 whitespace-nowrap text-gray-700"
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1}&ndash;
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <Pagination
            page={pagination.page}
            totalPages={totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;
