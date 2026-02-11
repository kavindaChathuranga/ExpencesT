import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from './utils/firebase';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Analytics from './pages/Analytics';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authError, setAuthError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
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
        // Auto sign in anonymously if no user
        signInAnonymously(auth)
          .then((result) => {
            setUser(result.user);
          })
          .catch((error) => {
            console.error('Error signing in:', error);
            setAuthError(error.message);
          });
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

  if (authError || !user) {
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
              <li>3. Enable Anonymous Authentication</li>
              <li>4. Create a <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">.env</code> file with your credentials</li>
            </ol>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              See <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">README.md</code> for detailed instructions.
            </p>
          </div>
          {authError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Error: {authError}
            </p>
          )}
        </div>
      </div>
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
          <Dashboard userId={user?.uid} expenses={expenses} loadingExpenses={loadingExpenses} showToast={showToast} />
        )}
        {currentPage === 'history' && (
          <History userId={user?.uid} showToast={showToast} />
        )}
        {currentPage === 'analytics' && (
          <Analytics userId={user?.uid} />
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

