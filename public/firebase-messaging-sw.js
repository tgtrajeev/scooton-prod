// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBGvEB_pxl_Wh_8mEiH8TzRmjOMpi6RtwE",
  authDomain: "scooton-debug.firebaseapp.com",
  projectId: "scooton-debug",
  storageBucket: "scooton-debug.firebasestorage.app",
  messagingSenderId: "767080447811",
  appId: "1:767080447811:web:c6a3ec4edd3f2f300a39f6",
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