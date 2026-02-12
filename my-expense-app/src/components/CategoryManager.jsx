import { useState } from 'react';
import { X, Plus, Pencil, Trash2, Check } from 'lucide-react';
import { COMMON_ICONS, CATEGORY_COLORS } from '../utils/helpers';
import ConfirmDialog from './ConfirmDialog';

const CategoryManager = ({ 
  categories, 
  type, // 'expense' or 'income'
  onAdd, 
  onUpdate, 
  onDelete, 
  onClose,
  onSelect 
}) => {
  const [mode, setMode] = useState('list'); // 'list', 'add', 'edit'
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💰');
  const [selectedColor, setSelectedColor] = useState('bg-gray-500');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  const isIncome = type === 'income';

  const resetForm = () => {
    setName('');
    setSelectedIcon(isIncome ? '💵' : '💰');
    setSelectedColor(isIncome ? 'bg-emerald-500' : 'bg-blue-500');
    setEditingCategory(null);
    setMode('list');
  };

  const handleAdd = () => {
    setMode('add');
    setName('');
    setSelectedIcon(isIncome ? '💵' : '💰');
    setSelectedColor(isIncome ? 'bg-emerald-500' : 'bg-blue-500');
  };

  const handleEdit = (category) => {
    setMode('edit');
    setEditingCategory(category);
    setName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    
    if (mode === 'add') {
      const newCategory = {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type
      };
      await onAdd(newCategory);
    } else if (mode === 'edit' && editingCategory) {
      await onUpdate(editingCategory.id, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor
      });
    }
    
    setLoading(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    await onDelete(deleteConfirm.id);
    setLoading(false);
    setDeleteConfirm(null);
  };

  const handleSelectCategory = (category) => {
    if (onSelect) {
      onSelect(category);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-[70] sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-[340px] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isIncome ? 'border-emerald-100 dark:border-emerald-900' : 'border-gray-100 dark:border-gray-700'
        }`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'list' && `${isIncome ? 'Income Sources' : 'Expense Categories'}`}
            {mode === 'add' && `Add ${isIncome ? 'Source' : 'Category'}`}
            {mode === 'edit' && `Edit ${isIncome ? 'Source' : 'Category'}`}
          </h2>
          <button onClick={mode === 'list' ? onClose : resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {mode === 'list' && (
            <div className="space-y-2">
              {/* Add New Button */}
              <button
                onClick={handleAdd}
                className={`w-full p-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
                  isIncome 
                    ? 'border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New {isIncome ? 'Source' : 'Category'}</span>
              </button>

              {/* Category List */}
              {categories.map(category => (
                <div 
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <button
                    onClick={() => handleSelectCategory(category)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center text-xl`}>
                      {category.icon}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                  </button>
                  
                  {/* Only show edit/delete for user-created categories (have Firestore IDs) */}
                  {category.id && !['food', 'grocery', 'bike', 'transport', 'mobile', 'stationery', 'other', 'salary', 'freelance', 'gift', 'investment', 'refund', 'allowance', 'other_income'].includes(category.id) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(category)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(mode === 'add' || mode === 'edit') && (
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isIncome ? 'e.g., Part-time Job' : 'e.g., Entertainment'}
                  className={`w-full px-3 py-2.5 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 ${
                    isIncome 
                      ? 'border-emerald-200 dark:border-emerald-700 focus:ring-emerald-500'
                      : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-1.5 max-h-24 overflow-y-auto p-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  {COMMON_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                        selectedIcon === icon 
                          ? isIncome
                            ? 'bg-emerald-500 ring-2 ring-emerald-300'
                            : 'bg-blue-500 ring-2 ring-blue-300'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-9 gap-1.5">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full ${color} transition-all ${
                        selectedColor === color 
                          ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' 
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`w-12 h-12 ${selectedColor} rounded-full flex items-center justify-center text-2xl`}>
                    {selectedIcon}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {name || 'Category Name'}
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!name.trim() || loading}
                className={`w-full py-3 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  isIncome
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {mode === 'add' ? 'Add' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          title={`Delete ${isIncome ? 'Source' : 'Category'}?`}
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This won't delete existing transactions.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default CategoryManager;
