/* ── FIREBASE CONFIG ───────────────────────────────────────────
   Compat SDK — працює без import/export, підходить для vanilla JS.
   ────────────────────────────────────────────────────────────── */
var firebaseConfig = {
  apiKey:            "AIzaSyCHnj2H-UCovH3KCmQAuHonVAZx3Dg7Cgw",
  authDomain:        "autodream-ec3ea.firebaseapp.com",
  projectId:         "autodream-ec3ea",
  storageBucket:     "autodream-ec3ea.firebasestorage.app",
  messagingSenderId: "57199596968",
  appId:             "1:57199596968:web:d6f0848330af618b67b99d"
};

firebase.initializeApp(firebaseConfig);
var db      = firebase.firestore();
var auth    = (typeof firebase.auth === "function") ? firebase.auth() : null;
var storage = (typeof firebase.storage === "function") ? firebase.storage() : null;

window.db = db;
window.auth = auth;
window.storage = storage;
