import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPJ0kJ37VRcnbRkVLwdNnVx-O59cJ4Ngo",
  authDomain: "authenticationforwebdev.firebaseapp.com",
  projectId: "authenticationforwebdev",
  storageBucket: "authenticationforwebdev.firebasestorage.app",
  messagingSenderId: "849564004012",
  appId: "1:849564004012:web:c202e05efc3035cf95b909"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export function waitForUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}