
import { auth, db, storage } from "../config/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp,
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { User } from "firebase/auth";

// User profiles
export const createUserProfile = async (user: User, additionalData?: Record<string, any>) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, displayName, photoURL } = user;
    const createdAt = serverTimestamp();

    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        email,
        photoURL,
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user profile", error);
    }
  }

  return getUserProfile(user.uid);
};

export const getUserProfile = async (userId: string) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user profile", error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Record<string, any>) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile", error);
    return false;
  }
};

// Wedding details
export const getWeddingDetails = async (userId: string) => {
  try {
    const weddingRef = doc(db, "weddings", userId);
    const snapshot = await getDoc(weddingRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting wedding details", error);
    return null;
  }
};

export const updateWeddingDetails = async (userId: string, data: Record<string, any>) => {
  try {
    const weddingRef = doc(db, "weddings", userId);
    const snapshot = await getDoc(weddingRef);
    
    if (snapshot.exists()) {
      await updateDoc(weddingRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(weddingRef, {
        userId,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating wedding details", error);
    return false;
  }
};

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

export const addTask = async (userId: string, task: Record<string, any>) => {
  try {
    const tasksCollection = collection(db, "tasks");
    const docRef = await addDoc(tasksCollection, {
      ...task,
      userId,
      completed: false,
      createdAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...task, userId, completed: false };
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

// Events
export const getEvents = async (userId: string) => {
  try {
    const q = query(
      collection(db, "events"),
      where("userId", "==", userId),
      orderBy("date", "asc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting events", error);
    return [];
  }
};

export const addEvent = async (userId: string, event: Record<string, any>) => {
  try {
    const eventsCollection = collection(db, "events");
    const docRef = await addDoc(eventsCollection, {
      ...event,
      userId,
      createdAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...event, userId };
  } catch (error) {
    console.error("Error adding event", error);
    return null;
  }
};

export const updateEvent = async (eventId: string, data: Record<string, any>) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating event", error);
    return false;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting event", error);
    return false;
  }
};

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

export const addExpense = async (userId: string, expense: Record<string, any>) => {
  try {
    const expensesCollection = collection(db, "expenses");
    const docRef = await addDoc(expensesCollection, {
      ...expense,
      userId,
      createdAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...expense, userId };
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

// Image Upload for Mood Board
export const uploadImage = async (userId: string, file: File, category: string) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `moodboard/${userId}/${fileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Save reference in Firestore
    const moodboardCollection = collection(db, "moodboard");
    const docRef = await addDoc(moodboardCollection, {
      userId,
      url: downloadURL,
      category,
      fileName,
      createdAt: serverTimestamp()
    });
    
    return { id: docRef.id, url: downloadURL, category, fileName };
  } catch (error) {
    console.error("Error uploading image", error);
    return null;
  }
};

export const getMoodboardImages = async (userId: string, category?: string) => {
  try {
    let q;
    
    if (category) {
      q = query(
        collection(db, "moodboard"),
        where("userId", "==", userId),
        where("category", "==", category)
      );
    } else {
      q = query(
        collection(db, "moodboard"),
        where("userId", "==", userId)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting moodboard images", error);
    return [];
  }
};

export const deleteMoodboardImage = async (userId: string, imageId: string, fileName: string) => {
  try {
    // Delete from Firestore
    const imageRef = doc(db, "moodboard", imageId);
    await deleteDoc(imageRef);
    
    // Delete from Storage
    const storageRef = ref(storage, `moodboard/${userId}/${fileName}`);
    await deleteObject(storageRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting moodboard image", error);
    return false;
  }
};

// Chat History
export const saveChatMessage = async (userId: string, message: string, sender: 'user' | 'ai', category?: string) => {
  try {
    const chatCollection = collection(db, "chats");
    const docRef = await addDoc(chatCollection, {
      userId,
      message,
      sender,
      category: category || 'general',
      timestamp: serverTimestamp()
    });
    
    return { id: docRef.id, message, sender, category: category || 'general' };
  } catch (error) {
    console.error("Error saving chat message", error);
    return null;
  }
};

export const getChatHistory = async (userId: string, category?: string, limitCount = 50) => {
  try {
    let q;
    
    if (category) {
      q = query(
        collection(db, "chats"),
        where("userId", "==", userId),
        where("category", "==", category),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, "chats"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    // Return in chronological order
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
  } catch (error) {
    console.error("Error getting chat history", error);
    return [];
  }
};
