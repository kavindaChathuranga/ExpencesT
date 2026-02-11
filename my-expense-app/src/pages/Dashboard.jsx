import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar } from 'lucide-react';
import { CATEGORIES, formatCurrency, getMonthDateRange, getTodayDateRange } from '../utils/helpers';
import AddExpenseModal from '../components/AddExpenseModal';
import QuickAddButton from '../components/QuickAddButton';

const Dashboard = ({ userId, expenses, loadingExpenses, showToast }) => {
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  console.log('Dashboard render - expenses:', expenses?.length || 0);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      calculateTotals(expenses);
    } else {
      setMonthlyTotal(0);
      setTodayTotal(0);
    }
  }, [expenses]);

  const calculateTotals = (expensesData) => {
    const { startDate: monthStart, endDate: monthEnd } = getMonthDateRange();
    const { startDate: todayStart, endDate: todayEnd } = getTodayDateRange();
    
    console.log('Dashboard - Total expenses:', expensesData.length);
    console.log('Dashboard - Sample expense:', expensesData[0]);
    console.log('Dashboard - Month range:', monthStart, 'to', monthEnd);
    console.log('Dashboard - Today range:', todayStart, 'to', todayEnd);

    // Calculate monthly total
    const monthlyExpenses = expensesData
      .filter(expense => {
        if (!expense.timestamp) return false;
        
        // Handle Firestore Timestamp
        const expenseDate = expense.timestamp.toDate ? expense.timestamp.toDate() : new Date(expense.timestamp);
        console.log('Checking expense date:', expenseDate, 'for month');
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });
    
    console.log('Monthly expenses count:', monthlyExpenses.length);
    const monthly = monthlyExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    console.log('Monthly total:', monthly);
    
    setMonthlyTotal(monthly);

    // Calculate today's total
    const todayExpenses = expensesData
      .filter(expense => {
        if (!expense.timestamp) return false;
        
        // Handle Firestore Timestamp
        const expenseDate = expense.timestamp.toDate ? expense.timestamp.toDate() : new Date(expense.timestamp);
        console.log('Checking expense date:', expenseDate, 'for today');
        return expenseDate >= todayStart && expenseDate <= todayEnd;
      });
    
    console.log('Today expenses count:', todayExpenses.length);
    const today = todayExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    console.log('Today total:', today);
    
    setTodayTotal(today);
  };

  const handleQuickAdd = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowModal(true);
  };

  const handleAddExpense = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleExpenseAdded = () => {
    // No need to fetch - real-time updates via onSnapshot
    setShowModal(false);
    setSelectedCategory(null);
    if (showToast) {
      showToast('Expense added successfully! 🎉', 'success');
    }
  };

  const quickCategories = CATEGORIES.filter(cat => 
    ['food', 'grocery', 'bike'].includes(cat.id)
  );

  // Get recent expenses
  const recentExpenses = expenses.slice(0, 5);

  if (loadingExpenses) {
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
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Expense Tracker
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">This Month</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(monthlyTotal)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Today</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(todayTotal)}
            </p>
          </div>
        </div>

        {/* Add Expense Button - Primary Action */}
        <button
          onClick={handleAddExpense}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Add New Expense
        </button>

        {/* Quick Add Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Add
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

        {/* Recent Expenses */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent Transactions
          </h2>
          {expenses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-5xl mb-3">💸</div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">No expenses yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click above to add your first expense</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 5).map((expense, index) => {
                const category = CATEGORIES.find(cat => cat.id === expense.category);
                return (
                  <div 
                    key={expense.id} 
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${category?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-2xl`}>
                        {category?.icon || '💰'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {expense.reason}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {category?.name || 'Other'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <AddExpenseModal
          userId={userId}
          initialCategory={selectedCategory}
          onClose={() => {
            setShowModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={handleExpenseAdded}
        />
      )}
    </div>
  );
};

export default Dashboard;
