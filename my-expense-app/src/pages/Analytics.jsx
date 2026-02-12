import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, formatCurrency, getMonthDateRange } from '../utils/helpers';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import UserProfile from '../components/UserProfile';

const Analytics = ({ userId, user, expenseCategories, incomeCategories }) => {
  // Use provided categories or fall back to defaults
  const CATEGORIES = expenseCategories && expenseCategories.length > 0 ? expenseCategories : DEFAULT_EXPENSE_CATEGORIES;
  const INCOME_CATEGORIES = incomeCategories && incomeCategories.length > 0 ? incomeCategories : DEFAULT_INCOME_CATEGORIES;

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [viewType, setViewType] = useState('overview'); // 'overview', 'expenses', 'income'

  // Clear data when date range changes
  useEffect(() => {
    setExpenses([]);
    setIncomes([]);
    setLoading(true);
  }, [dateRange]);

  useEffect(() => {
    if (userId) {
      const unsubscribeExpenses = fetchExpenses();
      const unsubscribeIncomes = fetchIncomes();
      return () => {
        unsubscribeExpenses && unsubscribeExpenses();
        unsubscribeIncomes && unsubscribeIncomes();
      };
    }
  }, [userId, dateRange]);

  const getDateRanges = () => {
    let startDate, endDate;
    if (dateRange === 'month') {
      ({ startDate, endDate } = getMonthDateRange());
    } else {
      ({ startDate, endDate } = getMonthDateRange(-1));
    }
    return { startDate, endDate };
  };

  const fetchExpenses = () => {
    setLoading(true);
    const { startDate, endDate } = getDateRanges();

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate)
    );

    return onSnapshot(q,
      (querySnapshot) => {
        const expensesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'expense',
          ...doc.data()
        })).sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeA - timeB;
        });
        setExpenses(expensesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        setLoading(false);
      }
    );
  };

  const fetchIncomes = () => {
    const { startDate, endDate } = getDateRanges();

    const q = query(
      collection(db, 'incomes'),
      where('userId', '==', userId),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate)
    );

    return onSnapshot(q,
      (querySnapshot) => {
        const incomesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'income',
          ...doc.data()
        })).sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeA - timeB;
        });
        setIncomes(incomesData);
      },
      (error) => {
        console.error('Error fetching incomes:', error);
      }
    );
  };

  // Prepare daily comparison data
  const getDailyComparisonData = () => {
    const dailyData = {};
    
    expenses.forEach(expense => {
      if (!expense.timestamp?.toDate) return;
      const date = expense.timestamp.toDate();
      const day = date.getDate();
      if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0 };
      dailyData[day].expense += expense.amount;
    });

    incomes.forEach(income => {
      if (!income.timestamp?.toDate) return;
      const date = income.timestamp.toDate();
      const day = date.getDate();
      if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0 };
      dailyData[day].income += income.amount;
    });

    return Object.keys(dailyData)
      .map(day => ({
        day: parseInt(day),
        income: dailyData[day].income,
        expense: dailyData[day].expense
      }))
      .sort((a, b) => a.day - b.day);
  };

  // Prepare expense category data
  const getExpenseCategoryData = () => {
    const categoryData = {};
    expenses.forEach(expense => {
      if (!categoryData[expense.category]) categoryData[expense.category] = 0;
      categoryData[expense.category] += expense.amount;
    });

    return CATEGORIES.map(cat => ({
      name: cat.name,
      value: categoryData[cat.id] || 0,
      color: cat.color.replace('bg-', '').replace('-500', '')
    })).filter(item => item.value > 0);
  };

  // Prepare income category data
  const getIncomeCategoryData = () => {
    const categoryData = {};
    incomes.forEach(income => {
      if (!categoryData[income.category]) categoryData[income.category] = 0;
      categoryData[income.category] += income.amount;
    });

    return INCOME_CATEGORIES.map(cat => ({
      name: cat.name,
      value: categoryData[cat.id] || 0,
      color: cat.color.replace('bg-', '').replace('-500', '')
    })).filter(item => item.value > 0);
  };

  const dailyComparisonData = getDailyComparisonData();
  const expenseCategoryData = getExpenseCategoryData();
  const incomeCategoryData = getIncomeCategoryData();
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const balance = totalIncome - totalExpenses;

  const EXPENSE_COLORS = {
    orange: '#f97316',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    yellow: '#eab308',
    gray: '#64748b'
  };

  const INCOME_COLORS = {
    emerald: '#10b981',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    green: '#22c55e',
    pink: '#ec4899',
    cyan: '#06b6d4',
    gray: '#64748b'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const hasData = expenses.length > 0 || incomes.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 page-transition">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <UserProfile user={user} />
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

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1 mb-1">
              <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Income</span>
            </div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{incomes.length} entries</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-1 mb-1">
              <ArrowDownCircle className="w-3 h-3 text-red-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Expenses</span>
            </div>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{expenses.length} entries</p>
          </div>
          <div className={`bg-white dark:bg-gray-800 rounded-xl p-3 border ${balance >= 0 ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'}`}>
            <div className="flex items-center gap-1 mb-1">
              <Wallet className={`w-3 h-3 ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Balance</span>
            </div>
            <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* View Type Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewType('overview')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
              viewType === 'overview'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewType('expenses')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
              viewType === 'expenses'
                ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setViewType('income')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
              viewType === 'income'
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Income
          </button>
        </div>

        {!hasData ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-3">📈</div>
            <p className="text-gray-900 dark:text-white font-medium mb-1">No data to analyze yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start adding transactions to see analytics</p>
          </div>
        ) : (
          <>
            {/* Overview View */}
            {viewType === 'overview' && dailyComparisonData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Daily Income vs Expenses
                </h2>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
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
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Expenses View */}
            {viewType === 'expenses' && expenseCategoryData.length > 0 && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Expense Categories
                  </h2>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {expenseCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[entry.color] || EXPENSE_COLORS.gray} />
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

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Expense Breakdown
                  </h2>
                  <div className="space-y-3">
                    {expenseCategoryData.map(cat => {
                      const percentage = (cat.value / totalExpenses * 100).toFixed(1);
                      return (
                        <div key={cat.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: EXPENSE_COLORS[cat.color] || EXPENSE_COLORS.gray }}
                            />
                            <span className="text-sm text-gray-900 dark:text-white">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(cat.value)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Income View */}
            {viewType === 'income' && incomeCategoryData.length > 0 && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Income Sources
                  </h2>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {incomeCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={INCOME_COLORS[entry.color] || INCOME_COLORS.gray} />
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

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Income Breakdown
                  </h2>
                  <div className="space-y-3">
                    {incomeCategoryData.map(cat => {
                      const percentage = (cat.value / totalIncome * 100).toFixed(1);
                      return (
                        <div key={cat.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: INCOME_COLORS[cat.color] || INCOME_COLORS.gray }}
                            />
                            <span className="text-sm text-gray-900 dark:text-white">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              +{formatCurrency(cat.value)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Empty state for specific views */}
            {viewType === 'expenses' && expenseCategoryData.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No expenses recorded for this period</p>
              </div>
            )}

            {viewType === 'income' && incomeCategoryData.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No income recorded for this period</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
