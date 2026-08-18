import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  HiOutlineDocumentText,
  HiOutlineArrowDownTray,
} from 'react-icons/hi2';

import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { reportApi } from '../../api/reportApi';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TABS = [
  { key: 'sales', label: 'Sales' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'customers', label: 'Customers' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'profitLoss', label: 'Profit & Loss' },
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const getDefaultDateRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
};

function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setReportData(null);
    try {
      const params = { dateFrom: dateRange.from, dateTo: dateRange.to };
      let response;
      switch (activeTab) {
        case 'sales':
          response = await reportApi.sales(params);
          break;
        case 'inventory':
          response = await reportApi.inventory(params);
          break;
        case 'customers':
          response = await reportApi.customer(params);
          break;
        case 'suppliers':
          response = await reportApi.supplier(params);
          break;
        case 'expenses':
          response = await reportApi.expense(params);
          break;
        case 'profitLoss':
          response = await reportApi.profitLoss(params);
          break;
        default:
          response = await reportApi.sales(params);
      }
      setReportData(response?.data?.data ?? response?.data ?? {});
    } catch {
      toast.error(`Failed to load ${activeTab} report`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportCSV = () => {
    try {
      if (!reportData) return;
      let rows = [];
      if (activeTab === 'sales') {
        rows = reportData.salesByProduct || reportData.dailySummary || [];
      } else if (activeTab === 'customers') {
        rows = reportData.topCustomers || [];
      } else if (activeTab === 'suppliers') {
        rows = reportData.topSuppliers || [];
      } else if (activeTab === 'expenses') {
        rows = reportData.expensesByCategory || [];
      } else if (activeTab === 'profitLoss') {
        rows = reportData.monthlyTrend || [];
      } else {
        rows = reportData.lowStockProducts || [];
      }

      if (rows.length === 0) {
        toast.error('No data to export');
        return;
      }

      const headers = Object.keys(rows[0]).join(',');
      const body = rows.map((row) =>
        Object.values(row).map((v) => `"${v ?? ''}"`).join(',')
      ).join('\n');

      const csvContent = headers + '\n' + body;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${activeTab}-report.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Report exported successfully');
    } catch {
      toast.error('Failed to export report');
    }
  };

  const renderSalesTab = () => {
    const d = reportData || {};
    return (
      <div className="space-y-6">
        {d.salesTrend && d.salesTrend.length > 0 && (
          <ChartCard title="Sales Trend" subtitle="Revenue over the selected period">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={d.salesTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {d.salesByProduct && d.salesByProduct.length > 0 && (
          <ChartCard title="Sales by Product">
            <DataTable
              columns={[
                { key: 'name', label: 'Product', render: (val) => val || '-' },
                { key: 'quantity', label: 'Quantity', render: (val) => val ?? 0 },
                { key: 'revenue', label: 'Revenue', render: (val) => formatCurrency(val) },
              ]}
              data={d.salesByProduct}
            />
          </ChartCard>
        )}

        {d.dailySummary && d.dailySummary.length > 0 && (
          <ChartCard title="Daily Summary">
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: (val) => formatDate(val) },
                { key: 'orders', label: 'Orders', render: (val) => val ?? 0 },
                { key: 'revenue', label: 'Revenue', render: (val) => formatCurrency(val) },
                { key: 'profit', label: 'Profit', render: (val) => formatCurrency(val) },
              ]}
              data={d.dailySummary}
            />
          </ChartCard>
        )}
      </div>
    );
  };

  const renderInventoryTab = () => {
    const d = reportData || {};
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard title="Stock Valuation" value={formatCurrency(d.stockValuation ?? d.totalStockValue ?? 0)} color="blue" />
          <StatCard title="Low Stock Items" value={d.lowStockCount ?? d.lowStockItems ?? 0} color="orange" />
        </div>

        {d.stockByCategory && d.stockByCategory.length > 0 && (
          <ChartCard title="Stock by Category">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={d.stockByCategory}>
                <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {d.lowStockProducts && d.lowStockProducts.length > 0 && (
          <ChartCard title="Low Stock Products">
            <DataTable
              columns={[
                { key: 'name', label: 'Product' },
                { key: 'stock', label: 'Current Stock' },
                { key: 'minimumStock', label: 'Min Stock' },
              ]}
              data={d.lowStockProducts}
            />
          </ChartCard>
        )}
      </div>
    );
  };

  const renderCustomersTab = () => {
    const d = reportData || {};
    return (
      <div className="space-y-6">
        {d.topCustomers && d.topCustomers.length > 0 && (
          <ChartCard title="Top Customers">
            <DataTable
              columns={[
                { key: 'name', label: 'Customer', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
                { key: 'totalOrders', label: 'Orders', render: (val) => val ?? 0 },
                { key: 'totalSpent', label: 'Total Spent', render: (val) => formatCurrency(val) },
                { key: 'balanceDue', label: 'Balance Due', render: (val) => formatCurrency(val) },
              ]}
              data={d.topCustomers}
            />
          </ChartCard>
        )}

        {d.customerDues && d.customerDues.length > 0 && (
          <ChartCard title="Customer Dues">
            <DataTable
              columns={[
                { key: 'name', label: 'Customer' },
                { key: 'balanceDue', label: 'Outstanding', render: (val) => formatCurrency(val) },
                { key: 'lastPurchase', label: 'Last Purchase', render: (val) => formatDate(val) },
              ]}
              data={d.customerDues}
            />
          </ChartCard>
        )}
      </div>
    );
  };

  const renderSuppliersTab = () => {
    const d = reportData || {};
    return (
      <div className="space-y-6">
        {d.topSuppliers && d.topSuppliers.length > 0 && (
          <ChartCard title="Top Suppliers">
            <DataTable
              columns={[
                { key: 'name', label: 'Supplier', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
                { key: 'totalPurchases', label: 'Purchases', render: (val) => val ?? 0 },
                { key: 'totalSpent', label: 'Total Spent', render: (val) => formatCurrency(val) },
              ]}
              data={d.topSuppliers}
            />
          </ChartCard>
        )}

        {d.supplierDues && d.supplierDues.length > 0 && (
          <ChartCard title="Supplier Dues">
            <DataTable
              columns={[
                { key: 'name', label: 'Supplier' },
                { key: 'balanceDue', label: 'Outstanding', render: (val) => formatCurrency(val) },
                { key: 'lastPurchase', label: 'Last Purchase', render: (val) => formatDate(val) },
              ]}
              data={d.supplierDues}
            />
          </ChartCard>
        )}
      </div>
    );
  };

  const renderExpensesTab = () => {
    const d = reportData || {};
    return (
      <div className="space-y-6">
        {d.expensesByCategory && d.expensesByCategory.length > 0 && (
          <ChartCard title="Expenses by Category">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={d.expensesByCategory}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {d.expensesByCategory.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex flex-col justify-center">
                {d.expensesByCategory.map((item, idx) => (
                  <div key={item.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-gray-700">{item.category}</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        )}

        {d.monthlyTrend && d.monthlyTrend.length > 0 && (
          <ChartCard title="Monthly Expense Trend">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={d.monthlyTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    );
  };

  const renderProfitLossTab = () => {
    const d = reportData || {};
    const revenue = d.revenue ?? d.totalRevenue ?? 0;
    const cogs = d.cogs ?? d.totalCOGS ?? 0;
    const grossProfit = d.grossProfit ?? revenue - cogs;
    const operatingExpenses = d.operatingExpenses ?? d.totalExpenses ?? 0;
    const netProfit = d.netProfit ?? grossProfit - operatingExpenses;

    return (
      <div className="space-y-6">
        {/* P&L Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Revenue" value={formatCurrency(revenue)} color="blue" />
          <StatCard title="COGS" value={formatCurrency(cogs)} color="orange" />
          <StatCard
            title="Gross Profit"
            value={formatCurrency(grossProfit)}
            color={grossProfit >= 0 ? 'green' : 'red'}
            trendValue={revenue > 0 ? `${((grossProfit / revenue) * 100).toFixed(1)}% margin` : undefined}
            trend={grossProfit >= 0 ? 'up' : 'down'}
          />
          <StatCard title="Operating Expenses" value={formatCurrency(operatingExpenses)} color="red" />
          <StatCard
            title="Net Profit"
            value={formatCurrency(netProfit)}
            color={netProfit >= 0 ? 'green' : 'red'}
            trendValue={revenue > 0 ? `${((netProfit / revenue) * 100).toFixed(1)}% margin` : undefined}
            trend={netProfit >= 0 ? 'up' : 'down'}
          />
        </div>

        {/* Trend Chart */}
        {d.monthlyTrend && d.monthlyTrend.length > 0 && (
          <ChartCard title="Profit & Loss Trend" subtitle="Revenue vs COGS vs Expenses vs Profit">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={d.monthlyTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="cogs" stroke="#f59e0b" fill="#f59e0b20" strokeWidth={2} name="COGS" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#ef444420" strokeWidth={2} name="Expenses" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b98120" strokeWidth={2} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Breakdown table */}
        {d.breakdown && d.breakdown.length > 0 && (
          <ChartCard title="Detailed Breakdown">
            <DataTable
              columns={[
                { key: 'category', label: 'Category' },
                { key: 'amount', label: 'Amount', render: (val) => formatCurrency(val) },
                { key: 'percentage', label: '% of Revenue', render: (val) => `${(val ?? 0).toFixed(1)}%` },
              ]}
              data={d.breakdown}
            />
          </ChartCard>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sales': return renderSalesTab();
      case 'inventory': return renderInventoryTab();
      case 'customers': return renderCustomersTab();
      case 'suppliers': return renderSuppliersTab();
      case 'expenses': return renderExpensesTab();
      case 'profitLoss': return renderProfitLossTab();
      default: return renderSalesTab();
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate and view business reports"
        actions={[
          {
            label: 'Export CSV',
            icon: HiOutlineArrowDownTray,
            onClick: exportCSV,
            variant: 'secondary',
          },
        ]}
      />

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">From</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">To</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <Button variant="secondary" onClick={fetchReport}>
            <HiOutlineDocumentText className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex overflow-x-auto px-2 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <LoadingSpinner type="card" />
      ) : (
        renderTabContent()
      )}
    </div>
  );
}

export default Reports;
