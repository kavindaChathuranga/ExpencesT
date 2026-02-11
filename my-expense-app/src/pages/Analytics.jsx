import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { CATEGORIES, formatCurrency, getMonthDateRange } from '../utils/helpers';

const Analytics = ({ userId }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    if (userId) {
      const unsubscribe = fetchExpenses();
      return () => unsubscribe && unsubscribe();
    }
  }, [userId, dateRange]);

  const fetchExpenses = () => {
    setLoading(true);
    let startDate, endDate;

    if (dateRange === 'month') {
      ({ startDate, endDate } = getMonthDateRange());
    } else {
      ({ startDate, endDate } = getMonthDateRange(-1));
    }

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const expensesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExpenses(expensesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  // Prepare daily chart data
  const getDailyChartData = () => {
    const dailyData = {};
    
    expenses.forEach(expense => {
      const date = expense.timestamp.toDate();
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
    
    expenses.forEach(expense => {
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
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const COLORS = {
    orange: '#06b6d4',
    green: '#3b82f6',
    blue: '#0ea5e9',
    purple: '#6366f1',
    pink: '#0284c7',
    yellow: '#0891b2',
    gray: '#64748b'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 page-transition">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Analytics
          </h1>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange('month')}
            className={`flex-1 py-2 px-4 text-sm rounded-lg font-medium transition-colors ${
              dateRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('lastMonth')}
            className={`flex-1 py-2 px-4 text-sm rounded-lg font-medium transition-colors ${
              dateRange === 'lastMonth'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Last Month
          </button>
        </div>

        {/* Total Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spent</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {expenses.length} transactions
          </p>
        </div>

        {/* Daily Spending Chart */}
        {dailyChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Daily Spending
            </h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Distribution Chart */}
        {categoryChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Category Distribution
            </h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
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
                      color: '#fff'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Category Breakdown
          </h2>
          <div className="space-y-3">
            {categoryChartData.map(cat => {
              const percentage = (cat.value / totalSpent * 100).toFixed(1);
              return (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[cat.color] || COLORS.gray }}
                    />
                    <span className="text-gray-900 dark:text-white">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(cat.value)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {expenses.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-3">📈</div>
            <p className="text-gray-900 dark:text-white font-medium mb-1">No data to analyze yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start adding expenses to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
