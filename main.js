// -----------------------------
// Secure Hashing (WebCrypto)
// -----------------------------
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hashBuffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16))
    .reduce((a, b) => a + b.toString(16).padStart(2, "0"), "");
}

// -----------------------------
// Rate Limiting (client demo)
// -----------------------------
let attempts = 0;
let lockUntil = 0;

function canAttempt() {
  const now = Date.now();
  return now >= lockUntil;
}

function registerAttempt() {
  attempts++;
  if (attempts >= 5) {
    lockUntil = Date.now() + 30000; // 30 sec lock
    attempts = 0;
  }
}

// -----------------------------
// Local "Database"
// -----------------------------
function saveUser(email, salt, hash) {
  localStorage.setItem("user:" + email, JSON.stringify({ salt, hash }));
}

function getUser(email) {
  const data = localStorage.getItem("user:" + email);
  return data ? JSON.parse(data) : null;
}

// -----------------------------
// Register Logic
// -----------------------------
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("regEmail").value;
    const pwd = document.getElementById("regPassword").value;

    const salt = generateSalt();
    const hash = await hashPassword(pwd, salt);

    saveUser(email, salt, hash);

    document.getElementById("regStatus").textContent = "Account created!";
  });
}

// -----------------------------
// Login Logic
// -----------------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!canAttempt()) {
      document.getElementById("loginStatus").textContent =
        "Too many attempts. Try again later.";
      return;
    }

    registerAttempt();

    const email = document.getElementById("loginEmail").value;
    const pwd = document.getElementById("loginPassword").value;

    const user = getUser(email);
    if (!user) {
      document.getElementById("loginStatus").textContent = "Invalid credentials";
      return;
    }

    const hash = await hashPassword(pwd, user.salt);

    if (hash === user.hash) {
      document.getElementById("loginStatus").style.color = "#4dff88";
      document.getElementById("loginStatus").textContent = "Login successful";
    } else {
      document.getElementById("loginStatus").textContent = "Invalid credentials";
    }
  });
}
