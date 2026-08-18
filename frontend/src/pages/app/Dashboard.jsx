import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineCurrencyRupee,
  HiOutlineUserGroup,
  HiOutlineArchiveBox,
  HiOutlineArrowUpRight,
  HiOutlineArrowDownRight,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { dashboardApi } from '../../api/dashboardApi';
import { formatCurrency, formatDate } from '../../utils/helpers';

const DATE_RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: 'Last 7 Days' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
];

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const PAYMENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function Dashboard() {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [salesChartData, setSalesChartData] = useState([]);
  const [revenueExpensesData, setRevenueExpensesData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes] = await Promise.all([
        dashboardApi.getStats({ period: dateRange }),
        dashboardApi.getChartData({ period: dateRange }),
      ]);

      const statsData = statsRes.data?.data || {};
      setStats(statsData);
      setRecentSales(statsData.recentSales || []);
      setLowStockAlerts(statsData.lowStockProducts || []);

      const chartData = chartRes.data?.data || {};
      setSalesChartData(chartData.salesOverTime || []);
      setRevenueExpensesData(chartData.revenueVsExpenses || []);
      setTopProductsData(chartData.topProducts || []);
      setCategoryData(chartData.salesByCategory || []);
      setPaymentData(chartData.paymentMethods || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const buildStatCards = () => {
    if (!stats) return [];

    return [
      {
        title: "Today's Sales",
        value: formatCurrency(stats.todaySales ?? 0),
        icon: HiOutlineShoppingCart,
        color: 'blue',
        trend: (stats.revenueGrowth ?? 0) >= 0 ? 'up' : 'down',
        trendValue: stats.revenueGrowth != null
          ? `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%`
          : undefined,
      },
      {
        title: "Today's Orders",
        value: String(stats.todayOrders ?? 0),
        icon: HiOutlineShoppingCart,
        color: 'green',
      },
      {
        title: 'Total Products',
        value: String(stats.totalProducts ?? 0),
        icon: HiOutlineCube,
        color: 'purple',
      },
      {
        title: 'Total Stock Value',
        value: formatCurrency(stats.totalStockValue ?? 0),
        icon: HiOutlineArchiveBox,
        color: 'orange',
      },
      {
        title: 'Total Customers',
        value: String(stats.totalCustomers ?? 0),
        icon: HiOutlineUserGroup,
        color: 'blue',
      },
      {
        title: 'Monthly Revenue',
        value: formatCurrency(stats.monthlyRevenue ?? 0),
        icon: HiOutlineCurrencyRupee,
        color: 'green',
        trend: (stats.revenueGrowth ?? 0) >= 0 ? 'up' : 'down',
        trendValue: stats.revenueGrowth != null
          ? `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%`
          : undefined,
      },
    ];
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Overview of your business performance" />
        <LoadingSpinner type="card" />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSpinner type="card" />
          <LoadingSpinner type="card" />
        </div>
      </div>
    );
  }

  const statCards = buildStatCards();

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your business performance" />

      {/* Date Range Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DATE_RANGES.map((range) => (
          <button
            key={range.key}
            onClick={() => setDateRange(range.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              dateRange === range.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      {statCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {statCards.map((card, idx) => (
            <StatCard
              key={idx}
              title={card.title}
              value={card.value}
              icon={card.icon}
              trend={card.trend}
              trendValue={card.trendValue}
              color={card.color}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No stats available"
          description="Stats will appear once you start adding sales and products."
        />
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Sales Over Time" subtitle={`Period: ${DATE_RANGES.find((r) => r.key === dateRange)?.label || dateRange}`}>
          {salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No sales data available
            </div>
          )}
        </ChartCard>

        <ChartCard title="Revenue vs Expenses" subtitle="Comparison chart">
          {revenueExpensesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueExpensesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No revenue/expense data available
            </div>
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Selling Products */}
        <ChartCard title="Top Selling Products" subtitle="By revenue">
          {topProductsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topProductsData.slice(0, 5)}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar
                  dataKey="quantity"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  name="Quantity"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No product data available
            </div>
          )}
        </ChartCard>

        {/* Sales by Category */}
        <ChartCard title="Sales by Category" subtitle="Distribution">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="sales"
                  nameKey="category"
                  label={({ name, percent }) =>
                    `${name || ''} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                >
                  {categoryData.slice(0, 5).map((_, index) => (
                    <Cell
                      key={`cat-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No category data available
            </div>
          )}
        </ChartCard>

        {/* Payment Methods */}
        <ChartCard title="Payment Methods" subtitle="Distribution">
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name || ''} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                >
                  {paymentData.map((_, index) => (
                    <Cell
                      key={`pay-${index}`}
                      fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No payment data available
            </div>
          )}
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Recent Sales</h3>
            <p className="text-sm text-gray-500 mt-0.5">Latest transactions</p>
          </div>
          {recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentSales.slice(0, 10).map((sale, idx) => (
                    <tr key={sale.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{sale.invoiceNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{sale.customerName || 'Walk-in'}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(sale.date)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(sale.total)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            sale.status === 'completed' ? 'success'
                            : sale.status === 'credit' ? 'info'
                            : sale.status === 'partial' ? 'warning'
                            : 'gray'
                          }
                        >
                          {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              No recent sales
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Low Stock Alerts</h3>
            <p className="text-sm text-gray-500 mt-0.5">Products below minimum stock</p>
          </div>
          {lowStockAlerts.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {lowStockAlerts.map((item, idx) => (
                  <li key={item._id || idx} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-red-50 shrink-0">
                        <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.sku || ''}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="danger">{item.currentStock} left</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm">
              <HiOutlineCube className="w-10 h-10 mb-2 text-gray-300" />
              <p>All stock levels are healthy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
