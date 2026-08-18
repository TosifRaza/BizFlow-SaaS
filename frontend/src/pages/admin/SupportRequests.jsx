import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineEye, HiOutlinePaperAirplane,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import FormSelect from '../../components/FormSelect';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { formatDate } from '../../utils/helpers';

const PRIORITY_VARIANT = {
  critical: 'danger',
  high: 'warning',
  medium: 'warning',
  low: 'success',
};

const STATUS_VARIANT = {
  open: 'info',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'gray',
};

const CATEGORY_LABEL = {
  technical: 'Technical',
  billing: 'Billing',
  feature_request: 'Feature Request',
  bug_report: 'Bug Report',
  general: 'General',
};

const STATUS_LABEL = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'technical', label: 'Technical' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'general', label: 'General' },
];

function SupportRequests() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [detailRequest, setDetailRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await adminApi.getSupportRequests(params);
      const data = res.data?.data || res.data || res;
      setRequests(Array.isArray(data) ? data : []);
      setTotal(res.data?.pagination?.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load support requests');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await adminApi.getSupportRequestById(id);
      const data = res.data?.data || res.data || res;
      setDetailRequest(data);
      setResponse(data.response || '');
      setStatusUpdate(data.status || 'open');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load request details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!detailRequest) return;
    try {
      setSubmitting(true);
      const payload = {};
      if (statusUpdate) payload.status = statusUpdate;
      if (response.trim()) payload.response = response.trim();
      await adminApi.updateSupportRequest(detailRequest.id, payload);
      toast.success('Support request updated successfully');
      setDetailRequest(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update support request');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const columns = [
    {
      key: 'subject',
      label: 'Subject',
      render: (val) => <span className="font-semibold text-gray-900">{val}</span>,
    },
    {
      key: 'businessId',
      label: 'Business',
      render: (val) => <span className="text-gray-700">{val?.name || 'N/A'}</span>,
    },
    {
      key: 'userId',
      label: 'User',
      render: (val) => (
        <div>
          <div className="text-gray-900 font-medium">{val?.name || 'N/A'}</div>
          <div className="text-xs text-gray-500">{val?.email || ''}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (val) => (
        <Badge variant={PRIORITY_VARIANT[val] || 'gray'}>
          {val ? val.charAt(0).toUpperCase() + val.slice(1) : 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => <span className="text-gray-600">{CATEGORY_LABEL[val] || val || 'N/A'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={STATUS_VARIANT[val] || 'gray'}>
          {STATUS_LABEL[val] || val || 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (val) => <span className="text-gray-500">{formatDate(val)}</span>,
    },
  ];

  const hasFilters = search || statusFilter || priorityFilter || categoryFilter;

  return (
    <div>
      <PageHeader title="Support Requests" subtitle="Manage and respond to customer support requests" />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 min-w-0">
            <FormInput
              name="search"
              placeholder="Search by subject or description..."
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
              name="priority"
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              options={priorityOptions}
              placeholder="All Priorities"
            />
          </div>
          <div className="w-full sm:w-40">
            <FormSelect
              name="category"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              options={categoryOptions}
              placeholder="All Categories"
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
      ) : requests.length === 0 ? (
        <EmptyState
          title="No support requests found"
          description={hasFilters ? 'Try adjusting your filters.' : 'Support requests will appear here.'}
        />
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          pagination={{ page, limit, total, onPageChange: setPage }}
          actions={(row) => (
            <Button
              variant="ghost"
              size="sm"
              icon={HiOutlineEye}
              onClick={() => handleViewDetail(row.id)}
            >
              View
            </Button>
          )}
        />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailRequest}
        onClose={() => setDetailRequest(null)}
        title="Support Request Details"
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner type="page" />
          </div>
        ) : detailRequest ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">{detailRequest.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={PRIORITY_VARIANT[detailRequest.priority] || 'gray'}>
                    {detailRequest.priority?.charAt(0).toUpperCase() + detailRequest.priority?.slice(1)}
                  </Badge>
                  <Badge variant={STATUS_VARIANT[detailRequest.status] || 'gray'}>
                    {STATUS_LABEL[detailRequest.status] || detailRequest.status}
                  </Badge>
                  <span className="text-xs text-gray-400">{CATEGORY_LABEL[detailRequest.category]}</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business</dt>
                <dd className="mt-1 text-sm text-gray-900">{detailRequest.businessId?.name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">User</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {detailRequest.userId?.name || 'N/A'} ({detailRequest.userId?.email || ''})
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(detailRequest.createdAt)}</dd>
              </div>
              {detailRequest.assignedTo && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned To</dt>
                  <dd className="mt-1 text-sm text-gray-900">{detailRequest.assignedTo?.name || 'N/A'}</dd>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Description</dt>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {detailRequest.description}
              </div>
            </div>

            {/* Existing Response */}
            {detailRequest.response && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Previous Response</dt>
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-900 whitespace-pre-wrap">
                  {detailRequest.response}
                </div>
              </div>
            )}

            {/* Admin Response */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-sm font-medium text-gray-700">Response</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                  placeholder="Write a response to the user..."
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="w-full sm:w-48">
                <FormSelect
                  label="Update Status"
                  name="statusUpdate"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  options={statusOptions.filter((o) => o.value !== '')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setDetailRequest(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} loading={submitting} icon={HiOutlinePaperAirplane}>
                Send Response
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default SupportRequests;
