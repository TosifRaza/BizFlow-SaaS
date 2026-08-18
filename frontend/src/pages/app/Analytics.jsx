import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  HiOutlineChartBar,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineBanknotes,
  HiOutlineShoppingCart,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';

import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { dashboardApi } from '../../api/dashboardApi';
import { formatCurrency } from '../../utils/helpers';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const getDefaultDateRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
};

function Analytics() {
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { data: resp } = await dashboardApi.getChartData({
        type: 'analytics',
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      });
      setData(resp?.data ?? resp ?? {});
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const d = data || {};

  const bestProduct = d.bestSellingProduct || { name: '-', quantity: 0 };
  const worstProduct = d.worstSellingProduct || { name: '-', quantity: 0 };
  const topCustomer = d.highestValueCustomer || { name: '-', amount: 0 };
  const avgOrderValue = d.averageOrderValue ?? 0;
  const stockTurnover = d.stockTurnoverRatio ?? 0;
  const salesGrowth = d.salesGrowth ?? 0;

  const stats = [
    {
      title: 'Best Selling Product',
      value: bestProduct.name,
      subtitle: `${bestProduct.quantity} units sold`,
      icon: HiOutlineCube,
      color: 'green',
    },
    {
      title: 'Worst Selling Product',
      value: worstProduct.name,
      subtitle: `${worstProduct.quantity} units sold`,
      icon: HiOutlineShoppingCart,
      color: 'red',
    },
    {
      title: 'Highest Value Customer',
      value: topCustomer.name,
      subtitle: formatCurrency(topCustomer.amount),
      icon: HiOutlineUserGroup,
      color: 'purple',
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(avgOrderValue),
      icon: HiOutlineBanknotes,
      color: 'blue',
    },
    {
      title: 'Stock Turnover Ratio',
      value: stockTurnover.toFixed(2) + 'x',
      icon: HiOutlineChartBar,
      color: 'orange',
    },
    {
      title: 'Sales Growth',
      value: `${salesGrowth >= 0 ? '+' : ''}${salesGrowth.toFixed(1)}%`,
      subtitle: salesGrowth >= 0 ? 'compared to last period' : 'compared to last period',
      icon: salesGrowth >= 0 ? HiOutlineArrowTrendingUp : HiOutlineArrowTrendingDown,
      color: salesGrowth >= 0 ? 'green' : 'red',
      trend: salesGrowth >= 0 ? 'up' : 'down',
      trendValue: salesGrowth >= 0 ? 'Growing' : 'Declining',
    },
  ];

  if (loading) return <LoadingSpinner type="card" />;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into your business metrics"
      />

      {/* Date Range */}
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
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <HiOutlineCalendarDays className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid 2x3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-medium text-gray-500">{stat.title}</span>
                <span className="text-xl font-bold text-gray-900 truncate">{stat.value}</span>
                {stat.subtitle && (
                  <span className="text-xs text-gray-500">{stat.subtitle}</span>
                )}
                {stat.trend && stat.trendValue && (
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' ? (
                      <HiOutlineArrowUp className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <HiOutlineArrowDown className="w-3.5 h-3.5 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trendValue}
                    </span>
                  </div>
                )}
              </div>
              <div className={`shrink-0 p-3 rounded-xl ${
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'red' ? 'bg-red-100 text-red-600' :
                stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        {d.revenueTrend && d.revenueTrend.length > 0 && (
          <ChartCard title="Revenue Trend" subtitle="Revenue over months">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={d.revenueTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Expense Trend */}
        {d.expenseTrend && d.expenseTrend.length > 0 && (
          <ChartCard title="Expense Trend" subtitle="Expenses over months">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={d.expenseTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Profit Trend */}
        {d.profitTrend && d.profitTrend.length > 0 && (
          <ChartCard title="Profit Trend" subtitle="Net profit over months">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={d.profitTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Top 5 Products by Revenue */}
        {d.topProducts && d.topProducts.length > 0 && (
          <ChartCard title="Top 5 Products by Revenue" subtitle="Best performing products">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={d.topProducts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" width={120} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Sales by Payment Method */}
        {d.salesByPaymentMethod && d.salesByPaymentMethod.length > 0 && (
          <ChartCard title="Sales by Payment Method" subtitle="Distribution of payment methods">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={d.salesByPaymentMethod}
                  dataKey="amount"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                >
                  {d.salesByPaymentMethod.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

export default Analytics;
