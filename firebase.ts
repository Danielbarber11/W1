import firebase from "firebase/compat/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDu9xJlDhzA5TfBsakrQj21Ybupjcu7KDo",
  authDomain: "verdantconnect-wp8dj.firebaseapp.com",
  databaseURL: "https://verdantconnect-wp8dj-default-rtdb.firebaseio.com",
  projectId: "verdantconnect-wp8dj",
  storageBucket: "verdantconnect-wp8dj.firebasestorage.app",
  messagingSenderId: "530048230107",
  appId: "1:530048230107:web:e400c941adc4d4f829e2fe"
};

// Fix: Use compat initialization to resolve "no exported member initializeApp" error in some environments
const app = firebase.initializeApp(firebaseConfig);

// Fix: Cast app to any to bridge compat App type with modular SDK functions
export const auth = getAuth(app as any);
export const database = getDatabase(app as any);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();

// Setting the specific client ID for Google Cloud project linkage
googleProvider.setCustomParameters({
  'client_id': "1029411846084-2jidcvnmiumb0ajqdm3fcot1rvmaldr6.apps.googleusercontent.com"
});

export const GOOGLE_CLIENT_ID = "1029411846084-2jidcvnmiumb0ajqdm3fcot1rvmaldr6.apps.googleusercontent.com";