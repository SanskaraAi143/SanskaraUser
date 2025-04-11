
import { collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
  } catch (error) {
    console.error("Error getting chat history", error);
    return [];
  }
};
