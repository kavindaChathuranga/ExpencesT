export const CATEGORIES = [
  { id: 'food', name: 'Food', icon: '🍔', color: 'bg-orange-500' },
  { id: 'grocery', name: 'Grocery', icon: '🛒', color: 'bg-green-500' },
  { id: 'bike', name: 'Bike', icon: '🏍️', color: 'bg-blue-500' },
  { id: 'transport', name: 'Transport', icon: '🚌', color: 'bg-purple-500' },
  { id: 'mobile', name: 'Mobile Bill', icon: '📱', color: 'bg-pink-500' },
  { id: 'stationery', name: 'Stationery', icon: '✏️', color: 'bg-yellow-500' },
  { id: 'other', name: 'Other', icon: '💰', color: 'bg-gray-500' }
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
