import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { CATEGORIES } from '../utils/helpers';

const AddExpenseModal = ({ userId, initialCategory, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(initialCategory || '');
  const [reason, setReason] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      fetchSuggestions();
    }
  }, [category]);

  const fetchSuggestions = async () => {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('timestamp', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const reasons = [...new Set(querySnapshot.docs.map(doc => doc.data().reason))];
      setSuggestions(reasons);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !category || !reason) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'expenses'), {
        userId,
        amount: parseFloat(amount),
        category,
        reason: reason.trim(),
        timestamp: serverTimestamp()
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Expense
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (LKR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    category === cat.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Lunch, Weekly groceries"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            
            {/* Suggestions */}
            {suggestions.length > 0 && !reason && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setReason(suggestion)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp Info */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Date & time will be automatically recorded
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
