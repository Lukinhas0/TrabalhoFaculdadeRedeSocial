import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCSwBWoqf4cyDOHVQKqC-8WqZmsmQuS4ZM",
  authDomain: "appredesocial-68b3e.firebaseapp.com",
  databaseURL: "https://appredesocial-68b3e-default-rtdb.firebaseio.com",
  projectId: "appredesocial-68b3e",
  storageBucket: "appredesocial-68b3e.appspot.com",
  messagingSenderId: "580700391633",
  appId: "1:580700391633:web:1f6a1030d662c0f4a4ddf0",
  measurementId: "G-GHS9RRDNTX"
};


const app = initializeApp(firebaseConfig);
export default app