import { Home, History, BarChart3, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BottomNav = ({ currentPage, onPageChange }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex flex-col items-center justify-center py-2 px-4 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            <span className="text-xs mt-1 font-medium">Theme</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
