import { auth, db } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let userId = null;

// ----------------------
// REFERRAL DETECTION
// ----------------------
let referrerId = null;

const params = new URLSearchParams(window.location.search);
if (params.get("ref")) {
  referrerId = params.get("ref");
}

// ----------------------
// MODAL CONTROL
// ----------------------
window.openLogin = function () {
  document.getElementById("loginModal").style.display = "block";
};

window.closeLogin = function () {
  document.getElementById("loginModal").style.display = "none";
};

// ----------------------
// GOOGLE LOGIN
// ----------------------
window.googleLogin = async function () {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    userId = user.uid;

    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    // 🆕 NEW USER
    if (!snap.exists()) {
      await setDoc(userRef, {
        points: 0,
        referrals: 0,
        tasksCompleted: []
      });

      // 🎯 REFERRAL REWARD SYSTEM
      if (referrerId && referrerId !== userId) {
        const refUser = doc(db, "users", referrerId);
        const refSnap = await getDoc(refUser);

        if (refSnap.exists()) {
          const refData = refSnap.data();

          await updateDoc(refUser, {
            points: refData.points + 100,
            referrals: (refData.referrals || 0) + 1
          });
        }
      }
    }

    document.getElementById("app").style.display = "block";
    closeLogin();

    loadUserData();
    generateRef();
    loadLeaderboard();

  } catch (err) {
    alert(err.message);
  }
};

// ----------------------
// LOAD USER DATA
// ----------------------
async function loadUserData() {
  const snap = await getDoc(doc(db, "users", userId));
  if (snap.exists()) {
    const data = snap.data();

    document.getElementById("points").innerText = data.points || 0;
    document.getElementById("referrals").innerText = data.referrals || 0;
  }
}

// ----------------------
// TASK SYSTEM
// ----------------------
window.completeTask = async function (task, reward) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  const data = snap.data();

  if (data.tasksCompleted.includes(task)) {
    alert("Already completed!");
    return;
  }

  const newPoints = data.points + reward;

  await updateDoc(ref, {
    points: newPoints,
    tasksCompleted: [...data.tasksCompleted, task]
  });

  document.getElementById("points").innerText = newPoints;
  loadLeaderboard();
};

// ----------------------
// REFERRAL LINK
// ----------------------
function generateRef() {
  document.getElementById("refLink").value =
    window.location.origin + "?ref=" + userId;
}

window.copyRef = function () {
  const input = document.getElementById("refLink");
  input.select();
  document.execCommand("copy");
  alert("Referral link copied!");
};

// ----------------------
// LEADERBOARD
// ----------------------
async function loadLeaderboard() {
  const q = query(
    collection(db, "users"),
    orderBy("points", "desc"),
    limit(10)
  );

  const snapshot = await getDocs(q);

  let html = "";
  let rank = 1;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    html += `
      <div class="leader">
        #${rank} — ${data.points} ZP
      </div>
    `;

    rank++;
  });

  document.getElementById("leaderboard").innerHTML = html;
}

// AUTO REFRESH LEADERBOARD
setInterval(loadLeaderboard, 10000);

// ----------------------
// COUNTDOWN
// ----------------------
const end = new Date();
end.setDate(end.getDate() + 30);

setInterval(() => {
  const now = new Date().getTime();
  const diff = end - now;

  if (diff <= 0) return;

  document.getElementById("days").innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById("hours").innerText = Math.floor((diff / (1000 * 60 * 60)) % 24);
  document.getElementById("minutes").innerText = Math.floor((diff / (1000 * 60)) % 60);
  document.getElementById("seconds").innerText = Math.floor((diff / 1000) % 60);
}, 1000);