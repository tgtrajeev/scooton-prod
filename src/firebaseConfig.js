import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCgkJwfKIAEW6mE-mQI-qVrg4-xz1_Z4KE",
  authDomain: "scootin-620c6.firebaseapp.com",
  projectId: "scootin-620c6",
  storageBucket: "scootin-620c6.firebasestorage.app",
  messagingSenderId: "268585781596",
  appId: "1:268585781596:web:6416f6ca75b228017a9999"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
