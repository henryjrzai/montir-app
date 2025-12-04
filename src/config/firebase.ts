/**
 * Firebase Configuration
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDe7jVVP5fN2nkaRAC3lKqPXBRLWfvRN0A",
  authDomain: "montir-app-chat.firebaseapp.com",
  projectId: "montir-app-chat",
  storageBucket: "montir-app-chat.firebasestorage.app",
  messagingSenderId: "387786074976",
  appId: "1:387786074976:web:ac8f93fbb83b206b2acc05",
  measurementId: "G-3EKJWMJTB8"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
