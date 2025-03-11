// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCgkJwfKIAEW6mE-mQI-qVrg4-xz1_Z4KE",
  authDomain: "scootin-620c6.firebaseapp.com",
  projectId: "scootin-620c6",
  storageBucket: "scootin-620c6.firebasestorage.app",
  messagingSenderId: "268585781596",
  appId: "1:268585781596:web:6416f6ca75b228017a9999"
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