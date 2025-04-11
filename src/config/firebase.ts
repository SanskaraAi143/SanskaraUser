
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvmK0BcXuEF0sF_4BjgKXzFNtKNgmsrkc",
  authDomain: "sanskara-ai-bf581.firebaseapp.com",
  projectId: "sanskara-ai-bf581",
  storageBucket: "sanskara-ai-bf581.firebasestorage.app",
  messagingSenderId: "916557366396",
  appId: "1:916557366396:web:9b19c3ed4ea6cc06af35f9",
  measurementId: "G-M0B97SBZFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
