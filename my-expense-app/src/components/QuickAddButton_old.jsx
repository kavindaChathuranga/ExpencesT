const QuickAddButton = ({ category, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="card hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center p-6 space-y-2 active:scale-95 transform transition-transform"
    >
      <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-3xl`}>
        {category.icon}
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {category.name}
      </span>
    </button>
  );
};

export default QuickAddButton;
