import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';

const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch {}
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "placeholder-api-key"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "placeholder-auth-domain"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "placeholder-project-id"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "placeholder-storage-bucket"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "placeholder-messaging-sender-id"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "placeholder-app-id"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "placeholder-measurement-id")
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let messagingInstance: Messaging | null = null;
const getMessagingInstance = async () => {
  if (messagingInstance) return messagingInstance;
  try {
    const supported = await isSupported();
    if (supported) {
      messagingInstance = getMessaging(app);
      return messagingInstance;
    }
  } catch (err) {
    console.error("Error checking messaging support:", err);
  }
  console.warn("Firebase Messaging is not supported in this browser.");
  return null;
};

export { app, auth, db, storage, getMessagingInstance };
