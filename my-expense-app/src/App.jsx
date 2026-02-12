import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from './utils/firebase';
import { ThemeProvider } from './context/ThemeContext';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from './utils/helpers';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Analytics from './pages/Analytics';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import LoginScreen from './components/LoginScreen';
import UserProfile from './components/UserProfile';
import { useToast } from './hooks/useToast';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authError, setAuthError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingIncomes, setLoadingIncomes] = useState(true);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    // Check if Firebase is configured
    if (!hasFirebaseConfig) {
      setAuthError('Firebase not configured');
      setLoading(false);
      return;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // No user signed in, show login screen
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time expense data fetching with onSnapshot
  useEffect(() => {
    if (!user) return;

    setLoadingExpenses(true);
    
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const expensesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          // Sort by timestamp descending
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeB - timeA;
        });
        
        setExpenses(expensesData);
        setLoadingExpenses(false);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        showToast(`Error loading data: ${error.message}`, 'error');
        setLoadingExpenses(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Real-time income data fetching with onSnapshot
  useEffect(() => {
    if (!user) return;

    setLoadingIncomes(true);
    
    const q = query(
      collection(db, 'incomes'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const incomesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          // Sort by timestamp descending
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeB - timeA;
        });
        
        setIncomes(incomesData);
        setLoadingIncomes(false);
      },
      (error) => {
        console.error('Error fetching incomes:', error);
        setLoadingIncomes(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch user expense categories
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid),
      where('type', '==', 'expense')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const customCategories = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isCustom: true
        }));
        // Only show user's custom expense categories (no defaults)
        setExpenseCategories(customCategories);
      },
      (error) => {
        console.error('Error fetching expense categories:', error);
        setExpenseCategories([]);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch user income categories
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid),
      where('type', '==', 'income')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const customCategories = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isCustom: true
        }));
        // Only show user's custom income sources (no defaults)
        setIncomeCategories(customCategories);
      },
      (error) => {
        console.error('Error fetching income categories:', error);
        setIncomeCategories([]);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Category management functions
  const addCategory = async (categoryData) => {
    try {
      await addDoc(collection(db, 'categories'), {
        ...categoryData,
        userId: user.uid
      });
      showToast('Category added!', 'success');
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      showToast('Failed to add category', 'error');
      return false;
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      await updateDoc(doc(db, 'categories', categoryId), categoryData);
      showToast('Category updated!', 'success');
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('Failed to update category', 'error');
      return false;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      showToast('Category deleted!', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Firebase config error only when there's an actual config error
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Firebase Not Configured
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              To use this app, you need to set up Firebase:
            </p>
            <ol className="text-left text-sm text-yellow-700 dark:text-yellow-300 space-y-2 mb-4">
              <li>1. Create a Firebase project at console.firebase.google.com</li>
              <li>2. Enable Firestore Database</li>
              <li>3. Enable Google Authentication</li>
              <li>4. Create a <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">.env</code> file with your credentials</li>
            </ol>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              See <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">README.md</code> for detailed instructions.
            </p>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400">
            Error: {authError}
          </p>
        </div>
      </div>
    );
  }

  // Show login screen if no user
  if (!user) {
    return (
      <ThemeProvider>
        <LoginScreen onError={(error) => showToast(error, 'error')} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="app page-transition">
        {/* Toast Notifications */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}

        {currentPage === 'dashboard' && (
          <Dashboard 
            userId={user?.uid}
            user={user}
            expenses={expenses} 
            incomes={incomes}
            loadingExpenses={loadingExpenses} 
            loadingIncomes={loadingIncomes}
            showToast={showToast}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
          />
        )}
        {currentPage === 'history' && (
          <History 
            userId={user?.uid}
            user={user}
            expenses={expenses}
            incomes={incomes}
            showToast={showToast}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
          />
        )}
        {currentPage === 'analytics' && (
          <Analytics 
            userId={user?.uid}
            user={user}
            expenses={expenses}
            incomes={incomes}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
          />
        )}
        
        <BottomNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;

