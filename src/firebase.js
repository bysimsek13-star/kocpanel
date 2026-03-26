import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyTwHQhwCBZWdHuzJ_2EjVciwPs6qMCvk",
  authDomain: "kocpaneli.firebaseapp.com",
  projectId: "kocpaneli",
  storageBucket: "kocpaneli.firebasestorage.app",
  messagingSenderId: "12496447602",
  appId: "1:12496447602:web:175349e246c423a7d77aeb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;