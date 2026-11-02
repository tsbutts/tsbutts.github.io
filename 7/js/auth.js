"use strict";

import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const $ = (id) => document.getElementById(id);

const dialog = $("authDialog");
const authBtn = $("authBtn");
const changePwBtn = $("changePwBtn");
const errorBox = $("authError");
const successBox = $("authSuccess");
const spinner = $("authSpinner");

const forms = {
  login: $("loginForm"),
  signup: $("signupForm"),
  password: $("changePwForm")
};

const TEXT = {
  login: ["Log in", "Log in to explore the collection."],
  signup: ["Sign up", "Create an account to explore the collection."],
  password: ["Change password", "Enter your current password, then choose a new one."]
};

const ERRORS = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "An account with that email already exists. Try logging in.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network problem. Check your connection and try again.",
  "auth/requires-recent-login": "Please log out and log in again, then retry."
};

let currentUser = null;

function isPublicPage() {
  const last = location.pathname.split("/").pop();
  return last === "" || last === "index" || last === "index.html";
}

function clearMessages() {
  errorBox.textContent = "";
  successBox.textContent = "";
}

function showForm(name) {
  Object.entries(forms).forEach(([key, form]) => {
    form.hidden = key !== name;
  });
  $("authTitle").textContent = TEXT[name][0];
  $("authHelp").textContent = TEXT[name][1];
  clearMessages();
}

function openDialog(name) {
  showForm(name);
  if (!dialog.open) {
    dialog.showModal();
  }
  forms[name].querySelector("input").focus();
}

function setBusy(isBusy) {
  spinner.hidden = !isBusy;
  dialog.querySelectorAll("form button").forEach((button) => {
    button.disabled = isBusy;
  });
}

// Runs an async action with a spinner and shows any error on the page.
// Returns true if it worked, false if it failed.
async function run(action) {
  clearMessages();
  setBusy(true);
  try {
    await action();
    return true;
  } catch (error) {
    console.error(error);
    errorBox.textContent = ERRORS[error.code] || "Something went wrong: " + error.message;
    return false;
  } finally {
    setBusy(false);
  }
}

// ---------- Open, close, switch forms ----------
authBtn.addEventListener("click", async () => {
  if (currentUser) {
    await run(() => signOut(auth));
  } else {
    openDialog("login");
  }
});

changePwBtn.addEventListener("click", () => openDialog("password"));
$("authClose").addEventListener("click", () => dialog.close());
$("showSignup").addEventListener("click", () => openDialog("signup"));
$("showLogin").addEventListener("click", () => openDialog("login"));

// "Start exploring" asks logged-out visitors to log in first.
document.querySelectorAll('a[href="explore.html"].btn').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!currentUser) {
      event.preventDefault();
      openDialog("login");
    }
  });
});

// ---------- Form submits ----------
forms.login.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ok = await run(() =>
    signInWithEmailAndPassword(auth, $("loginEmail").value.trim(), $("loginPassword").value)
  );
  if (ok) {
    forms.login.reset();
    dialog.close();
  }
});

forms.signup.addEventListener("submit", async (event) => {
  event.preventDefault();
  if ($("signupPassword").value !== $("signupConfirm").value) {
    errorBox.textContent = "The two passwords do not match.";
    return;
  }
  const ok = await run(() =>
    createUserWithEmailAndPassword(auth, $("signupEmail").value.trim(), $("signupPassword").value)
  );
  if (ok) {
    forms.signup.reset();
    dialog.close();
  }
});

forms.password.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ok = await run(async () => {
    const credential = EmailAuthProvider.credential(currentUser.email, $("currentPassword").value);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, $("newPassword").value);
  });
  if (ok) {
    forms.password.reset();
    successBox.textContent = "Your password was changed.";
  }
});

// ---------- React to login state ----------
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  document.body.classList.toggle("signed-in", Boolean(user));
  authBtn.textContent = user ? "Log out" : "Log in";
  changePwBtn.hidden = !user;

  if (!user && !isPublicPage()) {
    location.replace("index.html");
  }
});