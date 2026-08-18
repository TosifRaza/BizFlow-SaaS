import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash,
  HiOutlineCheck, HiOutlineXMark, HiOutlineSparkles,
  HiOutlineCube, HiOutlineUserGroup, HiOutlineBuildingStorefront,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminApi } from '../../api/adminApi';
import { formatCurrency } from '../../utils/helpers';

const intervalOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const INITIAL_FORM = {
  name: '',
  price: '',
  interval: 'monthly',
  productsLimit: '',
  usersLimit: '',
  branchesLimit: '',
  features: '',
  isPopular: false,
};

function Plans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPlans();
      const data = res.data?.data || res.data || res;
      setPlans(Array.isArray(data) ? data : data.plans || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name || '',
      price: plan.price ?? '',
      interval: plan.interval || 'monthly',
      productsLimit: plan.productsLimit ?? '',
      usersLimit: plan.usersLimit ?? '',
      branchesLimit: plan.branchesLimit ?? '',
      features: Array.isArray(plan.features) ? plan.features.join(', ') : plan.features || '',
      isPopular: plan.isPopular || false,
    });
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      interval: form.interval,
      productsLimit: Number(form.productsLimit) || 0,
      usersLimit: Number(form.usersLimit) || 0,
      branchesLimit: Number(form.branchesLimit) || 0,
      features: form.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      isPopular: form.isPopular,
    };

    try {
      setSubmitting(true);
      if (editingPlan) {
        await adminApi.updatePlan(editingPlan.id, payload);
        toast.success('Plan updated successfully');
      } else {
        await adminApi.createPlan(payload);
        toast.success('Plan created successfully');
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      await adminApi.updatePlan(deleteConfirm.id, { status: 'archived' });
      toast.success('Plan deleted successfully');
      setDeleteConfirm(null);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner type="page" />;

  return (
    <div>
      <PageHeader
        title="Plans"
        subtitle="Manage subscription plans offered on the platform"
        actions={[
          { label: 'Create Plan', icon: HiOutlinePlus, onClick: openCreateModal },
        ]}
      />

      {plans.length === 0 ? (
        <EmptyState
          title="No plans configured"
          description="Create subscription plans for businesses."
          actionLabel="Create Plan"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={openEditModal}
              onDelete={() => setDeleteConfirm(plan)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? 'Edit Plan' : 'Create Plan'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Plan Name"
              name="name"
              required
              placeholder="e.g. Starter"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
            <FormInput
              label="Price (₹)"
              name="price"
              type="number"
              required
              min="0"
              placeholder="0"
              value={form.price}
              onChange={(e) => handleFormChange('price', e.target.value)}
            />
          </div>

          <FormSelect
            label="Billing Interval"
            name="interval"
            value={form.interval}
            onChange={(e) => handleFormChange('interval', e.target.value)}
            options={intervalOptions}
          />

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Limits</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Products"
                name="productsLimit"
                type="number"
                min="0"
                placeholder="Unlimited"
                value={form.productsLimit}
                onChange={(e) => handleFormChange('productsLimit', e.target.value)}
              />
              <FormInput
                label="Users"
                name="usersLimit"
                type="number"
                min="0"
                placeholder="Unlimited"
                value={form.usersLimit}
                onChange={(e) => handleFormChange('usersLimit', e.target.value)}
              />
              <FormInput
                label="Branches"
                name="branchesLimit"
                type="number"
                min="0"
                placeholder="Unlimited"
                value={form.branchesLimit}
                onChange={(e) => handleFormChange('branchesLimit', e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <FormInput
              label="Features"
              name="features"
              type="textarea"
              placeholder="Enter features separated by commas (e.g. Inventory Management, Reports, Multi-branch)"
              value={form.features}
              onChange={(e) => handleFormChange('features', e.target.value)}
              className="[&_textarea]:min-h-[100px]"
            />
          </div>

          <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => handleFormChange('isPopular', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
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
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Plan"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

function PlanCard({ plan, onEdit, onDelete }) {
  const features = Array.isArray(plan.features)
    ? plan.features
    : typeof plan.features === 'string'
      ? plan.features.split(',').map((f) => f.trim()).filter(Boolean)
      : [];

  const isActive = plan.status !== 'archived' && plan.status !== 'inactive';

  return (
    <div
      className={`relative bg-white rounded-xl border p-5 flex flex-col transition-shadow hover:shadow-md ${
        plan.isPopular
          ? 'border-blue-400 ring-2 ring-blue-100'
          : 'border-gray-200'
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
            <HiOutlineSparkles className="w-3.5 h-3.5" />
            Popular
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4 mt-1">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
            </span>
            {plan.price > 0 && plan.interval && (
              <span className="text-sm text-gray-500">
                /{plan.interval === 'monthly' ? 'mo' : 'yr'}
              </span>
            )}
          </div>
        </div>
        <Badge variant={isActive ? 'success' : 'gray'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Limits */}
      <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-gray-100">
        <LimitItem icon={HiOutlineCube} label="Products" value={plan.productsLimit} />
        <LimitItem icon={HiOutlineUserGroup} label="Users" value={plan.usersLimit} />
        <LimitItem
          icon={HiOutlineBuildingStorefront}
          label="Branches"
          value={plan.branchesLimit}
        />
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2 mb-4">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
            <HiOutlineCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            {feature}
          </li>
        ))}
        {features.length === 0 && (
          <li className="text-sm text-gray-400">No features listed</li>
        )}
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <Button
          variant="secondary"
          size="sm"
          icon={HiOutlinePencilSquare}
          onClick={() => onEdit(plan)}
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

function LimitItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-gray-500">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <span className="font-medium text-gray-900">
        {value ? value : 'Unlimited'}
      </span>
    </div>
  );
}

export default Plans;
