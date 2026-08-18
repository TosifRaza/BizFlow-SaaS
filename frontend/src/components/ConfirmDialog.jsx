import Modal from './Modal';
import Button from './Button';
import { HiOutlineExclamationTriangle, HiOutlineExclamationCircle, HiOutlineInformationCircle } from 'react-icons/hi2';

const variantConfig = {
  danger: {
    icon: HiOutlineExclamationTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    buttonVariant: 'danger',
  },
  warning: {
    icon: HiOutlineExclamationCircle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    buttonVariant: 'secondary',
  },
  info: {
    icon: HiOutlineInformationCircle,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    buttonVariant: 'primary',
  },
};

function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  variant = 'danger',
  loading = false,
}) {
  const config = variantConfig[variant] || variantConfig.danger;
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm" title={title}>
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`p-3 rounded-full ${config.iconBg}`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        <div className="flex items-center gap-3 mt-2 w-full">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
