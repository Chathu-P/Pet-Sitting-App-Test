import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration copied from your generated config
// If you prefer, move these values to env or app.json later.
const firebaseConfig = {
  apiKey: "AIzaSyArn-AbogyaGVizA71NZlfmtIzD0-mwOtY",
  authDomain: "pet-sitting-app-cc7e7.firebaseapp.com",
  projectId: "pet-sitting-app-cc7e7",
  storageBucket: "pet-sitting-app-cc7e7.firebasestorage.app",
  messagingSenderId: "891202234608",
  appId: "1:891202234608:web:66ebe17f295b7c92be7a35",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
// React Native + Expo: force long polling for Firestore reliability
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);
export default app;
