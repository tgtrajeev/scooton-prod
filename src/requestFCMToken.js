import { messaging, getToken } from "./firebaseConfig";

const requestFCMToken = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BJcfP_nr6yHTQ4Hw8UhHPfvvlVsVHb-s-Nj-sW1L5f_VLWDvIHxnXh-Y6OFKHA2jYg0Mobsik2SAlo7-y12IcjY", // Replace with your VAPID Key
      });

      if (token) {
        console.log("FCM Token:", token);
        // Send the token to the backend
        await sendTokenToServer(userId, token);
      } else {
        console.log("No FCM token available");
      }
    } else {
      console.log("Notification permission denied");
    }
  } catch (error) {
    console.error("Error getting FCM Token:", error);
  }
};

// Send the token to your backend
const sendTokenToServer = async (userId, token) => {
  try {
    const usertoken = localStorage.getItem("jwtToken");
    await fetch(
      `https://scootin-300701.el.r.appspot.com/notification/admin/${userId}/update-fcm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usertoken}`,
        },
        body: JSON.stringify({ fcmID: token }),
      }
    );
    console.log("FCM Token saved for user:", userId);
    //localStorage.setItem("notficationDone", "true");
  } catch (error) {
    console.error("Error saving FCM Token:", error);
  }
};

export default requestFCMToken;
