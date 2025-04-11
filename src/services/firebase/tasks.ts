
import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

// Tasks
export const getTasks = async (userId: string) => {
  try {
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting tasks", error);
    return [];
  }
};

export const addTask = async (userId: string, task: any) => {
  try {
    const tasksCollection = collection(db, "tasks");
    
    // Make sure task is an object before spreading
    const taskData = task && typeof task === 'object' && !Array.isArray(task) ? task : {};
    
    const docRef = await addDoc(tasksCollection, {
      ...(typeof taskData === 'object' ? taskData : {}),
      userId,
      completed: false,
      createdAt: serverTimestamp()
    });
    
    // Create a new object instead of spreading to avoid TypeScript error
    return { 
      id: docRef.id, 
      userId, 
      completed: false,
      ...(typeof taskData === 'object' ? taskData : {})
    };
  } catch (error) {
    console.error("Error adding task", error);
    return null;
  }
};

export const updateTask = async (taskId: string, data: Record<string, any>) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating task", error);
    return false;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting task", error);
    return false;
  }
};
