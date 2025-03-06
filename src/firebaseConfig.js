import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBGvEB_pxl_Wh_8mEiH8TzRmjOMpi6RtwE",
  authDomain: "scooton-debug.firebaseapp.com",
  projectId: "scooton-debug",
  storageBucket: "scooton-debug.firebasestorage.app",
  messagingSenderId: "767080447811",
  appId: "1:767080447811:web:c6a3ec4edd3f2f300a39f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
