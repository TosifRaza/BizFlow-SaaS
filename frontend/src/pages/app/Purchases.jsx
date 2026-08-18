import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineBanknotes,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineCurrencyRupee,
  HiOutlineTruck,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';

import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { purchaseApi } from '../../api/purchaseApi';
import { supplierApi } from '../../api/supplierApi';
import { productApi } from '../../api/productApi';
import { formatCurrency, formatDate, formatDateTime, PAYMENT_METHODS } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';


const STATUS_BADGE_MAP = {
  completed: 'success',
  partial: 'warning',
  credit: 'warning',
  pending: 'info',
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'partial', label: 'Partial' },
  { value: 'credit', label: 'Credit' },
];

const emptyItem = { productId: '', productName: '', quantity: 1, price: 0, taxRate: 0 };
const emptyPayment = { amount: '', method: '' };

function Purchases() {
  const { hasPermission } = useAuth();
const canCreate = hasPermission('purchases.create');
  // const { hasPermission } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New purchase form
  const [form, setForm] = useState({ supplierId: '', notes: '' });
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [payment, setPayment] = useState({ ...emptyPayment });
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const searchRef = useRef(null);

  // Record payment form
  const [recordPayment, setRecordPayment] = useState({ amount: '', method: '' });
  const [recording, setRecording] = useState(false);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter || undefined,
        supplier: supplierFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const { data } = await purchaseApi.getAll(params);
      setPurchases(data?.data ?? data?.purchases ?? []);
      setPagination((prev) => ({
        ...prev,
        total: data?.total ?? data?.pagination?.total ?? 0,
      }));
    } catch {
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, supplierFilter, dateFrom, dateTo]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const { data } = await supplierApi.getAll({ limit: 200 });
      const list = data?.data ?? data?.suppliers ?? [];
      setSuppliers(list);
    } catch {
      // silently handle
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Close product dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetNewForm = () => {
    setForm({ supplierId: '', notes: '' });
    setItems([{ ...emptyItem }]);
    setPayment({ ...emptyPayment });
    setProductSearch('');
    setProductResults([]);
    setShowProductDropdown(false);
  };

  const openNewModal = () => {
    resetNewForm();
    setShowNewModal(true);
  };

  const openViewModal = async (purchase) => {
    setSelectedPurchase(purchase);
    setShowViewModal(true);
    try {
      const { data } = await purchaseApi.getById(purchase.id);
      setViewData(data?.data ?? data);
    } catch {
      setViewData(purchase);
    }
  };

  const openPaymentModal = (purchase) => {
    setSelectedPurchase(purchase);
    const balance = purchase.balanceDue ?? purchase.total ?? 0;
    setRecordPayment({ amount: balance > 0 ? String(balance) : '', method: '' });
    setShowPaymentModal(true);
  };

  // Product search
  const searchProducts = async (query) => {
    setProductSearch(query);
    if (query.length < 1) {
      setProductResults([]);
      setShowProductDropdown(false);
      return;
    }
    try {
      const { data } = await productApi.getAll({ search: query, limit: 10 });
      const list = (data?.data ?? data?.products ?? []).map(p => ({
        ...p,
        id: p._id || p.id,
      }));
      setProductResults(list);
      setShowProductDropdown(true);
    } catch {
      setProductResults([]);
    }
  };

  const selectProduct = (itemIdx, product) => {
    const updated = [...items];
    updated[itemIdx] = {
      ...updated[itemIdx],
      productId: product._id || product.id,
      productName: product.name,
      price: product.purchasePrice || product.sellingPrice || 0,
      taxRate: product.gstRate || product.taxRate || 0,
    };
    setItems(updated);
    setShowProductDropdown(false);
    setProductSearch('');
  };

  const updateItem = (itemIdx, field, value) => {
    const updated = [...items];
    updated[itemIdx] = { ...updated[itemIdx], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { ...emptyItem }]);
  };

  const removeItem = (itemIdx) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== itemIdx));
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const taxTotal = items.reduce((sum, item) => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    return sum + itemTotal * (Number(item.taxRate) / 100);
  }, 0);
  const grandTotal = subtotal + taxTotal;

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!form.supplierId) { toast.error('Select a supplier'); return; }
    const validItems = items.filter((i) => i.productId);
    if (validItems.length === 0) { toast.error('Add at least one product'); return; }

    setSubmitting(true);
    try {
      const payload = {
        supplierId: form.supplierId,
        notes: form.notes,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          taxRate: Number(item.taxRate),
        })),
        payment: payment.method ? {
          method: payment.method,
          amount: Number(payment.amount) || 0,
        } : undefined,
      };
      await purchaseApi.create(payload);
      toast.success('Purchase created successfully');
      setShowNewModal(false);
      fetchPurchases();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!recordPayment.amount || Number(recordPayment.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setRecording(true);
    try {
      await purchaseApi.recordPayment(selectedPurchase.id, {
        amount: Number(recordPayment.amount),
        method: recordPayment.method,
      });
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      fetchPurchases();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to record payment');
    } finally {
      setRecording(false);
    }
  };

  const columns = [
    { key: 'poNumber', label: 'Purchase #', render: (val, row) => val || row.invoiceNumber || `PO-${String(row.id || '').padStart(4, '0')}` },
    { key: 'supplier', label: 'Supplier', render: (val) => val?.name || val || '-' },
    { key: 'date', label: 'Date', render: (val) => formatDate(val) },
    { key: 'total', label: 'Total', render: (val) => formatCurrency(val) },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={STATUS_BADGE_MAP[val] || 'gray'}>{val || 'pending'}</Badge> },
  ];

  const actions = (row) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => openViewModal(row)} title="View">
        <HiOutlineEye className="w-4 h-4" />
      </Button>
      {(row.status === 'partial' || row.status === 'credit') && hasPermission('purchases.create') && (
        <Button variant="ghost" size="sm" onClick={() => openPaymentModal(row)} title="Record Payment">
          <HiOutlineBanknotes className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  const tableData = loading ? [] : purchases;
  const supplierOptions = [
    { value: '', label: 'All Suppliers' },
    ...suppliers.map((s) => ({ value: s._id || s.id, label: s.name || s.company })),
  ];

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Manage purchase orders from suppliers"
        actions={hasPermission('purchases.create') ? [
          { label: 'New Purchase', icon: HiOutlinePlus, onClick: openNewModal },
        ] : []}
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <FormInput
            name="dateFrom"
            type="date"
            label="From Date"
            value={dateFrom}
            onChange={handleFilterChange(setDateFrom)}
          />
          <FormInput
            name="dateTo"
            type="date"
            label="To Date"
            value={dateTo}
            onChange={handleFilterChange(setDateTo)}
          />
          <FormSelect
            name="supplierFilter"
            label="Supplier"
            value={supplierFilter}
            onChange={handleFilterChange(setSupplierFilter)}
            options={supplierOptions}
          />
          <FormSelect
            name="statusFilter"
            label="Status"
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            options={STATUS_FILTER_OPTIONS}
          />
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search purchases..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner type="table" />
      ) : purchases.length === 0 ? (
        <EmptyState
          title="No purchases yet"
          description="Purchase orders will appear here once created."
          actionLabel={hasPermission('purchases.create') ? 'Create Purchase' : undefined}
          onAction={hasPermission('purchases.create') ? openNewModal : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          loading={loading}
          actions={actions}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onPageChange: handlePageChange,
          }}
        />
      )}

      {/* New Purchase Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="New Purchase" size="xl">
        <form onSubmit={handleSubmitNew} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              name="supplierId"
              label="Supplier"
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              options={suppliers.map((s) => ({ value: s._id || s.id, label: s.name || s.company || `ID: ${s._id || s.id}` }))}
              required
            />
          </div>

          {/* Add products section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Products</h4>
              <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                <HiOutlinePlus className="w-4 h-4" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    {/* Product search/select */}
                    <div className="col-span-12 sm:col-span-4 relative" ref={idx === items.length - 1 ? searchRef : null}>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Product</label>
                      {item.productId ? (
                        <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm">
                          <span>{item.productName}</span>
                          <button type="button" onClick={() => updateItem(idx, 'productId', '')} className="text-gray-400 hover:text-gray-600">
                            <HiOutlineXMark className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => searchProducts(e.target.value)}
                            onFocus={() => productResults.length > 0 && setShowProductDropdown(true)}
                            placeholder="Search product..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          />
                          {showProductDropdown && productResults.length > 0 && (
                            <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {productResults.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => selectProduct(idx, p)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                >
                                  <span className="font-medium text-gray-900">{p.name}</span>
                                  <span className="block text-xs text-gray-500">₹{p.purchasePrice || p.sellingPrice || 0} · Stock: {p.stock ?? '-'}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Tax %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.taxRate}
                        onChange={(e) => updateItem(idx, 'taxRate', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-1">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Total</label>
                      <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg">
                        {formatCurrency(item.price * item.quantity * (1 + item.taxRate / 100))}
                      </div>
                    </div>

                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length <= 1}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">{formatCurrency(taxTotal)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-900">Grand Total</span>
                <span className="text-gray-900">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                name="paymentMethod"
                label="Payment Method"
                value={payment.method}
                onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                options={[{ value: '', label: 'No Payment' }, ...PAYMENT_METHODS]}
              />
              {payment.method && (
                <FormInput
                  name="paymentAmount"
                  type="number"
                  label="Amount Paid"
                  value={payment.amount}
                  onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                  min="0"
                  max={grandTotal}
                  placeholder="Enter amount"
                />
              )}
            </div>

            {/* Notes */}
            <FormInput
              name="notes"
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes..."
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowNewModal(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Create Purchase</Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Purchase Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Purchase Details" size="lg">
        {viewData && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Purchase #</p>
                <p className="text-sm font-medium text-gray-900">{viewData.poNumber || viewData.invoiceNumber || `PO-${String(viewData.id || '').padStart(4, '0')}`}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Supplier</p>
                <p className="text-sm font-medium text-gray-900">{viewData.supplier?.name || viewData.supplierId || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(viewData.date || viewData.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant={STATUS_BADGE_MAP[viewData.status] || 'gray'}>{viewData.status || 'pending'}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(viewData.total)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount Paid</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(viewData.amountPaid ?? 0)}</p>
              </div>
              {viewData.balanceDue != null && (
                <div>
                  <p className="text-xs text-gray-500">Balance Due</p>
                  <p className="text-sm font-medium text-red-600">{formatCurrency(viewData.balanceDue)}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Items</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Tax</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(viewData.items || []).map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900">{item.product?.name || item.productName || `Product #${item.productId}`}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(item.price)}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{item.taxRate}%</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(item.price * item.quantity * (1 + (item.taxRate || 0) / 100))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {viewData.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Notes</h4>
                <p className="text-sm text-gray-600">{viewData.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment" size="md">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {selectedPurchase && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Purchase Total</span>
                <span className="font-medium">{formatCurrency(selectedPurchase.total)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Balance Due</span>
                <span className="font-medium text-red-600">{formatCurrency(selectedPurchase.balanceDue ?? selectedPurchase.total)}</span>
              </div>
            </div>
          )}

          <FormInput
            name="payAmount"
            type="number"
            label="Amount"
            value={recordPayment.amount}
            onChange={(e) => setRecordPayment({ ...recordPayment, amount: e.target.value })}
            required
            min="0.01"
            step="0.01"
          />

          <FormSelect
            name="payMethod"
            label="Payment Method"
            value={recordPayment.method}
            onChange={(e) => setRecordPayment({ ...recordPayment, method: e.target.value })}
            options={PAYMENT_METHODS}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button type="submit" loading={recording}>Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Purchases;
