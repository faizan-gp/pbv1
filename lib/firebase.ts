import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDm_tXAVt3Ge8hbuyz8MI8nYoTIde6ihA0",
    authDomain: "printbrawl.firebaseapp.com",
    projectId: "printbrawl",
    storageBucket: "printbrawl.firebasestorage.app",
    messagingSenderId: "550337620836",
    appId: "1:550337620836:web:64b9c4b29a60177532a871",
    measurementId: "G-WFEL1PLWME"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize analytics only on client side
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const db = getFirestore(app);

export { app, analytics, db };
