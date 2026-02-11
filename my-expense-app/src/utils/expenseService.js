import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Add a new expense to Firestore
 * @param {Object} expense - Expense data
 * @returns {Promise<string>} - Document ID
 */
export const addExpense = async (expense) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expense,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

/**
 * Get expenses for a user within a date range
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Array of expenses
 */
export const getExpenses = async (userId, startDate, endDate) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

/**
 * Delete an expense
 * @param {string} expenseId - Expense document ID
 * @returns {Promise<void>}
 */
export const deleteExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Get expense suggestions based on category history
 * @param {string} userId - User ID
 * @param {string} category - Category to get suggestions for
 * @param {number} limit - Number of suggestions (default: 5)
 * @returns {Promise<Array>} - Array of unique reasons
 */
export const getExpenseSuggestions = async (userId, category, limit = 5) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reasons = [...new Set(querySnapshot.docs.map(doc => doc.data().reason))];
    return reasons.slice(0, limit);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
};

/**
 * Calculate total expenses for a period
 * @param {Array} expenses - Array of expense objects
 * @returns {number} - Total amount
 */
export const calculateTotal = (expenses) => {
  return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
};

/**
 * Group expenses by category
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} - Object with categories as keys and totals as values
 */
export const groupByCategory = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});
};

/**
 * Group expenses by day
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} - Object with days as keys and totals as values
 */
export const groupByDay = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const date = expense.timestamp.toDate();
    const day = date.getDate();
    acc[day] = (acc[day] || 0) + expense.amount;
    return acc;
  }, {});
};
