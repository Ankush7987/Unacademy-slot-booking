// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2kYWNMRvHGVjOhwFzlq7qkBzrnuGmvb8",
  authDomain: "unacademy-4ef18.firebaseapp.com",
  projectId: "unacademy-4ef18",
  storageBucket: "unacademy-4ef18.firebasestorage.app",
  messagingSenderId: "522271240129",
  appId: "1:522271240129:web:2ef3215d738b900e86c940",
  measurementId: "G-1DSGPWV6CS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); // Database instance export kar rahe hain