import Button from './Button';

function PageHeader({ title, subtitle, actions = [] }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {actions.length > 0 && (
        <div className="flex items-center gap-3 shrink-0">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              icon={action.icon}
              size={action.size || 'md'}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageHeader;