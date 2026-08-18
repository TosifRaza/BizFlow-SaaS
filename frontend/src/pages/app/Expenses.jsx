import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCurrencyRupee,
  HiOutlineCalendarDays,
  HiOutlineTag,
  HiOutlineReceiptPercent,
} from 'react-icons/hi2';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import ChartCard from '../../components/ChartCard';
import { expenseApi } from '../../api/expenseApi';
import { useAuth } from '../../context/AuthContext';
import {
  formatCurrency,
  formatDate,
  PAYMENT_METHODS,
  EXPENSE_CATEGORIES,
} from '../../utils/helpers';

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));
const PAYMENT_OPTIONS = PAYMENT_METHODS;
const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...CATEGORY_OPTIONS,
];
const PAYMENT_FILTER_OPTIONS = [
  { value: '', label: 'All Methods' },
  ...PAYMENT_OPTIONS,
];

const CHART_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
];

function Expenses() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('expenses.create');
  const canUpdate = hasPermission('expenses.update');
  const canDelete = hasPermission('expenses.delete');

  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    thisMonthTotal: 0,
    todayTotal: 0,
    topCategory: '—',
    byCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 10;

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const [formModal, setFormModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: '',
    description: '',
    attachment: null,
  });
  const [formLoading, setFormLoading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, search };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (categoryFilter) params.category = categoryFilter;
      if (paymentFilter) params.method = paymentFilter;
      const { data } = await expenseApi.getAll(params);
      setExpenses(data.data || data.expenses || data || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFrom, dateTo, categoryFilter, paymentFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await expenseApi.getStats();
      setStats((prev) => ({
        thisMonthTotal: data.thisMonthTotal ?? data.monthTotal ?? prev.thisMonthTotal,
        todayTotal: data.todayTotal ?? data.today ?? prev.todayTotal,
        topCategory: data.topCategory ?? prev.topCategory,
        byCategory: data.byCategory ?? data.categories ?? prev.byCategory,
      }));
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [fetchExpenses, fetchStats]);

  const openAddModal = () => {
    setEditingExpense(null);
    setForm({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: '',
      description: '',
      attachment: null,
    });
    setFormModal(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setForm({
      category: expense.category || '',
      amount: String(expense.amount ?? ''),
      date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
      method: expense.method || expense.paymentMethod || '',
      description: expense.description || '',
      attachment: null,
    });
    setFormModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error('Category is required');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!form.date) {
      toast.error('Date is required');
      return;
    }
    setFormLoading(true);
    try {
      const payload = new FormData();
      payload.append('category', form.category);
      payload.append('amount', form.amount);
      payload.append('date', form.date);
      if (form.method) payload.append('method', form.method);
      if (form.description) payload.append('description', form.description);
      if (form.attachment) payload.append('attachment', form.attachment);

      if (editingExpense) {
        await expenseApi.update(editingExpense.id, payload);
        toast.success('Expense updated');
      } else {
        await expenseApi.create(payload);
        toast.success('Expense added');
      }
      setFormModal(false);
      fetchExpenses();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await expenseApi.delete(deleteId);
      toast.success('Expense deleted');
      setDeleteId(null);
      fetchExpenses();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setCategoryFilter('');
    setPaymentFilter('');
    setPage(1);
  };

  const hasActiveFilters = dateFrom || dateTo || categoryFilter || paymentFilter;

  const chartData = useMemo(() => {
    if (!stats.byCategory || stats.byCategory.length === 0) return [];
    return stats.byCategory.map((item, idx) => ({
      name: item.category || item.name,
      amount: item.total || item.amount || 0,
      fill: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [stats.byCategory]);

  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => <Badge variant="info">{val || '—'}</Badge>,
    },
    { key: 'description', label: 'Description', render: (val) => val || '—' },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-gray-900">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'method',
      label: 'Payment Method',
      render: (val, row) => {
        const method = val || row.paymentMethod;
        if (!method) return '—';
        const label = PAYMENT_METHODS.find((p) => p.value === method)?.label || method;
        return <span className="capitalize">{label}</span>;
      },
    },
  ];

  if (loading) return <LoadingSpinner type="page" />;

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track and manage business expenses"
        actions={
          canCreate
            ? [{ label: 'Add Expense', icon: HiOutlinePlus, onClick: openAddModal }]
            : []
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="This Month Expenses"
          value={formatCurrency(stats.thisMonthTotal)}
          icon={HiOutlineCurrencyRupee}
          color="blue"
        />
        <StatCard
          title="Today's Expenses"
          value={formatCurrency(stats.todayTotal)}
          icon={HiOutlineCalendarDays}
          color="orange"
        />
        <StatCard
          title="Top Category"
          value={stats.topCategory}
          icon={HiOutlineTag}
          color="green"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <FormInput
            label="From"
            name="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-40"
          />
          <FormInput
            label="To"
            name="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-40"
          />
          <div className="w-44">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORY_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label className="text-xs text-gray-500 mt-1 block">Category</label>
          </div>
          <div className="w-44">
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PAYMENT_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label className="text-xs text-gray-500 mt-1 block">Payment Method</label>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DataTable
            columns={columns}
            data={expenses}
            loading={loading}
            onSearch={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search expenses..."
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
            }}
            actions={(row) => (
              <div className="flex items-center gap-1">
                {canUpdate && (
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(row)}>
                    <HiOutlinePencilSquare className="w-4 h-4 text-blue-600" />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)}>
                    <HiOutlineTrash className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>
            )}
          />

          {expenses.length === 0 && !loading && (
            <EmptyState
              icon={<HiOutlineReceiptPercent className="w-16 h-16" />}
              title="No expenses recorded"
              description="Start tracking expenses to keep your finances in check."
              actionLabel="Add Expense"
              onAction={openAddModal}
            />
          )}
        </div>

        <div>
          <ChartCard title="Monthly Breakdown" subtitle="Expenses by category this month">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <HiOutlineReceiptPercent className="w-10 h-10 mb-2" />
                <p className="text-sm">No chart data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      <Modal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        size="md"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Category"
              name="category"
              value={form.category}
              onChange={handleFormChange}
              options={CATEGORY_OPTIONS}
              placeholder="Select category"
              required
            />
            <FormInput
              label="Amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleFormChange}
              placeholder="0"
              required
            />
            <FormInput
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleFormChange}
              required
            />
            <FormSelect
              label="Payment Method"
              name="method"
              value={form.method}
              onChange={handleFormChange}
              options={PAYMENT_OPTIONS}
              placeholder="Select method"
            />
            <div className="sm:col-span-2">
              <FormInput
                label="Description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Expense description"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="attachment" className="text-sm font-medium text-gray-700">
                  Attachment
                </label>
                <input
                  id="attachment"
                  name="attachment"
                  type="file"
                  onChange={handleFormChange}
                  accept="image/*,.pdf"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setFormModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingExpense ? 'Update' : 'Add'} Expense
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}

export default Expenses;