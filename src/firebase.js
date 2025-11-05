import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAMU2rBdqY8ElAknum6bKHqxqWNlf-roFI",
  authDomain: "poker-charts-76b65.firebaseapp.com",
  projectId: "poker-charts-76b65",
  storageBucket: "poker-charts-76b65.firebasestorage.app",
  messagingSenderId: "1003890918836",
  appId: "1:1003890918836:web:74a22ca014693d4df59ee1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);