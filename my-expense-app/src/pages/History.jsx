import { useState, useEffect } from 'react';
import { Filter, Trash2, Calendar } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { CATEGORIES, formatCurrency, formatDate, getMonthDateRange, groupExpensesByDate } from '../utils/helpers';
import SwipeableExpenseItem from '../components/SwipeableExpenseItem';
import ConfirmDialog from '../components/ConfirmDialog';

const History = ({ userId, showToast }) => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (userId) {
      const unsubscribe = fetchExpenses();
      return () => unsubscribe && unsubscribe();
    }
  }, [userId, dateRange]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, selectedCategory]);

  const fetchExpenses = () => {
    setLoading(true);
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

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate)
    );

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const expensesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeB - timeA; // descending order
        });
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

  const filterExpenses = () => {
    if (selectedCategory === 'all') {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(expenses.filter(exp => exp.category === selectedCategory));
    }
  };

  const handleDelete = async (expenseId) => {
    setDeleteConfirm(expenseId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteDoc(doc(db, 'expenses', deleteConfirm));
      setExpenses(expenses.filter(exp => exp.id !== deleteConfirm));
      if (showToast) {
        showToast('Expense deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      if (showToast) {
        showToast('Failed to delete expense', 'error');
      }
    } finally {
      setDeleteConfirm(null);
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between py-4">
            <div className="skeleton h-8 w-32"></div>
            <div className="skeleton h-10 w-10 rounded-lg"></div>
          </div>
          
          {/* Summary Skeleton */}
          <div className="card space-y-2">
            <div className="skeleton h-4 w-24"></div>
            <div className="skeleton h-6 w-32"></div>
            <div className="skeleton h-3 w-28"></div>
          </div>
          
          {/* Expense Item Skeletons */}
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card">
              <div className="flex items-start gap-3">
                <div className="skeleton w-12 h-12 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32"></div>
                  <div className="skeleton h-3 w-24"></div>
                  <div className="skeleton h-3 w-28"></div>
                </div>
                <div className="skeleton h-4 w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 page-transition">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            History
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle filters"
          >
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4 border border-gray-200 dark:border-gray-700">
            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateRange('month')}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                    dateRange === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setDateRange('lastMonth')}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                    dateRange === 'lastMonth'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Last Month
                </button>
                <button
                  onClick={() => setDateRange('all')}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                    dateRange === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-900 dark:text-white font-medium mb-1">No expenses found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            (() => {
              const groupedExpenses = groupExpensesByDate(filteredExpenses);
              return Object.entries(groupedExpenses).map(([dateLabel, dayExpenses]) => (
                <div key={dateLabel} className="space-y-2">
                  {/* Date Header */}
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-1">
                    {dateLabel}
                  </h3>
                  
                  {/* Expenses for this date */}
                  <div className="space-y-2">
                    {dayExpenses.map((expense) => {
                      const category = CATEGORIES.find(cat => cat.id === expense.category);
                      return (
                        <div key={expense.id}>
                          <SwipeableExpenseItem onDelete={() => handleDelete(expense.id)}>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
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
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 active:scale-90"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </SwipeableExpenseItem>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()
          )}
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </SwipeableExpenseItem>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Expense?"
          message="This action cannot be undone. Are you sure you want to delete this expense?"
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default History;
