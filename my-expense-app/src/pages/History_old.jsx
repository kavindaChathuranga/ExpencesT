import { useState, useEffect } from 'react';
import { Filter, Trash2, Calendar } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { CATEGORIES, formatCurrency, formatDate, getMonthDateRange } from '../utils/helpers';

const History = ({ userId, expenses, loadingExpenses }) => {
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    filterExpenses();
  }, [expenses, selectedCategory, dateRange]);

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Filter by date range
    let startDate, endDate;
    if (dateRange === 'month') {
      ({ startDate, endDate } = getMonthDateRange());
    } else if (dateRange === 'lastMonth') {
      ({ startDate, endDate } = getMonthDateRange(-1));
    } else {
      // All time
      startDate = new Date(2020, 0, 1);
      endDate = new Date();
    }

    filtered = filtered.filter(expense => {
      const expenseDate = expense.timestamp?.toDate ? expense.timestamp.toDate() : new Date(expense.timestamp);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exp => exp.category === selectedCategory);
    }

    setFilteredExpenses(filtered);
  };

  const handleDelete = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      // No need to update state - real-time listener will handle it
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (loadingExpenses) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            History
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card space-y-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateRange('month')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    dateRange === 'month'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setDateRange('lastMonth')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    dateRange === 'lastMonth'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Last Month
                </button>
                <button
                  onClick={() => setDateRange('all')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    dateRange === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Total Summary */}
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="card text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No expenses found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredExpenses.map(expense => {
              const category = CATEGORIES.find(cat => cat.id === expense.category);
              return (
                <div key={expense.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 ${category?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-2xl flex-shrink-0`}>
                        {category?.icon || '💰'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {expense.reason}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {category?.name || 'Other'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(expense.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(expense.amount)}
                      </p>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
