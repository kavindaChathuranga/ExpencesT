import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Calendar, Wallet, ArrowUpCircle, ArrowDownCircle, Pencil, Settings } from 'lucide-react';
import { formatCurrency, getMonthDateRange, getTodayDateRange } from '../utils/helpers';
import AddExpenseModal from '../components/AddExpenseModal';
import AddIncomeModal from '../components/AddIncomeModal';
import EditTransactionModal from '../components/EditTransactionModal';
import CategoryManager from '../components/CategoryManager';
import QuickAddButton from '../components/QuickAddButton';

const Dashboard = ({ 
  userId, 
  expenses, 
  incomes, 
  loadingExpenses, 
  loadingIncomes, 
  showToast,
  expenseCategories,
  incomeCategories,
  addCategory,
  updateCategory,
  deleteCategory
}) => {
  const [monthlyExpenseTotal, setMonthlyExpenseTotal] = useState(0);
  const [monthlyIncomeTotal, setMonthlyIncomeTotal] = useState(0);
  const [todayExpenseTotal, setTodayExpenseTotal] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(null); // 'expense' or 'income'

  useEffect(() => {
    calculateExpenseTotals(expenses || []);
  }, [expenses]);

  useEffect(() => {
    calculateIncomeTotals(incomes || []);
  }, [incomes]);

  const getTimestampMs = (timestamp) => {
    if (!timestamp) return 0;
    if (timestamp.toDate) return timestamp.toDate().getTime();
    if (timestamp.toMillis) return timestamp.toMillis();
    if (timestamp instanceof Date) return timestamp.getTime();
    return new Date(timestamp).getTime();
  };

  const calculateExpenseTotals = (expensesData) => {
    const { startDate: monthStart, endDate: monthEnd } = getMonthDateRange();
    const { startDate: todayStart, endDate: todayEnd } = getTodayDateRange();
    
    const monthStartMs = monthStart.getTime();
    const monthEndMs = monthEnd.getTime();
    const todayStartMs = todayStart.getTime();
    const todayEndMs = todayEnd.getTime();

    const monthlyExpenses = expensesData.filter(expense => {
      const expenseMs = getTimestampMs(expense.timestamp);
      return expenseMs >= monthStartMs && expenseMs <= monthEndMs;
    });
    
    const monthly = monthlyExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    setMonthlyExpenseTotal(monthly);

    const todayExpenses = expensesData.filter(expense => {
      const expenseMs = getTimestampMs(expense.timestamp);
      return expenseMs >= todayStartMs && expenseMs <= todayEndMs;
    });
    
    const today = todayExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    setTodayExpenseTotal(today);
  };

  const calculateIncomeTotals = (incomesData) => {
    const { startDate: monthStart, endDate: monthEnd } = getMonthDateRange();
    
    const monthStartMs = monthStart.getTime();
    const monthEndMs = monthEnd.getTime();

    const monthlyIncomes = incomesData.filter(income => {
      const incomeMs = getTimestampMs(income.timestamp);
      return incomeMs >= monthStartMs && incomeMs <= monthEndMs;
    });
    
    const monthly = monthlyIncomes.reduce((sum, income) => sum + (Number(income.amount) || 0), 0);
    setMonthlyIncomeTotal(monthly);
  };

  const handleQuickAdd = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowExpenseModal(true);
  };

  const handleAddExpense = () => {
    setSelectedCategory(null);
    setShowExpenseModal(true);
  };

  const handleAddIncome = () => {
    setShowIncomeModal(true);
  };

  const handleExpenseAdded = () => {
    setShowExpenseModal(false);
    setSelectedCategory(null);
    if (showToast) {
      showToast('Expense added successfully! 💸', 'success');
    }
  };

  const handleIncomeAdded = () => {
    setShowIncomeModal(false);
    if (showToast) {
      showToast('Income added successfully! 💵', 'success');
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleTransactionUpdated = () => {
    setEditingTransaction(null);
  };

  const quickCategories = (expenseCategories || []).filter(cat => 
    ['food', 'grocery', 'bike'].includes(cat.id)
  );

  // Combine and sort recent transactions
  const recentTransactions = [
    ...(expenses || []).slice(0, 10).map(e => ({ ...e, type: 'expense' })),
    ...(incomes || []).slice(0, 10).map(i => ({ ...i, type: 'income' }))
  ]
    .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp))
    .slice(0, 5);

  const balance = monthlyIncomeTotal - monthlyExpenseTotal;

  if (loadingExpenses || loadingIncomes) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Header Skeleton */}
          <div className="text-center py-6">
            <div className="skeleton h-9 w-48 mx-auto mb-3"></div>
            <div className="skeleton h-4 w-36 mx-auto"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card space-y-2">
              <div className="skeleton h-4 w-24"></div>
              <div className="skeleton h-8 w-32"></div>
            </div>
            <div className="card space-y-2">
              <div className="skeleton h-4 w-20"></div>
              <div className="skeleton h-8 w-28"></div>
            </div>
          </div>

          {/* Quick Add Skeleton */}
          <div className="space-y-3">
            <div className="skeleton h-6 w-24"></div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-24 rounded-2xl"></div>
              ))}
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="skeleton h-12 rounded-lg"></div>

          {/* Recent Expenses Skeleton */}
          <div className="space-y-3">
            <div className="skeleton h-6 w-32"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="card flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-32"></div>
                    <div className="skeleton h-3 w-24"></div>
                  </div>
                  <div className="skeleton h-5 w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 page-transition">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Expense Tracker
          </h1>
        </div>

        {/* Balance Card */}
        <div className={`rounded-xl p-5 border ${balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">This Month Balance</span>
            <Wallet className={`w-5 h-5 ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Income Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Income</span>
              <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(monthlyIncomeTotal)}
            </p>
          </div>

          {/* Expense Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span>
              <ArrowDownCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              -{formatCurrency(monthlyExpenseTotal)}
            </p>
          </div>
        </div>

        {/* Today's Spending */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Today's Spending</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(todayExpenseTotal)}
              </p>
            </div>
            <TrendingDown className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddExpense}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowDownCircle className="w-5 h-5" />
            Add Expense
          </button>
          <button
            onClick={handleAddIncome}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowUpCircle className="w-5 h-5" />
            Add Income
          </button>
        </div>

        {/* Quick Add Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Add Expense
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {quickCategories.map(category => (
              <QuickAddButton
                key={category.id}
                category={category}
                onClick={() => handleQuickAdd(category.id)}
              />
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent Transactions
          </h2>
          {recentTransactions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">No transactions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add your first income or expense</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                const category = isIncome 
                  ? (incomeCategories || []).find(cat => cat.id === transaction.category)
                  : (expenseCategories || []).find(cat => cat.id === transaction.category);
                
                return (
                  <div 
                    key={transaction.id} 
                    onClick={() => handleEditTransaction(transaction)}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between border cursor-pointer ${
                      isIncome 
                        ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    } transition-colors active:scale-[0.98]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${category?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-xl`}>
                        {category?.icon || (isIncome ? '💵' : '💰')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {isIncome ? transaction.description : transaction.reason}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            isIncome 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {isIncome ? 'Income' : 'Expense'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {category?.name || 'Other'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${
                        isIncome 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <Pencil className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <AddExpenseModal
          userId={userId}
          preselectedCategory={selectedCategory}
          categories={expenseCategories}
          onClose={() => {
            setShowExpenseModal(false);
            setSelectedCategory(null);
          }}
          onExpenseAdded={handleExpenseAdded}
          onManageCategories={() => {
            setShowExpenseModal(false);
            setShowCategoryManager('expense');
          }}
        />
      )}

      {/* Add Income Modal */}
      {showIncomeModal && (
        <AddIncomeModal
          userId={userId}
          categories={incomeCategories}
          onClose={() => setShowIncomeModal(false)}
          onIncomeAdded={handleIncomeAdded}
          onManageCategories={() => {
            setShowIncomeModal(false);
            setShowCategoryManager('income');
          }}
        />
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          onClose={() => setEditingTransaction(null)}
          onUpdated={handleTransactionUpdated}
          showToast={showToast}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          type={showCategoryManager}
          categories={showCategoryManager === 'expense' ? expenseCategories : incomeCategories}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
          onClose={() => {
            // Navigate back to the respective Add modal
            if (showCategoryManager === 'expense') {
              setShowExpenseModal(true);
            } else {
              setShowIncomeModal(true);
            }
            setShowCategoryManager(null);
          }}
          onSelect={(category) => {
            setSelectedCategory(category.id);
            if (showCategoryManager === 'expense') {
              setShowExpenseModal(true);
            } else {
              setShowIncomeModal(true);
            }
            setShowCategoryManager(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
