
import { collection, doc, addDoc, deleteDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./config";

// Define interface for moodboard document
interface MoodboardDocument {
  userId: string;
  url: string;
  category: string;
  fileName: string;
  createdAt: any; // FirebaseFirestore.Timestamp
}

// Image Upload for Mood Board
export const uploadImage = async (userId: string, file: File, category: string) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `moodboard/${userId}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
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
    // Create new objects for each document instead of spreading
    return snapshot.docs.map(doc => {
      const data = doc.data() as MoodboardDocument;
      return {
        id: doc.id,
        userId: data.userId,
        url: data.url,
        category: data.category,
        fileName: data.fileName,
        createdAt: data.createdAt
      };
    });
  } catch (error) {
    console.error("Error getting moodboard images", error);
    return [];
  }
};

export const deleteMoodboardImage = async (userId: string, imageId: string, fileName: string) => {
  try {
    const imageRef = doc(db, "moodboard", imageId);
    await deleteDoc(imageRef);
    
    const storageRef = ref(storage, `moodboard/${userId}/${fileName}`);
    await deleteObject(storageRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting moodboard image", error);
    return false;
  }
};
