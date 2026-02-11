import { Home, PieChart, Clock } from 'lucide-react';

const BottomNav = ({ currentPage, onNavigate }) => {

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'analytics', icon: PieChart, label: 'Analytics' },
    { id: 'history', icon: Clock, label: 'History' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Navigation Bar */}
      <div className="relative mx-auto max-w-xs px-3 pb-4 sm:pb-3">
        <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-[22px] shadow-md border border-gray-200/20 dark:border-gray-700/20 px-2 py-1.5">
          <div className="flex items-center justify-center gap-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComponent 
                    className={`w-5 h-5 transition-all ${
                      isActive ? 'scale-100' : 'scale-95'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span 
                    className={`text-[9px] font-medium transition-all ${
                      isActive ? 'opacity-100' : 'opacity-70'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
