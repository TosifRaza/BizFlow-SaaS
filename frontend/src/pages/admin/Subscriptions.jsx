import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import FormSelect from '../../components/FormSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { adminApi } from '../../api/adminApi';
import { formatDate } from '../../utils/helpers';

const STATUS_VARIANT = {
  active: 'success',
  trial: 'warning',
  expired: 'danger',
  cancelled: 'gray',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const planOptions = [
  { value: '', label: 'All Plans' },
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'business', label: 'Business' },
  { value: 'pro', label: 'Pro' },
];

function Subscriptions() {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.plan = planFilter;

      const res = await adminApi.getSubscriptions(params);
      const data = res.data?.data || res.data || res;
      setSubscriptions(data.subscriptions || data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, planFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const getDaysRemaining = (endDate, status) => {
    if (status === 'cancelled' || status === 'expired') return null;
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const columns = [
    {
      key: 'businessName',
      label: 'Business Name',
      render: (val) => <span className="font-semibold text-gray-900">{val || 'N/A'}</span>,
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (val) => (
        <Badge variant="info">{val || 'N/A'}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={STATUS_VARIANT[val?.toLowerCase()] || 'gray'}>
          {val || 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (val) => <span className="text-gray-600">{formatDate(val)}</span>,
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (val) => <span className="text-gray-600">{formatDate(val)}</span>,
    },
    {
      key: 'daysRemaining',
      label: 'Days Remaining',
      render: (val, row) => {
        const days = getDaysRemaining(row.endDate, row.status);
        if (days === null) return <span className="text-gray-400">—</span>;
        if (days < 0) return <Badge variant="danger">Expired</Badge>;
        if (days <= 7) return <Badge variant="danger">{days} days</Badge>;
        if (days <= 30) return <Badge variant="warning">{days} days</Badge>;
        return <Badge variant="success">{days} days</Badge>;
      },
    },
  ];

  const hasFilters = statusFilter || planFilter;

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle="Manage all business subscriptions"
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-full sm:w-48">
            <FormSelect
              name="status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={statusOptions}
              placeholder="All Statuses"
            />
          </div>
          <div className="w-full sm:w-48">
            <FormSelect
              name="plan"
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              options={planOptions}
              placeholder="All Plans"
            />
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStatusFilter(''); setPlanFilter(''); setPage(1); }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner type="table" />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="No subscriptions found"
          description={
            hasFilters
              ? 'Try adjusting your filters to see more results.'
              : 'Subscription records will appear here.'
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={subscriptions}
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}

export default Subscriptions;
