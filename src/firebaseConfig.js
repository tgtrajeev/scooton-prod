import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } from "./firebasekeys";

const firebaseConfig = {
  apiKey: `${apiKey}`,
  authDomain: `${authDomain}`,
  projectId: `${projectId}`,
  storageBucket: `${storageBucket}`,
  messagingSenderId: `${messagingSenderId}`,
  appId: `${appId}`,
}

console.log("apiKey",apiKey)
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
