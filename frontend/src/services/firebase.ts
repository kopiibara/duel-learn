// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtZC2Cm7D1kynMAlTL-_4g2-8VoE90LKI",
  authDomain: "duel-learn.firebaseapp.com",
  projectId: "duel-learn",
  storageBucket: "duel-learn.firebasestorage.app",
  messagingSenderId: "255993502199",
  appId: "1:255993502199:web:f758d82c6bb334577076f2",
  measurementId: "G-RTRW795R9H",
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
