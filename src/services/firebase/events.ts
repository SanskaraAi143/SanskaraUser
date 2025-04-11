
import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

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
    // Create a new object explicitly instead of spreading
    const eventData = event && typeof event === 'object' && !Array.isArray(event) ? event : {};
    
    const docRef = await addDoc(eventsCollection, {
      // Only spread if it's a valid object
      ...(typeof eventData === 'object' ? eventData : {}),
      userId,
      createdAt: serverTimestamp()
    });
    
    // Create a new object with specific properties instead of spreading
    return { 
      id: docRef.id, 
      userId,
      ...(typeof eventData === 'object' ? eventData : {})
    };
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
