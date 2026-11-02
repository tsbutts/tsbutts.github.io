"use strict";

import { auth, db } from "./firebase.js";
import { collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const form = document.getElementById("contactForm");
const spinner = document.getElementById("contactSpinner");
const submitBtn = document.getElementById("contactSubmit");
const statusBox = document.getElementById("contactStatus");
const errorBox = document.getElementById("contactError");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusBox.textContent = "";
  errorBox.textContent = "";

  const user = auth.currentUser;
  if (!user) {
    errorBox.textContent = "Please log in before sending a message.";
    return;
  }

  spinner.hidden = false;
  submitBtn.disabled = true;

  try {
    await addDoc(collection(db, "contacts"), {
      uid: user.uid,
      name: form.contactName.value.trim(),
      email: form.contactEmail.value.trim(),
      topic: form.contactTopic.value,
      message: form.contactMessage.value.trim(),
      createdAt: serverTimestamp()
    });
    statusBox.textContent = "Thank you! Your message was received and saved.";
    form.reset();
  } catch (error) {
    console.error(error);
    errorBox.textContent = "Sorry, your message could not be sent: " + error.message;
  } finally {
    spinner.hidden = true;
    submitBtn.disabled = false;
  }
});