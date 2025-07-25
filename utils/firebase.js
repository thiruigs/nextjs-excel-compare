// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD6AFBW5y9rltVg7TKDMzaEBhMjlOZMyBQ",
  authDomain: "excel-compare-check.firebaseapp.com",
  projectId: "excel-compare-check",
  storageBucket: "excel-compare-check.firebasestorage.app",
  messagingSenderId: "433842401178",
  appId: "1:433842401178:web:4a3c23df8f920819225423"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
