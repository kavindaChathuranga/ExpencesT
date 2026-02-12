import { useState, useEffect } from 'react';
import { Filter, Trash2, Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, formatCurrency, formatDate, getMonthDateRange, groupTransactionsByDate } from '../utils/helpers';
import SwipeableExpenseItem from '../components/SwipeableExpenseItem';
import ConfirmDialog from '../components/ConfirmDialog';
import UserProfile from '../components/UserProfile';

const History = ({ userId, user, showToast, expenseCategories, incomeCategories }) => {
  // Use provided categories or fall back to defaults
  const CATEGORIES = expenseCategories && expenseCategories.length > 0 ? expenseCategories : DEFAULT_EXPENSE_CATEGORIES;
  const INCOME_CATEGORIES = incomeCategories && incomeCategories.length > 0 ? incomeCategories : DEFAULT_INCOME_CATEGORIES;

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'expense', 'income'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Clear data when date range changes
  useEffect(() => {
    setExpenses([]);
    setIncomes([]);
    setFilteredTransactions([]);
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

  useEffect(() => {
    filterTransactions();
  }, [expenses, incomes, selectedType, selectedCategory]);

  const getDateRanges = () => {
    let startDate, endDate;
    if (dateRange === 'month') {
      ({ startDate, endDate } = getMonthDateRange());
    } else if (dateRange === 'lastMonth') {
      ({ startDate, endDate } = getMonthDateRange(-1));
    } else {
      startDate = new Date(2020, 0, 1);
      endDate = new Date();
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
        }));
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
        }));
        setIncomes(incomesData);
      },
      (error) => {
        console.error('Error fetching incomes:', error);
      }
    );
  };

  const filterTransactions = () => {
    let allTransactions = [...expenses, ...incomes];
    
    // Type filter
    if (selectedType === 'expense') {
      allTransactions = allTransactions.filter(t => t.type === 'expense');
    } else if (selectedType === 'income') {
      allTransactions = allTransactions.filter(t => t.type === 'income');
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      allTransactions = allTransactions.filter(t => t.category === selectedCategory);
    }
    
    // Sort by timestamp
    allTransactions.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });
    
    setFilteredTransactions(allTransactions);
  };

  const handleDelete = async (transaction) => {
    setDeleteConfirm(transaction);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const collectionName = deleteConfirm.type === 'income' ? 'incomes' : 'expenses';
      await deleteDoc(doc(db, collectionName, deleteConfirm.id));
      
      if (deleteConfirm.type === 'income') {
        setIncomes(incomes.filter(inc => inc.id !== deleteConfirm.id));
      } else {
        setExpenses(expenses.filter(exp => exp.id !== deleteConfirm.id));
      }
      
      if (showToast) {
        showToast(`${deleteConfirm.type === 'income' ? 'Income' : 'Expense'} deleted successfully`, 'success');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      if (showToast) {
        showToast('Failed to delete', 'error');
      }
    } finally {
      setDeleteConfirm(null);
    }
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  // Get categories based on selected type
  const getFilterCategories = () => {
    if (selectedType === 'income') return INCOME_CATEGORIES;
    if (selectedType === 'expense') return CATEGORIES;
    return [...CATEGORIES, ...INCOME_CATEGORIES];
  };

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle filters"
            >
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <UserProfile user={user} />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4 border border-gray-200 dark:border-gray-700">
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedType('all'); setSelectedCategory('all'); }}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                    selectedType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { setSelectedType('expense'); setSelectedCategory('all'); }}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                    selectedType === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => { setSelectedType('income'); setSelectedCategory('all'); }}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                    selectedType === 'income'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

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
                {getFilterCategories().map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1 mb-1">
              <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Income</span>
            </div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-1 mb-1">
              <ArrowDownCircle className="w-3 h-3 text-red-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Expenses</span>
            </div>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              -{formatCurrency(totalExpense)}
            </p>
          </div>
          <div className={`bg-white dark:bg-gray-800 rounded-xl p-3 border ${balance >= 0 ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'}`}>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Balance</span>
            <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
            </p>
          </div>
        </div>

        <div className="text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-900 dark:text-white font-medium mb-1">No transactions found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            (() => {
              const groupedTransactions = groupTransactionsByDate(filteredTransactions);
              return Object.entries(groupedTransactions).map(([dateLabel, dayTransactions]) => (
                <div key={dateLabel} className="space-y-2">
                  {/* Date Header */}
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-1">
                    {dateLabel}
                  </h3>
                  
                  {/* Transactions for this date */}
                  <div className="space-y-2">
                    {dayTransactions.map((transaction) => {
                      const isIncome = transaction.type === 'income';
                      const category = isIncome
                        ? INCOME_CATEGORIES.find(cat => cat.id === transaction.category)
                        : CATEGORIES.find(cat => cat.id === transaction.category);
                      
                      return (
                        <div key={transaction.id}>
                          <SwipeableExpenseItem onDelete={() => handleDelete(transaction)}>
                            <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border transition-colors ${
                              isIncome 
                                ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className={`w-10 h-10 ${category?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
                                    {category?.icon || (isIncome ? '💵' : '💰')}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                      {isIncome ? transaction.description : transaction.reason}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                        isIncome 
                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      }`}>
                                        {isIncome ? 'Income' : 'Expense'}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {category?.name || 'Other'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                      {formatDate(transaction.timestamp)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className={`font-semibold ${
                                    isIncome 
                                      ? 'text-emerald-600 dark:text-emerald-400' 
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                                  </p>
                                  <button
                                    onClick={() => handleDelete(transaction)}
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
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          title={`Delete ${deleteConfirm.type === 'income' ? 'Income' : 'Expense'}?`}
          message="This action cannot be undone. Are you sure you want to delete this transaction?"
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
