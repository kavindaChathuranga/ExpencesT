import { useState } from 'react';
import { CATEGORIES } from '../utils/helpers';
import AddExpenseModal from './AddExpenseModal';

const QuickAddButton = ({ category, userId }) => {
  const [showModal, setShowModal] = useState(false);
  
  const categoryData = CATEGORIES.find(c => c.id === category);
  if (!categoryData) return null;

  const IconComponent = categoryData.icon;

  const gradients = {
    food: 'bg-orange-500',
    grocery: 'bg-green-500',
    bike: 'bg-blue-500',
    transport: 'bg-purple-500',
    mobile: 'bg-cyan-500',
    stationery: 'bg-yellow-500',
    other: 'bg-gray-500'
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex flex-col items-center justify-center p-3 rounded-xl ${gradients[category]} hover:opacity-90 transition-all active:scale-95`}
        aria-label={`Quick add ${categoryData.label} expense`}
      >
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-1.5">
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-medium text-white capitalize">
          {categoryData.label}
        </span>
      </button>

      {showModal && (
        <AddExpenseModal
          userId={userId}
          onClose={() => setShowModal(false)}
          onExpenseAdded={() => setShowModal(false)}
          preselectedCategory={category}
        />
      )}
    </>
  );
};

export default QuickAddButton;
