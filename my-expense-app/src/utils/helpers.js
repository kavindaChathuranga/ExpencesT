// Default Expense Categories (fallback)
export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food', icon: '🍔', color: 'bg-orange-500' },
  { id: 'grocery', name: 'Grocery', icon: '🛒', color: 'bg-green-500' },
  { id: 'bike', name: 'Bike', icon: '🏍️', color: 'bg-blue-500' },
  { id: 'transport', name: 'Transport', icon: '🚌', color: 'bg-purple-500' },
  { id: 'mobile', name: 'Mobile Bill', icon: '📱', color: 'bg-pink-500' },
  { id: 'stationery', name: 'Stationery', icon: '✏️', color: 'bg-yellow-500' },
  { id: 'other', name: 'Other', icon: '💰', color: 'bg-gray-500' }
];

// Default Income Categories (fallback)
export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: '💵', color: 'bg-emerald-500' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: 'bg-cyan-500' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: 'bg-pink-500' },
  { id: 'investment', name: 'Investment', icon: '📈', color: 'bg-indigo-500' },
  { id: 'refund', name: 'Refund', icon: '↩️', color: 'bg-amber-500' },
  { id: 'allowance', name: 'Allowance', icon: '👨‍👩‍👧', color: 'bg-violet-500' },
  { id: 'other_income', name: 'Other', icon: '💎', color: 'bg-teal-500' }
];

// Keep legacy exports for backward compatibility
export const CATEGORIES = DEFAULT_EXPENSE_CATEGORIES;
export const INCOME_CATEGORIES = DEFAULT_INCOME_CATEGORIES;

// Common icons for category selection
export const COMMON_ICONS = [
  '🍔', '🍕', '🍜', '☕', '🍺', '🛒', '🏍️', '🚌', '🚗', '✈️',
  '📱', '💻', '🎮', '📚', '✏️', '🎬', '🎵', '🏥', '💊', '🏋️',
  '👕', '👟', '💇', '🏠', '💡', '🔧', '🎁', '💵', '💳', '📈',
  '💼', '🏦', '📦', '🛍️', '🎓', '🐕', '🌱', '⛽', '🅿️', '💰'
];

// Category colors
export const CATEGORY_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
  'bg-rose-500', 'bg-gray-500'
];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get relative date label (Today, Yesterday, etc.)
export const getRelativeDateLabel = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time to midnight for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    }).format(date);
  }
};

// Group expenses by date
export const groupExpensesByDate = (expenses) => {
  const groups = {};
  
  expenses.forEach(expense => {
    const label = getRelativeDateLabel(expense.timestamp);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(expense);
  });
  
  return groups;
};

// Group transactions (expenses + incomes) by date
export const groupTransactionsByDate = (transactions) => {
  const groups = {};
  
  transactions.forEach(transaction => {
    const label = getRelativeDateLabel(transaction.timestamp);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(transaction);
  });
  
  // Sort transactions within each group by timestamp (newest first)
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || a.timestamp?.getTime?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || b.timestamp?.getTime?.() || 0;
      return timeB - timeA;
    });
  });
  
  return groups;
};

export const getMonthDateRange = (monthOffset = 0) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;
  
  // Start at first day of month at midnight
  const startDate = new Date(year, month, 1, 0, 0, 0, 0);
  
  // End at last day of month at 23:59:59.999
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
};

export const getTodayDateRange = () => {
  const now = new Date();
  
  // Start at beginning of today (midnight)
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  
  // End at end of today (23:59:59.999)
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  return { startDate, endDate };
};
