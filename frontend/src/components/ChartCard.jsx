function ChartCard({ title, subtitle, children, className = '', action }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          {title && (
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

export default ChartCard;
