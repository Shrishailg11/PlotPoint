// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "plotpoint-8429d.firebaseapp.com",
  projectId: "plotpoint-8429d",
  storageBucket: "plotpoint-8429d.firebasestorage.app",
  messagingSenderId: "657681650373",
  appId: "1:657681650373:web:b41c23da375a48867856ac"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);