import { HiOutlineArrowPath } from 'react-icons/hi2';

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="h-8 bg-gray-200 rounded-lg w-64" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded flex-1" style={{ width: `${30 + Math.random() * 40}%` }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-40" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-9 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-300 p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-7 bg-gray-200 rounded w-32" />
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-10 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-8">
        <div className="h-10 bg-gray-200 rounded-lg w-24" />
        <div className="h-10 bg-gray-200 rounded-lg w-24" />
      </div>
    </div>
  );
}

function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <HiOutlineArrowPath className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Loading...</p>
    </div>
  );
}

const skeletonMap = {
  table: TableSkeleton,
  card: CardSkeleton,
  form: FormSkeleton,
  page: PageSpinner,
};

function LoadingSpinner({ type = 'page' }) {
  const Component = skeletonMap[type] || PageSpinner;
  return <Component />;
}

export default LoadingSpinner;
