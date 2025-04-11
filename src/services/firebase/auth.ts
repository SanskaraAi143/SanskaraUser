
import { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

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
