import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, Timestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { INCOME_CATEGORIES } from '../utils/helpers';

const AddIncomeModal = ({ userId, onClose, onIncomeAdded, preselectedCategory }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(preselectedCategory || '');
  const [description, setDescription] = useState('');
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
        collection(db, 'incomes'),
        where('userId', '==', userId),
        where('category', '==', category),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const descriptions = [...new Set(querySnapshot.docs.map(doc => doc.data().description).filter(d => d))];
      setSuggestions(descriptions.slice(0, 3));
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
        } else if (parseFloat(value) > 10000000) {
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
      case 'description':
        if (!value || value.trim().length === 0) {
          newErrors.description = 'Please describe the income source';
        } else if (value.trim().length < 2) {
          newErrors.description = 'Description too short';
        } else {
          delete newErrors.description;
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

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    if (touched.description) {
      validateField('description', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ amount: true, category: true, description: true });
    
    // Validate all fields
    const isAmountValid = validateField('amount', amount);
    const isCategoryValid = validateField('category', category);
    const isDescriptionValid = validateField('description', description);
    
    if (!isAmountValid || !isCategoryValid || !isDescriptionValid) {
      return;
    }

    try {
      setLoading(true);
      
      // Use local timestamp to ensure correct date filtering
      const now = new Date();
      
      await addDoc(collection(db, 'incomes'), {
        userId,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        timestamp: Timestamp.fromDate(now)
      });

      // Close modal immediately on success
      onIncomeAdded();
      onClose();
    } catch (error) {
      console.error('Error adding income:', error);
      setErrors({ submit: 'Failed to add income. Please try again.' });
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
        {/* Header with green accent */}
        <div className="px-4 py-3 border-b border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💵</span>
              <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200" id="modal-title">
                Add Income
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                +₨
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
                className={`w-full pl-10 pr-2.5 py-2 bg-emerald-50 dark:bg-emerald-900/20 border ${errors.amount && touched.amount ? 'border-red-500' : 'border-emerald-300 dark:border-emerald-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white text-sm transition-all`}
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
              Source
            </label>
            <div className="grid grid-cols-3 gap-2">
              {INCOME_CATEGORIES.map(cat => (
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
                      ? `${cat.color} text-white ring-2 ring-offset-1 ring-emerald-500 dark:ring-offset-gray-800` 
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
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => {
                setTouched(prev => ({ ...prev, description: true }));
                validateField('description', description);
              }}
              placeholder="e.g., Monthly salary, Freelance project"
              className={`w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-900/50 border ${errors.description && touched.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white text-sm transition-all`}
              required
            />
            {errors.description && touched.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
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
                    onClick={() => setDescription(suggestion)}
                    className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] rounded-md transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-500 text-xs text-center">{errors.submit}</p>
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
              className="flex-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                'Add Income'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomeModal;
