
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

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
