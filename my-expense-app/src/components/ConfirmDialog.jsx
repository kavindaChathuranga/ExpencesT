import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  const colors = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700',
      icon: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20'
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700',
      icon: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20'
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className={`w-14 h-14 mx-auto mb-4 rounded-full ${colors[type].bg} flex items-center justify-center`}>
            <AlertTriangle className={`w-7 h-7 ${colors[type].icon}`} />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 ${colors[type].button} text-white font-medium rounded-xl transition-all active:scale-95`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
