import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineCube,
  HiOutlineCurrencyRupee,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineFunnel,
  HiOutlineCalendarDays,
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
import { inventoryApi } from '../../api/inventoryApi';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const STOCK_TYPE_OPTIONS = [
  { value: 'add', label: 'Add Stock' },
  { value: 'remove', label: 'Remove Stock' },
  { value: 'set', label: 'Set Stock' },
];

const MOVEMENT_TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'sale', label: 'Sale' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'return', label: 'Return' },
];

const TABS = [
  { key: 'overview', label: 'Stock Overview' },
  { key: 'movements', label: 'Stock Movements' },
  { key: 'lowStock', label: 'Low Stock' },
];

function getStockStatus(current, minimum) {
  if (current <= 0) return { label: 'Out of Stock', variant: 'danger' };
  if (current < minimum) return { label: 'Low Stock', variant: 'warning' };
  return { label: 'Good', variant: 'success' };
}

function Inventory() {
  const { hasPermission } = useAuth();
const canAdjust = hasPermission('inventory.adjust');
const canTransfer = hasPermission('inventory.transfer');
  // const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Stock Overview
  const [stockData, setStockData] = useState([]);
  const [stockSearch, setStockSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // Stock Movements
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementSearch, setMovementSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Low Stock
  const [lowStock, setLowStock] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalStockValue: 0,
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  // Stock Adjustment Modal
  const [adjustModal, setAdjustModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    type: 'add',
    quantity: '',
    reason: '',
  });
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Fetch categories for filter
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await categoryApi.getAll();
      const list = data.data || data.categories || data || [];
      setCategories(list.map((c) => ({ value: String(c.id), label: c.name })));
    } catch {
      // non-critical
    }
  }, []);

  // Fetch products for adjustment modal
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await productApi.getAll();
      const list = data.data || data.products || data || [];
      setProducts(list.map((p) => ({ value: String(p.id), label: p.name })));
    } catch {
      toast.error('Failed to load products');
    }
  }, []);

  // Fetch stock overview
  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search: stockSearch };
      if (categoryFilter) params.categoryId = categoryFilter;
      const { data } = await inventoryApi.getStock(params);
      setStockData(data.data || data.stock || data || []);
    } catch {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  }, [stockSearch, categoryFilter]);

  // Fetch movements
  const fetchMovements = useCallback(async () => {
    setMovementsLoading(true);
    try {
      const params = {};
      if (movementSearch) params.search = movementSearch;
      if (movementTypeFilter) params.type = movementTypeFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await inventoryApi.getMovements(params);
      setMovements(data.data || data.movements || data || []);
    } catch {
      toast.error('Failed to load movements');
    } finally {
      setMovementsLoading(false);
    }
  }, [movementSearch, movementTypeFilter, dateFrom, dateTo]);

  // Fetch low stock
  const fetchLowStock = useCallback(async () => {
    setLowStockLoading(true);
    try {
      const { data } = await inventoryApi.getLowStock();
      setLowStock(data.data || data || []);
    } catch {
      toast.error('Failed to load low stock items');
    } finally {
      setLowStockLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await inventoryApi.getStockValue();
      setStats((prev) => ({
        ...prev,
        totalStockValue: data.totalStockValue ?? data.totalValue ?? 0,
        totalProducts: data.totalProducts ?? 0,
        lowStockCount: data.lowStockCount ?? 0,
        outOfStockCount: data.outOfStockCount ?? 0,
      }));
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'overview') fetchStock();
    else if (activeTab === 'movements') fetchMovements();
    else if (activeTab === 'lowStock') fetchLowStock();
  }, [activeTab, fetchStock, fetchMovements, fetchLowStock]);

  // Calculate stats from stock data as fallback
  useEffect(() => {
    if (stockData.length > 0) {
      const totalValue = stockData.reduce((sum, s) => sum + (s.stockValue || (s.currentStock * s.price) || 0), 0);
      const lowCount = stockData.filter((s) => s.currentStock > 0 && s.currentStock < s.minimumStock).length;
      const outCount = stockData.filter((s) => s.currentStock <= 0).length;
      setStats((prev) => ({
        totalStockValue: prev.totalStockValue || totalValue,
        totalProducts: prev.totalProducts || stockData.length,
        lowStockCount: prev.lowStockCount || lowCount,
        outOfStockCount: prev.outOfStockCount || outCount,
      }));
    }
  }, [stockData]);

  const openAdjustModal = () => {
    setAdjustForm({ productId: '', type: 'add', quantity: '', reason: '' });
    setAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustForm.productId || !adjustForm.quantity || Number(adjustForm.quantity) <= 0) {
      toast.error('Select a product and enter a valid quantity');
      return;
    }
    setAdjustLoading(true);
    try {
      await inventoryApi.adjustStock({
        productId:adjustForm.productId,
        type: adjustForm.type,
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason,
      });
      toast.success('Stock adjusted successfully');
      setAdjustModal(false);
      if (activeTab === 'overview') fetchStock();
      else if (activeTab === 'movements') fetchMovements();
      else if (activeTab === 'lowStock') fetchLowStock();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjustLoading(false);
    }
  };

  // Stock overview columns
  const stockColumns = [
    { key: 'productName', label: 'Product Name', sortable: true, render: (val, row) => row.name || row.productName || val || '—' },
    // { key: 'category', label: 'Category', render: (val, row) => row.categoryName || row.category || val || '—' },
    { key: 'category', label: 'Category', render: (val, row) => row.categoryName || row.category?.name || row.categoryId?.name || val || '—' },
    { key: 'currentStock', label: 'Current Stock', sortable: true },
    { key: 'minimumStock', label: 'Min Stock', render: (val) => val ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => {
        const s = getStockStatus(row.currentStock, row.minimumStock);
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: 'stockValue',
      label: 'Stock Value',
      sortable: true,
      render: (val, row) => formatCurrency(val ?? (row.currentStock * (row.price || row.costPrice || 0))),
    },
  ];

  // Movement columns
  const movementColumns = [
    { key: 'productName', label: 'Product', render: (val, row) => row.name || row.productName || val || '—' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => {
        const variantMap = { purchase: 'success', sale: 'danger', adjustment: 'info', return: 'warning' };
        return <Badge variant={variantMap[val] || 'gray'}>{val || '—'}</Badge>;
      },
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (val, row) => {
        const isPositive = row.type === 'purchase' || row.type === 'return' || row.type === 'add';
        return (
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : '-'}{Math.abs(val)}
          </span>
        );
      },
    },
    { key: 'previousStock', label: 'Prev Stock' },
    { key: 'newStock', label: 'New Stock' },
    { key: 'reference', label: 'Reference', render: (val) => val || '—' },
    {
      key: 'date',
      label: 'Date',
      render: (val) => formatDateTime(val),
    },
    { key: 'doneBy', label: 'Done By', render: (val, row) => row.userName || row.doneBy || val || '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Track stock levels and manage inventory"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Stock Value"
          value={formatCurrency(stats.totalStockValue)}
          icon={HiOutlineCurrencyRupee}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={HiOutlineCube}
          color="green"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={HiOutlineExclamationTriangle}
          color="yellow"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          icon={HiOutlineXCircle}
          color="red"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {hasPermission('inventory.adjust') && (
        <Button
          variant="primary"
          size="sm"
          icon={HiOutlineAdjustmentsHorizontal}
          onClick={openAdjustModal}
        >
          Adjust Stock
        </Button>
        )}
      </div>

      {/* Stock Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Category filter */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <DataTable
            columns={stockColumns}
            data={stockData}
            loading={loading}
            onSearch={(val) => setStockSearch(val)}
            searchPlaceholder="Search products..."
            emptyMessage="No stock data found."
          />

          {stockData.length === 0 && !loading && (
            <EmptyState
              icon={<HiOutlineCube className="w-16 h-16" />}
              title="No inventory records"
              description="Inventory data will appear here once you add products."
            />
          )}
        </>
      )}

      {/* Stock Movements Tab */}
      {activeTab === 'movements' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="w-48">
              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {MOVEMENT_TYPE_FILTERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <FormInput
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From"
              className="w-40"
            />
            <FormInput
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To"
              className="w-40"
            />
          </div>

          <DataTable
            columns={movementColumns}
            data={movements}
            loading={movementsLoading}
            onSearch={(val) => setMovementSearch(val)}
            searchPlaceholder="Search by product..."
            emptyMessage="No stock movements found."
          />

          {movements.length === 0 && !movementsLoading && (
            <EmptyState
              icon={<HiOutlineFunnel className="w-16 h-16" />}
              title="No movements recorded"
              description="Stock movements will appear here when inventory changes."
            />
          )}
        </>
      )}

      {/* Low Stock Tab */}
      {activeTab === 'lowStock' && (
        <>
          {lowStockLoading ? (
            <LoadingSpinner type="table" />
          ) : lowStock.length === 0 ? (
            <EmptyState
              icon={<HiOutlineExclamationTriangle className="w-16 h-16" />}
              title="All stock levels are healthy"
              description="No products are currently below their minimum stock level."
            />
          ) : (
            <div className="space-y-3">
              {lowStock.map((item) => {
                const isOut = (item.currentStock ?? 0) <= 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      isOut
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isOut ? 'bg-red-100' : 'bg-yellow-100'
                        }`}
                      >
                        <HiOutlineCube
                          className={`w-5 h-5 ${isOut ? 'text-red-600' : 'text-yellow-600'}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.name || item.productName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {/* {item.categoryName || item.category || 'Uncategorized'} */}
                          {item.categoryName || item.category?.name || item.categoryId?.name || item.category || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Current Stock</p>
                        <p className={`font-bold ${isOut ? 'text-red-600' : 'text-yellow-600'}`}>
                          {item.currentStock ?? 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Minimum Stock</p>
                        <p className="font-bold text-gray-700">{item.minimumStock ?? 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">To Reorder</p>
                        <p className="font-bold text-orange-600">
                          {Math.max(0, (item.minimumStock ?? 0) - (item.currentStock ?? 0))}
                        </p>
                      </div>
                      <Badge variant={isOut ? 'danger' : 'warning'}>
                        {isOut ? 'Out of Stock' : 'Low Stock'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={adjustModal}
        onClose={() => setAdjustModal(false)}
        title="Stock Adjustment"
        size="md"
      >
        <form onSubmit={handleAdjustSubmit}>
          <div className="flex flex-col gap-4">
            <FormSelect
              label="Product"
              name="productId"
              value={adjustForm.productId}
              onChange={(e) => setAdjustForm((f) => ({ ...f, productId: e.target.value }))}
              options={products}
              placeholder="Select a product"
              required
            />
            <FormSelect
              label="Type"
              name="type"
              value={adjustForm.type}
              onChange={(e) => setAdjustForm((f) => ({ ...f, type: e.target.value }))}
              options={STOCK_TYPE_OPTIONS}
              placeholder="Select adjustment type"
              required
            />
            <FormInput
              label="Quantity"
              name="quantity"
              type="number"
              value={adjustForm.quantity}
              onChange={(e) => setAdjustForm((f) => ({ ...f, quantity: e.target.value }))}
              placeholder="Enter quantity"
              required
            />
            <FormInput
              label="Reason / Notes"
              name="reason"
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Reason for adjustment"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setAdjustModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={adjustLoading}>
              Adjust Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Inventory;
