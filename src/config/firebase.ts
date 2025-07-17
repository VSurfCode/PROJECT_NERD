// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxY4KTVmjSAQE-msKOj8eq3-yx64bB1vc",
  authDomain: "project-nerd-e5493.firebaseapp.com",
  projectId: "project-nerd-e5493",
  storageBucket: "project-nerd-e5493.appspot.com",
  messagingSenderId: "1034998375300",
  appId: "1:1034998375300:web:3c0c7b380e3b72222d73d1",
  measurementId: "G-1TPJJ3YS2M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db }; 