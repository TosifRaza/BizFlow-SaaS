import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { adminApi } from '../../api/adminApi';
import { formatDateTime } from '../../utils/helpers';

const actionTypeOptions = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'activate', label: 'Activate' },
  { value: 'suspend', label: 'Suspend' },
  { value: 'payment', label: 'Payment' },
  { value: 'other', label: 'Other' },
];

const ACTION_COLOR = {
  login: 'text-blue-700',
  logout: 'text-gray-600',
  create: 'text-green-700',
  update: 'text-yellow-700',
  delete: 'text-red-700',
  activate: 'text-emerald-700',
  suspend: 'text-orange-700',
  payment: 'text-purple-700',
};

function AuditLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 15;

  const [userSearch, setUserSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (userSearch) params.user = userSearch;
      if (actionFilter) params.action = actionFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await adminApi.getAuditLogs(params);
      const data = res.data?.data || res.data || res;
      setLogs(data.logs || data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, userSearch, actionFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      key: 'userName',
      label: 'User',
      render: (val, row) => (
        <div>
          <div className="text-gray-900 font-medium">{val || 'Unknown'}</div>
          {row.userEmail && (
            <div className="text-xs text-gray-500">{row.userEmail}</div>
          )}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (val) => {
        const colorClass = ACTION_COLOR[val?.toLowerCase()] || 'text-gray-700';
        return (
          <span className={`font-semibold ${colorClass}`}>
            {val ? val.toUpperCase() : 'N/A'}
          </span>
        );
      },
    },
    {
      key: 'resource',
      label: 'Resource',
      render: (val) => <span className="text-gray-600">{val || '—'}</span>,
    },
    {
      key: 'resourceId',
      label: 'Resource ID',
      render: (val) => {
        if (!val) return <span className="text-gray-400">—</span>;
        const truncated = val.length > 12 ? val.slice(0, 12) + '...' : val;
        return (
          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {truncated}
          </span>
        );
      },
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (val) => (
        <span className="font-mono text-sm text-gray-600">{val || '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (val) => <span className="text-gray-500">{formatDateTime(val)}</span>,
    },
  ];

  const hasFilters = userSearch || actionFilter || dateFrom || dateTo;

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Review system-wide activity and changes"
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 min-w-0">
            <FormInput
              name="userSearch"
              placeholder="Search by user name or email..."
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-full sm:w-44">
            <FormSelect
              name="action"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              options={actionTypeOptions}
              placeholder="All Actions"
            />
          </div>
          <div className="w-full sm:w-36">
            <FormInput
              name="dateFrom"
              type="date"
              label="From"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-full sm:w-36">
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
              onClick={() => {
                setUserSearch('');
                setActionFilter('');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner type="table" />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description={
            hasFilters
              ? 'Try adjusting your filters to see more results.'
              : 'System activity logs will appear here.'
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={logs}
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

export default AuditLogs;
