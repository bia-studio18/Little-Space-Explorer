// ======================
// LITTLE SPACE EXPLORER
// 20 Levels per Mode + Realistic Planets + Sounds
// ======================

// ---------- SOUND ENGINE ----------
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function playTone(freq, duration, type = "sine", volume = 0.15) {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}
function soundClick() { playTone(600, 0.08, "sine", 0.1); }
function soundCorrect() {
  playTone(520, 0.1, "sine", 0.12);
  setTimeout(() => playTone(720, 0.15, "sine", 0.12), 100);
  setTimeout(() => playTone(920, 0.2, "sine", 0.1), 220);
}
function soundWrong() { playTone(200, 0.2, "sawtooth", 0.08); }
function soundUnlock() {
  playTone(400, 0.12, "sine", 0.12);
  setTimeout(() => playTone(600, 0.12, "sine", 0.12), 120);
  setTimeout(() => playTone(800, 0.12, "sine", 0.12), 240);
  setTimeout(() => playTone(1000, 0.25, "sine", 0.15), 360);
}
function soundLevelUp() {
  playTone(500, 0.1, "sine", 0.12);
  setTimeout(() => playTone(700, 0.1, "sine", 0.12), 100);
  setTimeout(() => playTone(900, 0.1, "sine", 0.12), 200);
  setTimeout(() => playTone(1100, 0.3, "sine", 0.15), 300);
}
function soundMatch() {
  playTone(660, 0.1, "triangle", 0.12);
  setTimeout(() => playTone(880, 0.15, "triangle", 0.1), 100);
}
function soundLaunch() {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  } catch (e) {}
}

// ---------- STARS BACKGROUND ----------
function createStars() {
  const container = document.getElementById("stars");
  for (let i = 0; i < 60; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 3 + 1;
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 2 + "s";
    container.appendChild(star);
  }
}

// ---------- PROGRESS SAVE ----------
const NEEDED = 3; // correct answers to advance a level

let progress = {
  colors: { level: 1, correct: 0 },
  stars:  { level: 1, correct: 0 },
  match:  { level: 1, correct: 0 },
  rocket: { level: 1, correct: 0 },
  unlocked: { colors: true, stars: false, match: false, rocket: false }
};

try {
  const saved = localStorage.getItem("spaceExplorerProgress");
  if (saved) progress = JSON.parse(saved);
} catch (e) {}

function save() {
  try { localStorage.setItem("spaceExplorerProgress", JSON.stringify(progress)); } catch (e) {}
}

// ---------- HOME UI ----------
function updateHomeUI() {
  const modes = ["colors", "stars", "match", "rocket"];
  modes.forEach((mode) => {
    const btn = document.getElementById("btn-" + mode);
    const lock = document.getElementById("lock-" + mode);
    const badge = document.getElementById("badge-" + mode);

    if (progress.unlocked[mode]) {
      btn.classList.remove("locked");
      if (lock) lock.style.display = "none";
      if (badge) {
        badge.classList.remove("hidden");
        badge.textContent = "Lv." + progress[mode].level;
      }
    } else {
      btn.classList.add("locked");
      if (lock) lock.style.display = "inline";
      if (badge) badge.classList.add("hidden");
    }
  });

  const p = document.getElementById("progress-text");
  if (!progress.unlocked.stars) {
    p.textContent = `Finish Level 5 in Color Planets to unlock Count Stars! (now Lv.${progress.colors.level})`;
  } else if (!progress.unlocked.match) {
    p.textContent = `Finish Level 5 in Count Stars to unlock Planet Match! (now Lv.${progress.stars.level})`;
  } else if (!progress.unlocked.rocket) {
    p.textContent = `Finish Level 5 in Planet Match to unlock Build Rocket! (now Lv.${progress.match.level})`;
  } else {
    p.textContent = "🎉 All modes unlocked! Keep playing to reach Level 20!";
  }
}

function showUnlockPopup(title, desc) {
  soundUnlock();
  document.getElementById("unlock-title").textContent = title;
  document.getElementById("unlock-desc").textContent = desc;
  document.getElementById("unlock-popup").classList.add("show");
}

document.getElementById("unlock-ok").addEventListener("click", () => {
  soundClick();
  document.getElementById("unlock-popup").classList.remove("show");
});

// Check mode unlocks (after level 5 of previous)
function checkModeUnlocks() {
  if (progress.colors.level >= 5 && !progress.unlocked.stars) {
    progress.unlocked.stars = true;
    save();
    showUnlockPopup("New Game Unlocked!", "Count Stars is now open!");
  }
  if (progress.stars.level >= 5 && !progress.unlocked.match) {
    progress.unlocked.match = true;
    save();
    showUnlockPopup("New Game Unlocked!", "Planet Match is now open!");
  }
  if (progress.match.level >= 5 && !progress.unlocked.rocket) {
    progress.unlocked.rocket = true;
    save();
    showUnlockPopup("New Game Unlocked!", "Build Rocket is now open!");
  }
}

// ---------- SCREEN NAV ----------
const screens = {
  home: document.getElementById("home-screen"),
  colors: document.getElementById("colors-screen"),
  stars: document.getElementById("stars-screen"),
  match: document.getElementById("match-screen"),
  rocket: document.getElementById("rocket-screen"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
  if (name === "home") updateHomeUI();
}

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    if (!progress.unlocked[mode]) { soundWrong(); return; }
    soundClick();
    showScreen(mode);
    if (mode === "colors") startColorGame();
    if (mode === "stars") startStarsGame();
    if (mode === "match") startMatchGame();
    if (mode === "rocket") startRocketBuilder();
  });
});

document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => { soundClick(); showScreen("home"); });
});

// ======================
// 1. COLOR PLANETS (20 levels)
// ======================
const PLANET_COLORS = [
  { name: "Red",    hex: "#e74c3c", ring: false },
  { name: "Blue",   hex: "#3498db", ring: false },
  { name: "Green",  hex: "#2ecc71", ring: false },
  { name: "Yellow", hex: "#f1c40f", ring: false },
  { name: "Purple", hex: "#9b59b6", ring: true  },
  { name: "Orange", hex: "#e67e22", ring: false },
  { name: "Pink",   hex: "#e84393", ring: false },
  { name: "Teal",   hex: "#1abc9c", ring: true  },
];

function startColorGame() {
  document.getElementById("color-level").textContent = progress.colors.level;
  updateColorProgress();
  nextColorRound();
}

function updateColorProgress() {
  const pct = (progress.colors.correct / NEEDED) * 100;
  document.getElementById("color-fill").style.width = pct + "%";
  document.getElementById("color-progress-text").textContent =
    progress.colors.correct + " / " + NEEDED + " correct";
}

function nextColorRound() {
  const area = document.getElementById("planets-area");
  area.innerHTML = "";
  document.getElementById("color-feedback").textContent = "";

  const level = progress.colors.level;
  // More planets at higher levels
  const planetCount = Math.min(3 + Math.floor(level / 3), 7);

  const target = PLANET_COLORS[Math.floor(Math.random() * PLANET_COLORS.length)];
  document.getElementById("target-color").textContent = target.name;
  document.getElementById("target-color").style.color = target.hex;

  let choices = [...PLANET_COLORS].sort(() => Math.random() - 0.5).slice(0, planetCount);
  if (!choices.find((c) => c.name === target.name)) choices[0] = target;
  choices = choices.sort(() => Math.random() - 0.5);

  choices.forEach((color) => {
    const planet = document.createElement("div");
    planet.className = "planet" + (color.ring ? " has-ring" : "");
    // Realistic gradient
    const dark = shade(color.hex, -45);
    const light = shade(color.hex, 25);
    planet.style.background = `radial-gradient(circle at 30% 25%, ${light}, ${color.hex} 45%, ${dark})`;
    // Slight size variation
    const size = 80 + Math.random() * 25;
    planet.style.width = size + "px";
    planet.style.height = size + "px";
    planet.addEventListener("click", () => handleColorClick(planet, color.name, target.name));
    area.appendChild(planet);
  });
}

function handleColorClick(planet, clicked, target) {
  const feedback = document.getElementById("color-feedback");
  if (clicked === target) {
    soundCorrect();
    planet.classList.add("correct");
    progress.colors.correct++;
    updateColorProgress();
    feedback.textContent = "Great job! 🌟";
    feedback.className = "feedback good";

    if (progress.colors.correct >= NEEDED) {
      // Level up
      if (progress.colors.level < 20) {
        progress.colors.level++;
        progress.colors.correct = 0;
        save();
        soundLevelUp();
        feedback.textContent = "Level " + progress.colors.level + " Unlocked! 🚀";
        document.getElementById("color-level").textContent = progress.colors.level;
        checkModeUnlocks();
      } else {
        feedback.textContent = "Max Level! You're a star! 🏆";
      }
      updateColorProgress();
    }
    save();
    setTimeout(nextColorRound, 1000);
  } else {
    soundWrong();
    planet.classList.add("wrong");
    feedback.textContent = "Try again!";
    feedback.className = "feedback bad";
    setTimeout(() => planet.classList.remove("wrong"), 400);
  }
}

function shade(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// ======================
// 2. COUNT STARS (20 levels, stars up to 20)
// ======================
function startStarsGame() {
  document.getElementById("stars-level").textContent = progress.stars.level;
  updateStarsProgress();
  nextStarsRound();
}

function updateStarsProgress() {
  const pct = (progress.stars.correct / NEEDED) * 100;
  document.getElementById("stars-fill").style.width = pct + "%";
  document.getElementById("stars-progress-text").textContent =
    progress.stars.correct + " / " + NEEDED + " correct";
}

function nextStarsRound() {
  const area = document.getElementById("stars-area");
  const buttons = document.getElementById("number-buttons");
  area.innerHTML = "";
  buttons.innerHTML = "";
  document.getElementById("stars-feedback").textContent = "";

  const level = progress.stars.level;
  // Stars increase with level: Level 1 → 1-3, Level 20 → up to 20
  const maxStars = Math.min(3 + Math.floor((level - 1) * 0.9), 20);
  const minStars = Math.max(1, maxStars - 3);
  const correctNumber = minStars + Math.floor(Math.random() * (maxStars - minStars + 1));

  for (let i = 0; i < correctNumber; i++) {
    const star = document.createElement("span");
    star.textContent = "⭐";
    star.style.fontSize = (1.6 + Math.random() * 0.8) + "rem";
    star.style.animation = `float ${1.5 + Math.random()}s ease-in-out infinite`;
    star.style.animationDelay = Math.random() + "s";
    area.appendChild(star);
  }

  // Number buttons: show a range around the correct answer
  const btnStart = Math.max(1, correctNumber - 2);
  const btnEnd = Math.min(20, correctNumber + 2);
  // Always show at least 4 options when possible
  let nums = [];
  for (let n = btnStart; n <= btnEnd; n++) nums.push(n);
  while (nums.length < 4 && nums[nums.length - 1] < 20) nums.push(nums[nums.length - 1] + 1);
  while (nums.length < 4 && nums[0] > 1) nums.unshift(nums[0] - 1);

  nums.forEach((n) => {
    const btn = document.createElement("button");
    btn.className = "num-btn";
    btn.textContent = n;
    btn.addEventListener("click", () => handleStarsClick(btn, n, correctNumber));
    buttons.appendChild(btn);
  });
}

function handleStarsClick(btn, number, correct) {
  const feedback = document.getElementById("stars-feedback");
  if (number === correct) {
    soundCorrect();
    btn.classList.add("correct");
    progress.stars.correct++;
    updateStarsProgress();
    feedback.textContent = "Yes! " + correct + " stars! 🌟";
    feedback.className = "feedback good";

    if (progress.stars.correct >= NEEDED) {
      if (progress.stars.level < 20) {
        progress.stars.level++;
        progress.stars.correct = 0;
        save();
        soundLevelUp();
        feedback.textContent = "Level " + progress.stars.level + " Unlocked! 🚀";
        document.getElementById("stars-level").textContent = progress.stars.level;
        checkModeUnlocks();
      } else {
        feedback.textContent = "Max Level! Amazing! 🏆";
      }
      updateStarsProgress();
    }
    save();
    setTimeout(nextStarsRound, 1100);
  } else {
    soundWrong();
    btn.classList.add("wrong");
    feedback.textContent = "Try again!";
    feedback.className = "feedback bad";
    setTimeout(() => btn.classList.remove("wrong"), 400);
  }
}

// ======================
// 3. PLANET MATCH (20 levels)
// ======================
const ALL_EMOJIS = ["🪐", "🌍", "🔴", "🟡", "🟣", "🔵", "🟢", "🟠", "⭐", "🌙"];

function startMatchGame() {
  document.getElementById("match-level").textContent = progress.match.level;
  document.getElementById("match-feedback").textContent = "";
  buildMatchGrid();
}

function buildMatchGrid() {
  const grid = document.getElementById("match-grid");
  grid.innerHTML = "";
  const level = progress.match.level;

  // Pairs increase with level: Lv1-4 = 3 pairs, Lv5-10 = 4, Lv11-20 = 5-6
  let pairCount = 3;
  if (level >= 5) pairCount = 4;
  if (level >= 11) pairCount = 5;
  if (level >= 16) pairCount = 6;

  const pairs = ALL_EMOJIS.slice(0, pairCount);
  const cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);

  // Adjust grid columns
  grid.style.gridTemplateColumns = pairCount <= 4 ? "repeat(3, 1fr)" : "repeat(4, 1fr)";

  window._matchState = {
    flipped: [],
    matched: 0,
    total: pairCount * 2,
    lock: false,
  };

  cards.forEach((emoji, i) => {
    const card = document.createElement("div");
    card.className = "match-card";
    card.dataset.emoji = emoji;
    card.innerHTML = `<span class="card-back">❓</span>`;
    card.addEventListener("click", () => flipCard(card));
    grid.appendChild(card);
  });
}

function flipCard(card) {
  const state = window._matchState;
  if (state.lock) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
  if (state.flipped.length === 1 && state.flipped[0] === card) return;

  soundClick();
  card.classList.add("flipped");
  card.innerHTML = card.dataset.emoji;
  state.flipped.push(card);

  if (state.flipped.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  const state = window._matchState;
  const [c1, c2] = state.flipped;
  const isMatch = c1.dataset.emoji === c2.dataset.emoji;

  if (isMatch) {
    soundMatch();
    c1.classList.add("matched");
    c2.classList.add("matched");
    state.matched += 2;
    state.flipped = [];

    if (state.matched === state.total) {
      soundCorrect();
      const feedback = document.getElementById("match-feedback");
      feedback.textContent = "You did it! 🎉";
      feedback.className = "feedback good";

      // Level up after completing a board
      if (progress.match.level < 20) {
        progress.match.level++;
        save();
        soundLevelUp();
        setTimeout(() => {
          feedback.textContent = "Level " + progress.match.level + " Unlocked! 🚀";
          document.getElementById("match-level").textContent = progress.match.level;
          checkModeUnlocks();
          setTimeout(buildMatchGrid, 1200);
        }, 800);
      } else {
        feedback.textContent = "Max Level! Champion! 🏆";
      }
    }
  } else {
    soundWrong();
    state.lock = true;
    setTimeout(() => {
      c1.classList.remove("flipped");
      c2.classList.remove("flipped");
      c1.innerHTML = `<span class="card-back">❓</span>`;
      c2.innerHTML = `<span class="card-back">❓</span>`;
      state.flipped = [];
      state.lock = false;
    }, 700);
  }
}

// ======================
// 4. BUILD ROCKET (20 levels - cosmetic unlocks)
// ======================
const ROCKET_COLORS = [
  { name: "Red", hex: "#ff6b6b" },
  { name: "Blue", hex: "#4dabf7" },
  { name: "Green", hex: "#69db7c" },
  { name: "Yellow", hex: "#ffd43b" },
  { name: "Purple", hex: "#b197fc" },
  { name: "Orange", hex: "#ff922b" },
  { name: "Pink", hex: "#f783ac" },
  { name: "White", hex: "#f8f9fa" },
  { name: "Gold", hex: "#ffd700" },
  { name: "Cyan", hex: "#00e5ff" },
];

let selectedPart = "body";

function startRocketBuilder() {
  document.getElementById("rocket-level").textContent = progress.rocket.level;
  selectedPart = "body";
  document.querySelectorAll(".part-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector('.part-btn[data-part="body"]').classList.add("active");
  document.getElementById("rocket-feedback").textContent = "";

  document.getElementById("part-body").style.background = "#7c9cff";
  document.getElementById("part-window").style.background = "#a0c4ff";
  document.querySelector(".fin.left").style.borderColor = "transparent #ff6b9d transparent transparent";
  document.querySelector(".fin.right").style.borderColor = "transparent transparent transparent #ff6b9d";
  document.getElementById("part-nose").style.filter = "none";

  // More colors unlock at higher levels
  const unlockedColors = Math.min(6 + Math.floor(progress.rocket.level / 3), ROCKET_COLORS.length);
  const options = document.getElementById("color-options");
  options.innerHTML = "";
  ROCKET_COLORS.slice(0, unlockedColors).forEach((color) => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.background = color.hex;
    swatch.title = color.name;
    swatch.addEventListener("click", () => { soundClick(); applyColor(color.hex); });
    options.appendChild(swatch);
  });
}

document.querySelectorAll(".part-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    soundClick();
    document.querySelectorAll(".part-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPart = btn.dataset.part;
  });
});

function applyColor(hex) {
  if (selectedPart === "body") document.getElementById("part-body").style.background = hex;
  else if (selectedPart === "nose") document.getElementById("part-nose").style.filter = `drop-shadow(0 0 8px ${hex})`;
  else if (selectedPart === "fins") {
    document.querySelector(".fin.left").style.borderColor = `transparent ${hex} transparent transparent`;
    document.querySelector(".fin.right").style.borderColor = `transparent transparent transparent ${hex}`;
  } else if (selectedPart === "window") document.getElementById("part-window").style.background = hex;
}

document.getElementById("launch-btn").addEventListener("click", () => {
  soundLaunch();
  const feedback = document.getElementById("rocket-feedback");
  feedback.textContent = "3... 2... 1... Liftoff! 🚀✨";
  feedback.className = "feedback good";

  const preview = document.getElementById("rocket-preview");
  preview.style.transition = "transform 1.5s ease-in";
  preview.style.transform = "translateY(-300px)";

  // Level up on launch
  if (progress.rocket.level < 20) {
    progress.rocket.level++;
    save();
  }

  setTimeout(() => {
    preview.style.transition = "none";
    preview.style.transform = "translateY(0)";
    feedback.textContent = "Amazing rocket! Level " + progress.rocket.level + " 🌟";
    document.getElementById("rocket-level").textContent = progress.rocket.level;
    soundCorrect();
    // Refresh colors if new ones unlocked
    startRocketBuilder();
  }, 1600);
});

// Init
createStars();
updateHomeUI();
