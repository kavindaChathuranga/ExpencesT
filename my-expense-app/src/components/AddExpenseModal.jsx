import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { CATEGORIES } from '../utils/helpers';

const AddExpenseModal = ({ userId, onClose, onExpenseAdded, preselectedCategory }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(preselectedCategory || '');
  const [reason, setReason] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (category) {
      fetchSuggestions();
    }
  }, [category]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const fetchSuggestions = async () => {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        where('category', '==', category),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const reasons = [...new Set(querySnapshot.docs.map(doc => doc.data().reason).filter(r => r))];
      setSuggestions(reasons.slice(0, 3));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'amount':
        if (!value || parseFloat(value) <= 0) {
          newErrors.amount = 'Amount must be greater than 0';
        } else if (parseFloat(value) > 1000000) {
          newErrors.amount = 'Amount seems too large';
        } else {
          delete newErrors.amount;
        }
        break;
      case 'category':
        if (!value) {
          newErrors.category = 'Please select a category';
        } else {
          delete newErrors.category;
        }
        break;
      case 'reason':
        if (!value || value.trim().length === 0) {
          newErrors.reason = 'Please describe the expense';
        } else if (value.trim().length < 2) {
          newErrors.reason = 'Description too short';
        } else {
          delete newErrors.reason;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    if (touched.amount) {
      validateField('amount', value);
    }
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setReason(value);
    if (touched.reason) {
      validateField('reason', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ amount: true, category: true, reason: true });
    
    // Validate all fields
    const isAmountValid = validateField('amount', amount);
    const isCategoryValid = validateField('category', category);
    const isReasonValid = validateField('reason', reason);
    
    if (!isAmountValid || !isCategoryValid || !isReasonValid) {
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

      // Success animation
      const successDiv = document.createElement('div');
      successDiv.className = 'animate-scale-in';
      
      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
      setErrors({ submit: 'Failed to add expense. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-[320px] rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[calc(100vh-100px)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white" id="modal-title">
              Add Expense
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-5 overflow-y-auto">
          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                ₨
              </span>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, amount: true }));
                  validateField('amount', amount);
                }}
                placeholder="0.00"
                autoFocus
                className={`w-full pl-8 pr-2.5 py-2 bg-gray-50 dark:bg-gray-900/50 border ${errors.amount && touched.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm transition-all`}
                required
                min="0"
                step="0.01"
              />
            </div>
            {errors.amount && touched.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category Quick Select */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    setTouched(prev => ({ ...prev, category: true }));
                    validateField('category', cat.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all active:scale-95 ${
                    category === cat.id 
                      ? `${cat.color} text-white ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-800` 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-[9px] font-medium text-center leading-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && touched.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <input
              type="text"
              value={reason}
              onChange={handleReasonChange}
              onBlur={() => {
                setTouched(prev => ({ ...prev, reason: true }));
                validateField('reason', reason);
              }}
              placeholder="What did you buy?"
              className={`w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-900/50 border ${errors.reason && touched.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm transition-all`}
              required
            />
            {errors.reason && touched.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                Recent
              </p>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setReason(suggestion)}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-[10px] rounded-md transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-xs rounded-lg transition-all active:scale-95"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="flex-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
