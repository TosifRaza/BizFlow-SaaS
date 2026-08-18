import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import FormSelect from '../../components/FormSelect';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { adminApi } from '../../api/adminApi';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const STATUS_VARIANT = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

function Payments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await adminApi.getPayments(params);
      const data = res.data?.data || res.data || res;
      setPayments(data.payments || data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const columns = [
    {
      key: 'businessName',
      label: 'Business Name',
      render: (val) => <span className="font-semibold text-gray-900">{val || 'N/A'}</span>,
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (val) => <span className="text-gray-600">{val || 'N/A'}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => (
        <span className="font-medium text-gray-900">{formatCurrency(val)}</span>
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
      key: 'provider',
      label: 'Payment Provider',
      render: (val) => (
        <span className="text-gray-600">{val || 'N/A'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => <span className="text-gray-500">{formatDateTime(val)}</span>,
    },
  ];

  const hasFilters = statusFilter || dateFrom || dateTo;

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Track all payment transactions on the platform"
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
          <div className="w-full sm:w-40">
            <FormInput
              name="dateFrom"
              type="date"
              label="From"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-full sm:w-40">
            <FormInput
              name="dateTo"
              type="date"
              label="To"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner type="table" />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description={
            hasFilters
              ? 'Try adjusting your filters to see more results.'
              : 'Payment transactions will appear here.'
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={payments}
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

export default Payments;
