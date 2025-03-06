import { messaging, getToken } from "./firebaseConfig";

const requestFCMToken = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BLZ7kya0uWE7w3PN1zgT3JG_swrSdWfX5g5PAaXhuAXXCldFtGMkv2TDDcmB7ESCv3A7IpW9W-wSpTBJJ76mHCY", // Replace with your VAPID Key
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
      `https://scooton-api-dev.el.r.appspot.com/notification/admin/${userId}/update-fcm`,
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
