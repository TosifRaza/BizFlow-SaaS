import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineEye, HiOutlineArrowPath, HiOutlineNoSymbol,
  HiOutlineCheckCircle, HiOutlineMagnifyingGlass, HiOutlineFunnel,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import FormSelect from '../../components/FormSelect';
import FormInput from '../../components/FormInput';
import { adminApi } from '../../api/adminApi';
import { formatDate } from '../../utils/helpers';

const STATUS_VARIANT = {
  active: 'success',
  trial: 'warning',
  suspended: 'danger',
  expired: 'danger',
};

const PLAN_VARIANT = {
  free: 'gray',
  starter: 'info',
  business: 'primary',
  pro: 'warning',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'expired', label: 'Expired' },
];

const planOptions = [
  { value: '', label: 'All Plans' },
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'business', label: 'Business' },
  { value: 'pro', label: 'Pro' },
];

function Businesses() {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals
  const [viewBusiness, setViewBusiness] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.plan = planFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await adminApi.getBusinesses(params);
      const data = res.data?.data || res.data || res;
      setBusinesses(data.businesses || data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, planFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleViewBusiness = async (id) => {
    try {
      setViewLoading(true);
      const res = await adminApi.getBusinessById(id);
      setViewBusiness(res.data?.data || res.data || res);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load business details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!confirmAction) return;
    try {
      setActionLoading(true);
      await adminApi.activateBusiness(confirmAction.id);
      toast.success(`"${confirmAction.name}" has been activated`);
      setConfirmAction(null);
      fetchBusinesses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate business');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirmAction) return;
    try {
      setActionLoading(true);
      await adminApi.suspendBusiness(confirmAction.id);
      toast.success(`"${confirmAction.name}" has been suspended`);
      setConfirmAction(null);
      fetchBusinesses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to suspend business');
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPlanFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const columns = [
    {
      key: 'name',
      label: 'Business Name',
      render: (val) => <span className="font-semibold text-gray-900">{val}</span>,
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (val, row) => (
        <div>
          <div className="text-gray-900 font-medium">{val}</div>
          <div className="text-xs text-gray-500">{row.ownerEmail || ''}</div>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (val) => (
        <Badge variant={PLAN_VARIANT[val?.toLowerCase()] || 'gray'}>
          {val || 'N/A'}
        </Badge>
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
      key: 'productsCount',
      label: 'Products',
      render: (val) => <span className="text-gray-600">{val ?? 0}</span>,
    },
    {
      key: 'usersCount',
      label: 'Users',
      render: (val) => <span className="text-gray-600">{val ?? 0}</span>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (val) => <span className="text-gray-500">{formatDate(val)}</span>,
    },
  ];

  const hasFilters = search || statusFilter || planFilter || dateFrom || dateTo;

  return (
    <div>
      <PageHeader title="Businesses" subtitle="Manage all registered businesses on the platform" />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 min-w-0">
            <FormInput
              name="search"
              placeholder="Search businesses..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-full sm:w-40">
            <FormSelect
              name="status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={statusOptions}
              placeholder="All Statuses"
            />
          </div>
          <div className="w-full sm:w-40">
            <FormSelect
              name="plan"
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              options={planOptions}
              placeholder="All Plans"
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
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner type="table" />
      ) : businesses.length === 0 ? (
        <EmptyState
          title="No businesses found"
          description={
            hasFilters
              ? 'Try adjusting your filters to see more results.'
              : 'Registered businesses will appear here.'
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={businesses}
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage,
          }}
          actions={(row) => (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                icon={HiOutlineEye}
                onClick={() => handleViewBusiness(row.id)}
              >
                View
              </Button>
              {row.status === 'suspended' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={HiOutlineCheckCircle}
                  onClick={() =>
                    setConfirmAction({
                      id: row.id,
                      name: row.name,
                      type: 'activate',
                    })
                  }
                >
                  Activate
                </Button>
              )}
              {row.status === 'active' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={HiOutlineNoSymbol}
                  onClick={() =>
                    setConfirmAction({
                      id: row.id,
                      name: row.name,
                      type: 'suspend',
                    })
                  }
                >
                  Suspend
                </Button>
              )}
            </div>
          )}
        />
      )}

      {/* View Business Modal */}
      <Modal
        isOpen={!!viewBusiness}
        onClose={() => setViewBusiness(null)}
        title="Business Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner type="page" />
          </div>
        ) : viewBusiness ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{viewBusiness.name}</h3>
                <p className="text-sm text-gray-500">{viewBusiness.type || 'Business'}</p>
              </div>
              <Badge variant={STATUS_VARIANT[viewBusiness.status?.toLowerCase()] || 'gray'}>
                {viewBusiness.status}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Owner Name" value={viewBusiness.owner} />
              <DetailField label="Owner Email" value={viewBusiness.ownerEmail} />
              <DetailField label="Phone" value={viewBusiness.phone} />
              <DetailField label="Address" value={viewBusiness.address} />
              <DetailField label="City" value={viewBusiness.city} />
              <DetailField label="State" value={viewBusiness.state} />
              <DetailField label="Plan" value={viewBusiness.plan} />
              <DetailField label="Created" value={formatDate(viewBusiness.createdAt)} />
            </div>

            {/* Subscription Info */}
            {viewBusiness.subscription && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Subscription Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailField label="Start Date" value={formatDate(viewBusiness.subscription.startDate)} />
                  <DetailField label="End Date" value={formatDate(viewBusiness.subscription.endDate)} />
                </div>
              </div>
            )}

            {/* Usage Stats */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Usage Stats</h4>
              <div className="grid grid-cols-3 gap-4">
                <UsageCard label="Products" value={viewBusiness.productsCount ?? 0} />
                <UsageCard label="Users" value={viewBusiness.usersCount ?? 0} />
                <UsageCard label="Branches" value={viewBusiness.branchesCount ?? 0} />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Confirm Dialog for Activate/Suspend */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmAction?.type === 'activate' ? handleActivate : handleSuspend}
        title={
          confirmAction?.type === 'activate'
            ? 'Activate Business'
            : 'Suspend Business'
        }
        message={
          confirmAction?.type === 'activate'
            ? `Are you sure you want to activate "${confirmAction?.name}"? They will regain full access to the platform.`
            : `Are you sure you want to suspend "${confirmAction?.name}"? They will lose access to the platform immediately.`
        }
        confirmText={confirmAction?.type === 'activate' ? 'Activate' : 'Suspend'}
        variant={confirmAction?.type === 'activate' ? 'info' : 'danger'}
        loading={actionLoading}
      />
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || '—'}</dd>
    </div>
  );
}

function UsageCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default Businesses;
