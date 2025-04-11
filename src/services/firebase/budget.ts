
import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

// Budget and Expenses
export const getExpenses = async (userId: string) => {
  try {
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting expenses", error);
    return [];
  }
};

export const addExpense = async (userId: string, expense: any) => {
  try {
    const expensesCollection = collection(db, "expenses");
    
    // Make sure expense is an object before spreading
    const expenseData = expense && typeof expense === 'object' && !Array.isArray(expense) ? expense : {};
    
    const docRef = await addDoc(expensesCollection, {
      // Only spread if it's a valid object
      ...(typeof expenseData === 'object' ? expenseData : {}),
      userId,
      createdAt: serverTimestamp()
    });
    
    // Create a new object instead of spreading to avoid TypeScript error
    return { 
      id: docRef.id, 
      userId,
      ...(typeof expenseData === 'object' ? expenseData : {})
    };
  } catch (error) {
    console.error("Error adding expense", error);
    return null;
  }
};

export const updateExpense = async (expenseId: string, data: Record<string, any>) => {
  try {
    const expenseRef = doc(db, "expenses", expenseId);
    await updateDoc(expenseRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating expense", error);
    return false;
  }
};

export const deleteExpense = async (expenseId: string) => {
  try {
    const expenseRef = doc(db, "expenses", expenseId);
    await deleteDoc(expenseRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting expense", error);
    return false;
  }
};
