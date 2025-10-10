// Firebase client initialization for the React app
// Uses CRA env variables (REACT_APP_*) so you don't hardcode secrets in source.
// Add the keys to your .env and restart the dev server.

import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Guard against re-initializing during hot reload
export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export default firebaseApp;
