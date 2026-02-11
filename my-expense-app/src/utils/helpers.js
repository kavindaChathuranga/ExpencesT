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

export const getMonthDateRange = (monthOffset = 0) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;
  
  const startDate = new Date(year, month, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
};

export const getTodayDateRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  return { startDate, endDate };
};
