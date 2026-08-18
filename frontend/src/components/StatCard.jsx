import { HiOutlineArrowUp, HiOutlineArrowDown, HiOutlineMinus } from 'react-icons/hi2';

const colorConfig = {
  blue: {
    border: 'border-l-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  green: {
    border: 'border-l-green-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  red: {
    border: 'border-l-red-600',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  purple: {
    border: 'border-l-purple-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  orange: {
    border: 'border-l-orange-600',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  yellow: {
    border: 'border-l-yellow-500',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
};

const trendConfig = {
  up: {
    icon: HiOutlineArrowUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  down: {
    icon: HiOutlineArrowDown,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  neutral: {
    icon: HiOutlineMinus,
    color: 'text-gray-500',
    bg: 'bg-gray-100',
  },
};

function StatCard({
  title,
  value,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  color = 'blue',
}) {
  const colors = colorConfig[color] || colorConfig.blue;
  const trendInfo = trendConfig[trend] || trendConfig.neutral;
  const TrendIcon = trendInfo.icon;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${colors.border} p-5 flex items-start justify-between gap-4`}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm font-medium text-gray-500 truncate">{title}</span>
        <span className="text-2xl font-bold text-gray-900 truncate">{value}</span>
        {trendValue !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${trendInfo.color} ${trendInfo.bg}`}
            >
              <TrendIcon className="w-3.5 h-3.5" />
              {trendValue}
            </span>
          </div>
        )}
      </div>
      {Icon && (
        <div
          className={`shrink-0 p-3 rounded-xl ${colors.iconBg}`}
        >
          <Icon className={`w-6 h-6 ${colors.iconColor}`} />
        </div>
      )}
    </div>
  );
}

export default StatCard;