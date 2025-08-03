import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDnplSISjEEntuWKmyDejq-Ai5kBhzS3kg",
    authDomain: "petloop-35f6b.firebaseapp.com",
    projectId: "petloop-35f6b",
    storageBucket: "petloop-35f6b.firebasestorage.app",
    messagingSenderId: "988393931648",
    appId: "1:988393931648:web:3dbf449a6306334b63b765",
    measurementId: "G-XDRZH010HN"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)