import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  HiOutlineBuildingOffice2, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineCreditCard, HiOutlineXCircle, HiOutlineCurrencyRupee,
  HiOutlineBanknotes, HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminApi } from '../../api/adminApi';
import { formatCurrency } from '../../utils/helpers';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({
    businessesOverTime: [],
    subscriptionGrowth: [],
    revenueTrend: [],
    planDistribution: [],
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard();
      const data = res.data?.data || res.data || res;
      setStats(data.stats || null);
      setChartData({
        businessesOverTime: data.businessesOverTime || [],
        subscriptionGrowth: data.subscriptionGrowth || [],
        revenueTrend: data.revenueTrend || [],
        planDistribution: data.planDistribution || [],
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner type="page" />;

  const statCards = [
    {
      title: 'Total Businesses',
      value: stats?.totalBusinesses ?? 0,
      icon: HiOutlineBuildingOffice2,
      color: 'blue',
      trendValue: stats?.totalBusinessesTrend,
      trend: stats?.totalBusinessesTrendDir || 'neutral',
    },
    {
      title: 'Active Businesses',
      value: stats?.activeBusinesses ?? 0,
      icon: HiOutlineCheckCircle,
      color: 'green',
      trendValue: stats?.activeBusinessesTrend,
      trend: stats?.activeBusinessesTrendDir || 'neutral',
    },
    {
      title: 'Trial Businesses',
      value: stats?.trialBusinesses ?? 0,
      icon: HiOutlineClock,
      color: 'yellow',
      trendValue: stats?.trialBusinessesTrend,
      trend: stats?.trialBusinessesTrendDir || 'neutral',
    },
    {
      title: 'Paid Businesses',
      value: stats?.paidBusinesses ?? 0,
      icon: HiOutlineCreditCard,
      color: 'purple',
      trendValue: stats?.paidBusinessesTrend,
      trend: stats?.paidBusinessesTrendDir || 'neutral',
    },
    {
      title: 'Expired Businesses',
      value: stats?.expiredBusinesses ?? 0,
      icon: HiOutlineXCircle,
      color: 'red',
      trendValue: stats?.expiredBusinessesTrend,
      trend: stats?.expiredBusinessesTrendDir || 'neutral',
    },
    {
      title: 'Monthly Recurring Revenue',
      value: formatCurrency(stats?.monthlyRecurringRevenue ?? 0),
      icon: HiOutlineCurrencyRupee,
      color: 'green',
      trendValue: stats?.mrrTrend,
      trend: stats?.mrrTrendDir || 'neutral',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: HiOutlineBanknotes,
      color: 'purple',
      trendValue: stats?.totalRevenueTrend,
      trend: stats?.totalRevenueTrendDir || 'neutral',
    },
    {
      title: 'New This Month',
      value: stats?.newThisMonth ?? 0,
      icon: HiOutlineArrowTrendingUp,
      color: 'blue',
      trendValue: stats?.newThisMonthTrend,
      trend: stats?.newThisMonthTrendDir || 'neutral',
    },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="System-wide overview and metrics" />

      {/* Stats Row - 4x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            trend={card.trend}
            trendValue={card.trendValue}
          />
        ))}
      </div>

      {/* Charts Row - 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Businesses Over Time - AreaChart */}
        <ChartCard title="New Businesses Over Time" subtitle="Last 12 months">
          <div className="h-72">
            {chartData.businessesOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.businessesOverTime}>
                  <defs>
                    <linearGradient id="bizGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#bizGradient)"
                    name="Businesses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No data available
              </div>
            )}
          </div>
        </ChartCard>

        {/* Subscription Growth - BarChart */}
        <ChartCard title="Subscription Growth" subtitle="By plan">
          <div className="h-72">
            {chartData.subscriptionGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.subscriptionGrowth}>
                  <XAxis
                    dataKey="plan"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="count" name="Subscriptions" radius={[4, 4, 0, 0]}>
                    {chartData.subscriptionGrowth.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No data available
              </div>
            )}
          </div>
        </ChartCard>

        {/* Revenue Trend - LineChart */}
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue over time">
          <div className="h-72">
            {chartData.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.revenueTrend}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                    }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No data available
              </div>
            )}
          </div>
        </ChartCard>

        {/* Plan Distribution - PieChart */}
        <ChartCard title="Plan Distribution" subtitle="Businesses by plan type">
          <div className="h-72">
            {chartData.planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="plan"
                    label={({ plan, percent }) =>
                      `${plan} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={{ stroke: '#9ca3af' }}
                  >
                    {chartData.planDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No data available
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default AdminDashboard;
