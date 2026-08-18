import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash,
  HiOutlineCheck, HiOutlineXMark, HiOutlineSparkles,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminApi } from '../../api/adminApi';

const INITIAL_FORM = {
  key: '',
  name: '',
  description: '',
  enabled: false,
};

function FeatureFlags() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getFeatureFlags();
      const data = res.data?.data || res.data || res;
      setFlags(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const openCreateModal = () => {
    setEditingFlag(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (flag) => {
    setEditingFlag(flag);
    setForm({
      key: flag.key || '',
      name: flag.name || '',
      description: flag.description || '',
      enabled: flag.enabled || false,
    });
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.key.trim() || !form.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      key: form.key.trim().replace(/\s+/g, '_').toLowerCase(),
      name: form.name.trim(),
      description: form.description.trim(),
      enabled: form.enabled,
    };

    try {
      setSubmitting(true);
      if (editingFlag) {
        await adminApi.updateFeatureFlag(editingFlag.id, payload);
        toast.success('Feature flag updated successfully');
      } else {
        await adminApi.createFeatureFlag(payload);
        toast.success('Feature flag created successfully');
      }
      setModalOpen(false);
      fetchFlags();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save feature flag');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      await adminApi.deleteFeatureFlag(deleteConfirm.id);
      toast.success('Feature flag deleted successfully');
      setDeleteConfirm(null);
      fetchFlags();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete feature flag');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (flag) => {
    try {
      setTogglingId(flag.id);
      await adminApi.toggleFeatureFlag(flag.id);
      toast.success(`"${flag.name}" ${flag.enabled ? 'disabled' : 'enabled'}`);
      fetchFlags();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle feature flag');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <LoadingSpinner type="page" />;

  return (
    <div>
      <PageHeader
        title="Feature Flags"
        subtitle="Manage feature flags for controlling platform features"
        actions={[
          { label: 'Add Flag', icon: HiOutlinePlus, onClick: openCreateModal },
        ]}
      />

      {flags.length === 0 ? (
        <EmptyState
          title="No feature flags configured"
          description="Create feature flags to control which features are available."
          actionLabel="Add Flag"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {flags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onEdit={openEditModal}
              onDelete={() => setDeleteConfirm(flag)}
              onToggle={handleToggle}
              toggling={togglingId === flag.id}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Key"
            name="key"
            required
            placeholder="e.g. new_dashboard"
            value={form.key}
            onChange={(e) => handleFormChange('key', e.target.value)}
            disabled={!!editingFlag}
          />
          <FormInput
            label="Name"
            name="name"
            required
            placeholder="e.g. New Dashboard"
            value={form.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
              placeholder="Describe what this flag controls..."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => handleFormChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">Enabled</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingFlag ? 'Update Flag' : 'Create Flag'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Feature Flag"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

function FlagCard({ flag, onEdit, onDelete, onToggle, toggling }) {
  const plans = Array.isArray(flag.enabledForPlans) ? flag.enabledForPlans : [];

  return (
    <div className="relative bg-white rounded-xl border p-5 flex flex-col transition-shadow hover:shadow-md border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 truncate">{flag.name}</h3>
            <Badge variant={flag.enabled ? 'success' : 'gray'}>
              {flag.enabled ? 'On' : 'Off'}
            </Badge>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{flag.key}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
          <input
            type="checkbox"
            checked={flag.enabled}
            onChange={() => onToggle(flag)}
            disabled={toggling}
            className="sr-only peer"
          />
          <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
            flag.enabled ? 'bg-green-500' : 'bg-gray-200'
          } ${toggling ? 'opacity-50' : ''}`}></div>
        </label>
      </div>

      {flag.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{flag.description}</p>
      )}

      {plans.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {plans.map((plan) => (
            <Badge key={plan.id || plan._id} variant="info" className="text-[10px]">
              {plan.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
        <Button
          variant="secondary"
          size="sm"
          icon={HiOutlinePencilSquare}
          onClick={() => onEdit(flag)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={HiOutlineTrash}
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default FeatureFlags;
