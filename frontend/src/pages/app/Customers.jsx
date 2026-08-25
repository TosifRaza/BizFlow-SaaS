// import { useState, useEffect, useCallback } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBanknotes,
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineShoppingCart,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineIdentification,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
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
import { customerApi } from '../../api/customerApi';
import { formatCurrency, formatDate, formatDateTime, PAYMENT_METHODS } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';


const emptyForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
  openingBalance: '',
  creditLimit: '',
  notes: '',
};

const emptyPayment = {
  amount: '',
  method: '',
  notes: '',
};

function Customers() {
  // const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState([]);
  // const [stats, setStats] = useState({ totalCustomers: "", totalDue: "" ,totalPurchases: "" });
  const [stats, setStats] = useState({ totalCustomers: 0, totalDue: 0, totalPurchases: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
const { hasPermission } = useAuth();
const canCreate = hasPermission('customers.create');
const canUpdate = hasPermission('customers.update');
const canDelete = hasPermission('customers.delete');
  const [formModal, setFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  const [detailModal, setDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  const [ledgerData, setLedgerData] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [payment, setPayment] = useState(emptyPayment);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const limit = 10;

  // const fetchCustomers = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const { data } = await customerApi.getAll({ page, limit, search });
  //     const payload = data.data || data;
  //     setCustomers(payload.data || payload.customers || (Array.isArray(payload) ? payload : []));
  //     setTotal(payload.total ?? data.total ?? 0);
  //     setCustomers(data.data || data);
  //         setTotal(data.pagination?.total ?? data.total ?? 0);
  //   } catch (err) {
  //     toast.error('Failed to load customers');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [page, search]);
    const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await customerApi.getAll({ page, limit, search });
      setCustomers(data.data || data);
      setTotal(data.pagination?.total ?? data.total ?? 0);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await customerApi.getStats();
      setStats(data.data || data);
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [fetchCustomers, fetchStats]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setFormModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || '',
      openingBalance: customer.openingBalance ?? '',
      creditLimit: customer.creditLimit ?? '',
      notes: customer.notes || '',
    });
    setFormModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and Phone are required');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        openingBalance: form.openingBalance ? Number(form.openingBalance) : 0,
        creditLimit: form.creditLimit ? Number(form.creditLimit) : 0,
      };
      if (editingCustomer) {
        await customerApi.update(editingCustomer.id, payload);
        toast.success('Customer updated');
      } else {
        await customerApi.create(payload);
        toast.success('Customer added');
      }
      setFormModal(false);
      fetchCustomers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setFormLoading(false);
    }
  };

  const openDetailModal = async (customer) => {
    setSelectedCustomer(customer);
    setActiveTab('ledger');
    setDetailModal(true);
    setDetailLoading(true);
    try {
      const [ledgerRes, detailRes] = await Promise.all([
        customerApi.getLedger(customer.id),
        customerApi.getById(customer.id),
      ]);
      // setLedgerData(ledgerRes.data.data || ledgerRes.data.ledger || ledgerRes.data || []);
      // OR
//       const lr = ledgerRes.data;
// setLedgerData(
//   Array.isArray(lr?.data?.data) ? lr.data.data
//   : Array.isArray(lr?.data) ? lr.data
//   : Array.isArray(lr?.ledger) ? lr.ledger
//   : Array.isArray(lr) ? lr
//   : []
// );
// OR
setLedgerData(Array.isArray(ledgerRes.data?.data?.data) ? ledgerRes.data.data.data : []);
      const detail = detailRes.data.customer || detailRes.data;
      setSelectedCustomer({ ...customer, ...detail });
      setPurchaseHistory(detail.purchases || []);
      setPaymentHistory(detail.payments || []);
    } catch {
      toast.error('Failed to load customer details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (!selectedCustomer) return;
    setTabLoading(true);
    try {
      if (tab === 'ledger') {
        const { data } = await customerApi.getLedger(selectedCustomer.id);
        // setLedgerData(data.data || data.ledger || data || []);
        setLedgerData(Array.isArray(data?.data?.data) ? data.data.data : []);
      }
    } catch {
      toast.error('Failed to load tab data');
    } finally {
      setTabLoading(false);
    }
  };

  const openPaymentModal = (customer) => {
    setPaymentCustomer(customer);
    setPayment({
      amount: String(customer.balanceDue || customer.balance || 0),
      method: '',
      notes: '',
    });
    setPaymentModal(true);
  };
  const computedStats = useMemo(() => ({
    totalDue: customers.reduce((sum, c) => sum + (c.balanceDue ?? c.balance ?? 0), 0),
    totalPurchases: customers.reduce((sum, c) => sum + (c.totalPurchases ?? 0), 0),
  }), [customers]);
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payment.amount || Number(payment.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!payment.method) {
      toast.error('Select a payment method');
      return;
    }
    setPaymentLoading(true);
    try {
      await customerApi.recordPayment(paymentCustomer.id, {
        amount: Number(payment.amount),
        method: payment.method,
        notes: payment.notes,
      });
      toast.success('Payment recorded');
      setPaymentModal(false);
      fetchCustomers();
      fetchStats();
      if (detailModal && selectedCustomer?.id === paymentCustomer.id) {
        openDetailModal(paymentCustomer);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await customerApi.delete(deleteId);
      toast.success('Customer deleted');
      setDeleteId(null);
      fetchCustomers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email', render: (val) => val || '—' },
    {
      key: 'totalPurchases',
      label: 'Total Purchases',
      sortable: true,
      render: (val) => formatCurrency(val),
    },
    {
      key: 'balanceDue',
      label: 'Balance Due',
      sortable: true,
      render: (val) => (
        <span className={val > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  if (loading) return <LoadingSpinner type="page" />;

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${total} customer${total !== 1 ? 's' : ''} in your database`}
        actions={hasPermission('customers.create') ? [
          { label: 'Add Customer', icon: HiOutlinePlus, onClick: openAddModal },
        ] : []}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* <StatCard
          title="Total Customers"
          value={stats.totalCustomers ?? 0}
          icon={HiOutlineUserGroup}
          color="blue"
        />
        <StatCard
          title="Total Due"
          value={formatCurrency(stats.totalDue ?? 0)}
          icon={HiOutlineCurrencyRupee}
          color="orange"
        />
        <StatCard
          title="Total Purchases"
          value={formatCurrency(stats.totalPurchases ?? 0)}
          icon={HiOutlineShoppingCart}
          color="green"
        /> */}
                 <StatCard
           title="Total Customers"
          // value={stats.totalCustomers ?? 0}
          value={stats.totalCustomers || total}
           icon={HiOutlineUserGroup}
           color="blue"
         />
         <StatCard
           title="Total Due"
          // value={formatCurrency(stats.totalDue ?? 0)}
          value={formatCurrency(stats.totalDue ?? computedStats.totalDue)}
           icon={HiOutlineCurrencyRupee}
           color="orange"
         />
         <StatCard
           title="Total Purchases"
        // value={formatCurrency(stats.totalPurchases ?? 0)}
       value={formatCurrency(stats.totalPurchases ?? computedStats.totalPurchases)}
           icon={HiOutlineShoppingCart}
           color="green"
         />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        onSearch={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search customers..."
        pagination={{
          page,
          limit,
          total,
          onPageChange: setPage,
        }}
        actions={(row) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => openDetailModal(row)}>
              <HiOutlineEye className="w-4 h-4" />
            </Button>
            {hasPermission('customers.update') && (
            <Button variant="ghost" size="sm" onClick={() => openPaymentModal(row)}>
              <HiOutlineBanknotes className="w-4 h-4 text-green-600" />
            </Button>
            )}
            {hasPermission('customers.update') && (
              <Button variant="ghost" size="sm" onClick={() => openEditModal(row)}>
                <HiOutlinePencilSquare className="w-4 h-4 text-blue-600" />
              </Button>
            )}
            {hasPermission('customers.delete') && (
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)}>
                <HiOutlineTrash className="w-4 h-4 text-red-600" />
              </Button>
            )}
          </div>
        )}
      />

      {customers.length === 0 && !loading && (
        <EmptyState
          icon={<HiOutlineUserGroup className="w-16 h-16" />}
          title="No customers yet"
          description="Customer records will appear here once added."
          {...(hasPermission('customers.create') ? { actionLabel: 'Add Customer', onAction: openAddModal } : {})}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Customer name"
              required
            />
            <FormInput
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              placeholder="Phone number"
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleFormChange}
              placeholder="Email address"
            />
            <FormInput
              label="GST Number"
              name="gstNumber"
              value={form.gstNumber}
              onChange={handleFormChange}
              placeholder="GST number"
            />
            <div className="sm:col-span-2">
              <FormInput
                label="Address"
                name="address"
                value={form.address}
                onChange={handleFormChange}
                placeholder="Full address"
              />
            </div>
            <FormInput
              label="Opening Balance"
              name="openingBalance"
              type="number"
              value={form.openingBalance}
              onChange={handleFormChange}
              placeholder="0"
            />
            <FormInput
              label="Credit Limit"
              name="creditLimit"
              type="number"
              value={form.creditLimit}
              onChange={handleFormChange}
              placeholder="0"
            />
            <div className="sm:col-span-2">
              <FormInput
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Any additional notes"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setFormModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              {editingCustomer ? 'Update' : 'Add'} Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="Customer Details"
        size="xl"
      >
        {detailLoading ? (
          <div className="py-12 text-center">
            <LoadingSpinner type="page" />
          </div>
        ) : selectedCustomer ? (
          <div>
            {/* Profile Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {(selectedCustomer.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <HiOutlinePhone className="w-3.5 h-3.5" />
                    {selectedCustomer.phone || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Email</span>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <HiOutlineEnvelope className="w-3.5 h-3.5" />
                    {selectedCustomer.email || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Address</span>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <HiOutlineMapPin className="w-3.5 h-3.5" />
                    {selectedCustomer.address || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">GST</span>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <HiOutlineIdentification className="w-3.5 h-3.5" />
                    {selectedCustomer.gstNumber || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Credit Limit</span>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <HiOutlineCreditCard className="w-3.5 h-3.5" />
                    {formatCurrency(selectedCustomer.creditLimit ?? 0)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Opening Balance</span>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <HiOutlineCurrencyRupee className="w-3.5 h-3.5" />
                    {formatCurrency(selectedCustomer.openingBalance ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-600 font-medium">Total Purchases</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(selectedCustomer.totalPurchases ?? 0)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-green-600 font-medium">Total Paid</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(selectedCustomer.totalPaid ?? 0)}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-xs text-red-600 font-medium">Balance Due</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(selectedCustomer.balanceDue ?? selectedCustomer.balance ?? 0)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 border-b border-gray-200">
                {['purchaseHistory', 'paymentHistory', 'ledger'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'purchaseHistory'
                      ? 'Purchase History'
                      : tab === 'paymentHistory'
                      ? 'Payment History'
                      : 'Ledger'}
                  </button>
                ))}
              </div>
              {hasPermission('customers.update') && (
                <Button
                  size="sm"
                  variant="success"
                  icon={HiOutlineBanknotes}
                  onClick={() => openPaymentModal(selectedCustomer)}
                >
                  Record Payment
                </Button>
              )}
            </div>

            {tabLoading ? (
              <LoadingSpinner type="table" />
            ) : activeTab === 'ledger' ? (
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs font-medium text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-right">Debit</th>
                      <th className="px-3 py-2 text-right">Credit</th>
                      <th className="px-3 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ledgerData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                          No ledger entries
                        </td>
                      </tr>
                    ) : (
                      ledgerData.map((entry, idx) => (
                        <tr key={entry.id ?? idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">{formatDateTime(entry.date)}</td>
                          <td className="px-3 py-2 text-gray-900">{entry.description}</td>
                          <td className="px-3 py-2 text-right text-red-600 font-medium">
                            {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-green-600 font-medium">
                            {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                          </td>
                          <td className={`px-3 py-2 text-right font-medium ${entry.balance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatCurrency(entry.balance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'purchaseHistory' ? (
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs font-medium text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Invoice #</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchaseHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-gray-400">
                          No purchase history
                        </td>
                      </tr>
                    ) : (
                      purchaseHistory.map((p, idx) => (
                        <tr key={p.id ?? idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">{formatDate(p.date)}</td>
                          <td className="px-3 py-2 text-gray-900">{p.invoiceNumber || p.invoiceNo || '—'}</td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(p.total || p.amount)}</td>
                          <td className="px-3 py-2">
                            <Badge variant={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'danger'}>
                              {p.status || 'unpaid'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs font-medium text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Method</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-gray-400">
                          No payment history
                        </td>
                      </tr>
                    ) : (
                      paymentHistory.map((p, idx) => (
                        <tr key={p.id ?? idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">{formatDateTime(p.date || p.createdAt)}</td>
                          <td className="px-3 py-2 text-gray-900 capitalize">{p.method}</td>
                          <td className="px-3 py-2 text-right font-medium text-green-600">{formatCurrency(p.amount)}</td>
                          <td className="px-3 py-2 text-gray-500">{p.notes || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        title="Record Payment"
        size="md"
      >
        <form onSubmit={handlePaymentSubmit}>
          <div className="flex flex-col gap-4">
            {paymentCustomer && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <span className="text-gray-500">Customer: </span>
                <span className="font-medium text-gray-900">{paymentCustomer.name}</span>
                <span className="text-gray-500 ml-3">Balance Due: </span>
                <span className="font-medium text-red-600">{formatCurrency(paymentCustomer.balanceDue ?? paymentCustomer.balance ?? 0)}</span>
              </div>
            )}
            <FormInput
              label="Amount"
              name="amount"
              type="number"
              value={payment.amount}
              onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value }))}
              placeholder="Payment amount"
              required
            />
            <FormSelect
              label="Payment Method"
              name="method"
              value={payment.method}
              onChange={(e) => setPayment((p) => ({ ...p, method: e.target.value }))}
              options={PAYMENT_METHODS}
              placeholder="Select payment method"
              required
            />
            <FormInput
              label="Notes"
              name="notes"
              value={payment.notes}
              onChange={(e) => setPayment((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Optional notes"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setPaymentModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={paymentLoading} variant="success">
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}

export default Customers;