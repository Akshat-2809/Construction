import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBX_rLAwNM0UTjBmqxdlkGE9uQCCm1UNxg",
  authDomain: "machine-marketplace-3c3c7.firebaseapp.com",
  projectId: "machine-marketplace-3c3c7",
  storageBucket: "machine-marketplace-3c3c7.firebasestorage.app",
  messagingSenderId: "186951422790",
  appId: "1:186951422790:web:92769e52180adaaacacb47",
  measurementId: "G-HF2K7BHM72",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);