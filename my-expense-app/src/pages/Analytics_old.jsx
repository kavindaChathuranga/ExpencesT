import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CATEGORIES, formatCurrency, getMonthDateRange } from '../utils/helpers';

const Analytics = ({ userId, expenses, loadingExpenses }) => {
  const [dateRange, setDateRange] = useState('month');
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  useEffect(() => {
    filterExpensesByDateRange();
  }, [expenses, dateRange]);

  const filterExpensesByDateRange = () => {
    let startDate, endDate;

    if (dateRange === 'month') {
      ({ startDate, endDate } = getMonthDateRange());
    } else {
      ({ startDate, endDate } = getMonthDateRange(-1));
    }

    const filtered = expenses.filter(expense => {
      const expenseDate = expense.timestamp?.toDate ? expense.timestamp.toDate() : new Date(expense.timestamp);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    setFilteredExpenses(filtered);
  };

  // Prepare daily chart data
  const getDailyChartData = () => {
    const dailyData = {};
    
    filteredExpenses.forEach(expense => {
      const date = expense.timestamp?.toDate ? expense.timestamp.toDate() : new Date(expense.timestamp);
      const day = date.getDate();
      
      if (!dailyData[day]) {
        dailyData[day] = 0;
      }
      dailyData[day] += expense.amount;
    });

    return Object.keys(dailyData)
      .map(day => ({
        day: `Day ${day}`,
        amount: dailyData[day]
      }))
      .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));
  };

  // Prepare category chart data
  const getCategoryChartData = () => {
    const categoryData = {};
    
    filteredExpenses.forEach(expense => {
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = 0;
      }
      categoryData[expense.category] += expense.amount;
    });

    return CATEGORIES.map(cat => ({
      name: cat.name,
      value: categoryData[cat.id] || 0,
      color: cat.color.replace('bg-', '').replace('-500', '')
    })).filter(item => item.value > 0);
  };

  const dailyChartData = getDailyChartData();
  const categoryChartData = getCategoryChartData();
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const COLORS = {
    orange: '#f97316',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#a855f7',
    pink: '#ec4899',
    yellow: '#eab308',
    gray: '#6b7280'
  };

  if (loadingExpenses) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="py-2 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Visualize your spending patterns
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange('month')}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-colors ${
              dateRange === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('lastMonth')}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-colors ${
              dateRange === 'lastMonth'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Last Month
          </button>
        </div>

        {/* Total Summary */}
        <div className="card">
          <h3 className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Total Spent</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredExpenses.length} transactions
          </p>
        </div>

        {/* Daily Spending Chart */}
        {dailyChartData.length > 0 && (
          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Daily Spending
            </h2>
            <div className="w-full h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9ca3af"
                    style={{ fontSize: '10px' }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '10px' }}
                    tick={{ fontSize: 10 }}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Distribution Chart */}
        {categoryChartData.length > 0 && (
          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Category Distribution
            </h2>
            <div className="w-full h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const percentage = (percent * 100).toFixed(0);
                      return `${percentage}%`;
                    }}
                    outerRadius="60%"
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: '11px' }}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.color] || COLORS.gray} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown List */}
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Category Breakdown
          </h2>
          <div className="space-y-3">
            {categoryChartData.map(cat => {
              const percentage = (cat.value / totalSpent * 100).toFixed(1);
              return (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[cat.color] || COLORS.gray }}
                    />
                    <span className="text-sm sm:text-base text-gray-900 dark:text-white capitalize truncate">{cat.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(cat.value)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="card text-center py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            No data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
