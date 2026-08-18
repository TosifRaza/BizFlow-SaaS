import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import { adminApi } from '../../api/adminApi';

function Revenue() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState({ totalRevenue: 0, monthlyRevenue: [] });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchRevenue = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await adminApi.getRevenue(params);
      const data = res.data?.data || res.data || res;
      setRevenue(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  // Computed stats
  const monthlyData = (revenue.monthlyRevenue || []).map((m) => ({
    month: m._id,
    revenue: m.total,
    transactions: m.count || 0,
  }));

  const totalRevenue = revenue.totalRevenue || 0;
  const mrr = monthlyData.length > 0
    ? monthlyData[monthlyData.length - 1].revenue
    : 0;
  const thisMonthRevenue = monthlyData.length > 0
    ? monthlyData[monthlyData.length - 1].revenue
    : 0;
  const avgPerMonth = monthlyData.length > 0
    ? Math.round(totalRevenue / monthlyData.length)
    : 0;

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: HiOutlineBanknotes,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'MRR (Last Month)',
      value: `$${mrr.toLocaleString()}`,
      icon: HiOutlineArrowTrendingUp,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'This Month Revenue',
      value: `$${thisMonthRevenue.toLocaleString()}`,
      icon: HiOutlineCalendarDays,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Avg Revenue / Month',
      value: `$${avgPerMonth.toLocaleString()}`,
      icon: HiOutlineBuildingOffice2,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const tableColumns = [
    {
      key: 'month',
      label: 'Month',
      render: (val) => <span className="font-semibold text-gray-900">{val}</span>,
    },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (val) => <span className="text-gray-700">${val?.toLocaleString() || 0}</span>,
    },
    {
      key: 'transactions',
      label: 'Transactions',
      render: (val) => <span className="text-gray-600">{val || 0}</span>,
    },
  ];

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      <PageHeader title="Revenue" subtitle="Track platform revenue and financial metrics" />

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="w-full sm:w-44">
            <FormInput
              name="startDate"
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <FormInput
              name="endDate"
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner type="page" />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            {monthlyData.length > 0 ? (
              <div className="w-full" style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                      formatter={(value, name) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Transactions',
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#7c3aed"
                      strokeWidth={2.5}
                      dot={{ fill: '#7c3aed', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16">
                <p className="text-gray-500">No revenue data available for the selected period.</p>
              </div>
            )}
          </div>

          {/* Monthly Revenue Table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h3>
            </div>
            <DataTable
              columns={tableColumns}
              data={monthlyData}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Revenue;
