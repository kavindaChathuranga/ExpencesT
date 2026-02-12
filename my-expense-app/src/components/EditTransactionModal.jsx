import { useState, useEffect } from 'react';
import { X, Pencil } from 'lucide-react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../utils/helpers';

const EditTransactionModal = ({ transaction, onClose, onUpdated, showToast, expenseCategories, incomeCategories }) => {
  const isIncome = transaction.type === 'income';
  const categories = isIncome 
    ? (incomeCategories && incomeCategories.length > 0 ? incomeCategories : DEFAULT_INCOME_CATEGORIES)
    : (expenseCategories && expenseCategories.length > 0 ? expenseCategories : DEFAULT_EXPENSE_CATEGORIES);
  
  const [amount, setAmount] = useState(transaction.amount?.toString() || '');
  const [category, setCategory] = useState(transaction.category || '');
  const [description, setDescription] = useState(
    isIncome ? (transaction.description || '') : (transaction.reason || '')
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (!description || description.trim().length < 2) {
      newErrors.description = 'Please add a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const collectionName = isIncome ? 'incomes' : 'expenses';
      const docRef = doc(db, collectionName, transaction.id);
      
      const updateData = {
        amount: parseFloat(amount),
        category,
        ...(isIncome 
          ? { description: description.trim() } 
          : { reason: description.trim() })
      };

      await updateDoc(docRef, updateData);
      
      if (showToast) {
        showToast(`${isIncome ? 'Income' : 'Expense'} updated successfully!`, 'success');
      }
      
      onUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating:', error);
      setErrors({ submit: 'Failed to update. Please try again.' });
      setLoading(false);
    }
  };

  const selectedCategoryData = categories.find(c => c.id === category);

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-[320px] rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[calc(100vh-100px)] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isIncome 
            ? 'border-emerald-100 dark:border-emerald-900' 
            : 'border-gray-100 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-2">
            <Pencil className={`w-5 h-5 ${isIncome ? 'text-emerald-500' : 'text-blue-500'}`} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit {isIncome ? 'Income' : 'Expense'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Amount (LKR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-3 py-2.5 text-base border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 transition-all ${
                errors.amount 
                  ? 'border-red-300 focus:ring-red-500' 
                  : isIncome
                    ? 'border-emerald-200 dark:border-emerald-700 focus:ring-emerald-500'
                    : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                    category === cat.id
                      ? isIncome
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[9px] mt-0.5 text-gray-600 dark:text-gray-400 truncate w-full text-center">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isIncome ? 'Description' : 'Reason'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2.5 text-base border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 transition-all ${
                errors.description 
                  ? 'border-red-300 focus:ring-red-500' 
                  : isIncome
                    ? 'border-emerald-200 dark:border-emerald-700 focus:ring-emerald-500'
                    : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder={isIncome ? 'e.g., Monthly salary' : 'e.g., Lunch at cafe'}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isIncome
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Updating...
              </span>
            ) : (
              'Update'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
