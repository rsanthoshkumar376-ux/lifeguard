import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
// import { app } from '../config/firebase'; // Assume firebase is configured

// Mock setup to satisfy TS since we don't have the actual firebase config file
const app = {} as any; 
const db = getFirestore(app);

// Your web app's Firebase configuration VAPID key
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';

export const requestNotificationPermission = async (userId: string): Promise<boolean> => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log('Push notifications are not supported in this browser.');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getFcmToken();
      if (token) {
        await saveFcmToken(userId, token);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const saveFcmToken = async (userId: string, token: string): Promise<void> => {
  try {
    const tokenRef = doc(db, 'fcmTokens', token);
    await setDoc(tokenRef, {
      userId,
      token,
      platform: 'web',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return () => {}; // Return no-op unsubscribe
  }
};
