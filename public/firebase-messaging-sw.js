// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');
import { apiKey, authDomain, projectId, storageBucket, messagingSenderId,appId } from "../src/firebasekeys";

const firebaseConfig = {
  apiKey: `${apiKey}`,
  authDomain: `${authDomain}`,
  projectId: `${projectId}`,
  storageBucket:`${storageBucket}`,
  messagingSenderId:`${messagingSenderId}`,
  appId: `${appId}`,
};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
// Customize background notification handling here
messaging.onBackgroundMessage((payload) => {
  //console.log('Background Message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});