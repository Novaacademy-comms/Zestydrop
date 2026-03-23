// LOAD DATA
let points = localStorage.getItem("points") || 0;
let referrals = localStorage.getItem("referrals") || 0;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// DISPLAY DATA
function loadUI() {
  document.getElementById("points").innerText = points;
  document.getElementById("referrals").innerText = referrals;
}

loadUI();

// START APP
function startApp() {
  document.getElementById("app").style.display = "block";

  // Generate referral link
  const id = localStorage.getItem("userId") || generateId();
  localStorage.setItem("userId", id);

  document.getElementById("refLink").value =
    window.location.href.split("?")[0] + "?ref=" + id;
}

// GENERATE ID
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// COMPLETE TASK
function completeTask(name, reward) {
  if (tasks.includes(name)) {
    alert("Already done!");
    return;
  }

  tasks.push(name);
  points += reward;

  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("points", points);

  loadUI();
  alert("+" + reward + " ZP 🎉");
}

// COPY LINK
function copyRef() {
  const input = document.getElementById("refLink");
  input.select();
  document.execCommand("copy");
  alert("Copied!");
}

// FAKE REFERRAL (TEST)
function fakeReferral() {
  referrals += 1;
  points += 100;

  localStorage.setItem("referrals", referrals);
  localStorage.setItem("points", points);

  loadUI();
}

// COUNTDOWN
const target = new Date("2026-06-01").getTime();

setInterval(() => {
  const now = new Date().getTime();
  const diff = target - now;

  document.getElementById("days").innerText = Math.floor(diff / (1000*60*60*24));
  document.getElementById("hours").innerText = Math.floor((diff/(1000*60*60))%24);
  document.getElementById("minutes").innerText = Math.floor((diff/(1000*60))%60);
  document.getElementById("seconds").innerText = Math.floor((diff/1000)%60);
}, 1000);