
"use strict";

/* EcoQuest — Interactive JavaScript */

const STORAGE_KEY = "ecoQuestFinalV1";

const defaultChallenges = [
  { id: "c1", title: "Save Water While Brushing", category: "water", description: "Turn off the tap while brushing your teeth.", points: 10, icon: "💧" },
  { id: "c2", title: "Switch Off Unused Lights", category: "energy", description: "Turn off lights and fans when leaving a room.", points: 10, icon: "💡" },
  { id: "c3", title: "Use a Reusable Water Bottle", category: "waste", description: "Choose a reusable bottle instead of a disposable one.", points: 15, icon: "🥤" },
  { id: "c4", title: "Keep Your Surroundings Clean", category: "community", description: "Put litter in the proper bin and help keep shared spaces clean.", points: 15, icon: "🧹" },
  { id: "c5", title: "Plant Something Green", category: "nature", description: "Plant a seed or care for a plant.", points: 20, icon: "🌱" },
  { id: "c6", title: "Avoid Single-Use Plastic", category: "waste", description: "Use a reusable bag or container when possible.", points: 15, icon: "♻️" },
  { id: "c7", title: "Walk for a Short Trip", category: "energy", description: "Walk instead of driving when safe and practical.", points: 20, icon: "🚶" },
  { id: "c8", title: "Reuse Paper", category: "waste", description: "Use both sides of paper before recycling it.", points: 10, icon: "📄" },
  { id: "c9", title: "Share an Eco Tip", category: "community", description: "Share an environmental tip with a friend or family member.", points: 15, icon: "🌍" },
  { id: "c10", title: "Sort Your Waste", category: "waste", description: "Separate recyclable materials where facilities exist.", points: 15, icon: "🗑️" },
  { id: "c11", title: "Take a Reusable Shopping Bag", category: "waste", description: "Carry a reusable bag when shopping.", points: 10, icon: "🛍️" },
  { id: "c12", title: "Use Water Wisely", category: "water", description: "Close taps properly and tell someone about leaks.", points: 15, icon: "🚰" },
  { id: "c13", title: "Care for a Plant", category: "nature", description: "Check a plant and give it the care it needs.", points: 10, icon: "🪴" },
  { id: "c14", title: "Unplug an Unused Charger", category: "energy", description: "Unplug an unused charger when it is safe to do so.", points: 10, icon: "🔌" },
  { id: "c15", title: "Choose a Litter-Free Day", category: "community", description: "Use bins and encourage others to keep spaces clean.", points: 20, icon: "🌳" }
];

const achievements = [
  { id: "first", title: "First Step", description: "Complete your first challenge.", icon: "🌱", target: 1 },
  { id: "explorer", title: "Eco Explorer", description: "Complete 5 challenges.", icon: "🧭", target: 5 },
  { id: "guardian", title: "Green Guardian", description: "Complete 10 challenges.", icon: "🌍", target: 10 },
  { id: "champion", title: "Eco Champion", description: "Complete 15 challenges.", icon: "🏆", target: 15 }
];

const $ = (id) => document.getElementById(id);

const el = {
  grid: $("challengeGrid"),
  empty: $("emptyState"),
  search: $("searchInput"),
  category: $("categoryFilter"),
  count: $("challengeCount"),
  form: $("challengeForm"),
  title: $("challengeTitle"),
  categoryInput: $("challengeCategory"),
  description: $("challengeDescription"),
  points: $("challengePoints"),
  icon: $("challengeIcon"),
  formHeading: $("formHeading"),
  saveButton: $("saveChallengeButton"),
  cancelButton: $("cancelEditButton"),
  formMessage: $("formMessage"),
  completed: $("completedCount"),
  pointsCount: $("pointsCount"),
  badgesCount: $("badgesCount"),
  level: $("levelName"),
  levelDescription: $("levelDescription"),
  progressBar: $("levelProgressBar"),
  progressFill: $("levelProgressFill"),
  progressText: $("progressText"),
  date: $("todayDate"),
  badges: $("badgesGrid"),
  reset: $("resetProgressButton"),
  resetFilters: $("resetFilters"),
  emptyReset: $("emptyResetButton"),
  menu: $("menuToggle"),
  nav: $("navLinks"),
  year: $("currentYear"),
  toast: $("toast")
};

let state = {
  challenges: [],
  completed: [],
  earnedBadges: []
};

let editingId = null;
let toastTimer;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showToast(message) {
  if (!el.toast) return;

  el.toast.textContent = message;
  el.toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.classList.remove("show");
  }, 2800);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Could not save EcoQuest data:", error);
    showToast("Progress could not be saved in this browser.");
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      state = {
        challenges: defaultChallenges.map(item => ({ ...item })),
        completed: [],
        earnedBadges: []
      };
      saveState();
      return;
    }

    const parsed = JSON.parse(saved);

    state.challenges =
      Array.isArray(parsed.challenges) && parsed.challenges.length
        ? parsed.challenges
        : defaultChallenges.map(item => ({ ...item }));

    state.completed = Array.isArray(parsed.completed)
      ? parsed.completed
      : [];

    state.earnedBadges = Array.isArray(parsed.earnedBadges)
      ? parsed.earnedBadges
      : [];
  } catch (error) {
    console.error("Could not load EcoQuest data:", error);

    state = {
      challenges: defaultChallenges.map(item => ({ ...item })),
      completed: [],
      earnedBadges: []
    };
  }
}

function getCompletedCount() {
  return state.completed.filter(id =>
    state.challenges.some(challenge => challenge.id === id)
  ).length;
}

function getPoints() {
  return state.challenges.reduce((sum, challenge) => {
    return state.completed.includes(challenge.id)
      ? sum + Number(challenge.points || 0)
      : sum;
  }, 0);
}

function renderChallenges() {
  if (!el.grid) {
    console.error("EcoQuest: challengeGrid is missing from index.html.");
    return;
  }

  const term = el.search.value.trim().toLowerCase();
  const category = el.category.value;

  const filtered = state.challenges.filter(challenge => {
    const text = `${challenge.title} ${challenge.description} ${challenge.category}`.toLowerCase();
    return text.includes(term) &&
      (category === "all" || challenge.category === category);
  });

  el.grid.replaceChildren();

  filtered.forEach(challenge => {
    const completed = state.completed.includes(challenge.id);
    const card = document.createElement("article");

    card.className = `challenge-card${completed ? " completed" : ""}`;

    card.innerHTML = `
      <div class="challenge-card-top">
        <span class="challenge-icon" aria-hidden="true">${escapeHTML(challenge.icon || "🌱")}</span>
        <span class="challenge-points">${Number(challenge.points)} points</span>
      </div>
      <span class="challenge-category">${escapeHTML(challenge.category)}</span>
      <h3>${escapeHTML(challenge.title)}</h3>
      <p>${escapeHTML(challenge.description)}</p>
      <div class="challenge-actions">
        <button type="button"
          class="challenge-complete-button"
          data-action="complete" data-id="${escapeHTML(challenge.id)}"
          ${completed ? "disabled" : ""}>
          ${completed ? "✓ Completed" : "Mark as Complete"}
        </button>
        ${challenge.custom ? `
          <button type="button" class="challenge-edit-button"
            data-action="edit" data-id="${escapeHTML(challenge.id)}">Edit</button>
          <button type="button" class="challenge-delete-button"
            data-action="delete" data-id="${escapeHTML(challenge.id)}">Delete</button>
        ` : ""}
      </div>
    `;

    el.grid.appendChild(card);
  });

  el.empty.classList.toggle("hidden", filtered.length !== 0);

  el.count.textContent =
    `${filtered.length} challenge${filtered.length === 1 ? "" : "s"}`;
}

function updateAchievements() {
  const count = getCompletedCount();

  achievements.forEach(badge => {
    if (count >= badge.target && !state.earnedBadges.includes(badge.id)) {
      state.earnedBadges.push(badge.id);
      showToast(`Achievement unlocked: ${badge.title}!`);
    }
  });
}

function renderDashboard() {
  const completed = getCompletedCount();
  const points = getPoints();

  el.completed.textContent = completed;
  el.pointsCount.textContent = points;
  el.badgesCount.textContent = state.earnedBadges.length;

  let level;
  let lower;
  let upper;

  if (points >= 200) {
    level = "Eco Champion";
    lower = 200;
    upper = 300;
  } else if (points >= 100) {
    level = "Green Guardian";
    lower = 100;
    upper = 200;
  } else if (points >= 50) {
    level = "Eco Explorer";
    lower = 50;
    upper = 100;
  } else {
    level = "Eco Beginner";
    lower = 0;
    upper = 50;
  }

  el.level.textContent = level;
  el.levelDescription.textContent = points >= 200
    ? "Amazing! Keep making greener choices."
    : points >= 100
      ? "You're building great eco-friendly habits."
      : points >= 50
        ? "Every small action makes a difference."
        : "Start completing challenges to earn points.";

  const percent = Math.min(100, ((points - lower) / (upper - lower)) * 100);

  el.progressFill.style.width = `${percent}%`;
  el.progressBar.setAttribute("aria-valuenow", String(Math.round(percent)));
  el.progressText.textContent =
    `${completed} of ${state.challenges.length} challenges completed`;

  el.date.textContent = new Date().toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  el.badges.replaceChildren();

  achievements.forEach(badge => {
    const earned = state.earnedBadges.includes(badge.id);
    const card = document.createElement("article");

    card.className = `badge-card ${earned ? "earned" : "locked"}`;
    card.innerHTML = `
      <span class="badge-icon">${earned ? badge.icon : "🔒"}</span>
      <h3>${escapeHTML(badge.title)}</h3>
      <p>${escapeHTML(badge.description)}</p>
      <span>${earned ? "Unlocked" : "Locked"}</span>
    `;

    el.badges.appendChild(card);
  });
}

function completeChallenge(id) {
  const challenge = state.challenges.find(item => item.id === id);

  if (!challenge || state.completed.includes(id)) return;

  state.completed.push(id);
  updateAchievements();
  saveState();
  renderChallenges();
  renderDashboard();

  showToast(`Great work! You earned ${challenge.points} points!`);
}

function showFormMessage(message, isError = true) {
  el.formMessage.textContent = message;
  el.formMessage.style.color = isError ? "#b42318" : "#18794e";
}

function resetForm() {
  editingId = null;
  el.form.reset();
  el.formHeading.textContent = "Add a New Challenge";
  el.saveButton.textContent = "Add Challenge";
  el.cancelButton.classList.add("hidden");
  showFormMessage("");
}

function handleFormSubmit(event) {
  event.preventDefault();

  const title = el.title.value.trim();
  const category = el.categoryInput.value;
  const description = el.description.value.trim();
  const points = Number(el.points.value);
  const icon = el.icon.value.trim() || "🌱";

  if (title.length < 3) {
    showFormMessage("Title must contain at least 3 characters.");
    el.title.focus();
    return;
  }

  if (description.length < 5) {
    showFormMessage("Please enter a more detailed description.");
    el.description.focus();
    return;
  }

  const duplicate = state.challenges.some(challenge =>
    challenge.title.toLowerCase() === title.toLowerCase() &&
    challenge.id !== editingId
  );

  if (duplicate) {
    showFormMessage("A challenge with this title already exists.");
    return;
  }

  if (editingId) {
    const challenge = state.challenges.find(item => item.id === editingId);

    if (!challenge) {
      showFormMessage("Challenge not found. Please try again.");
      return;
    }

    Object.assign(challenge, { title, category, description, points, icon });
    showToast("Challenge updated successfully!");
  } else {
    state.challenges.push({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      category,
      description,
      points,
      icon,
      custom: true
    });

    showToast("Your new challenge has been added!");
  }

  saveState();
  renderChallenges();
  renderDashboard();
  resetForm();
}

function editChallenge(id) {
  const challenge = state.challenges.find(item => item.id === id);
  if (!challenge || !challenge.custom) return;

  editingId = id;
  el.title.value = challenge.title;
  el.categoryInput.value = challenge.category;
  el.description.value = challenge.description;
  el.points.value = String(challenge.points);
  el.icon.value = challenge.icon || "🌱";
  el.formHeading.textContent = "Edit Challenge";
  el.saveButton.textContent = "Save Changes";
  el.cancelButton.classList.remove("hidden");
  showFormMessage("");

  el.form.scrollIntoView({ behavior: "smooth", block: "center" });
  el.title.focus({ preventScroll: true });
}

function deleteChallenge(id) {
  const challenge = state.challenges.find(item => item.id === id);
  if (!challenge || !challenge.custom) return;

  if (!window.confirm(`Delete "${challenge.title}"?`)) return;

  state.challenges = state.challenges.filter(item => item.id !== id);
  state.completed = state.completed.filter(itemId => itemId !== id);

  saveState();
  renderChallenges();
  renderDashboard();
  showToast("Challenge deleted.");
}

function resetFilters() {
  el.search.value = "";
  el.category.value = "all";
  renderChallenges();
}

function initializeEvents() {
  el.grid.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "complete") completeChallenge(id);
    if (action === "edit") editChallenge(id);
    if (action === "delete") deleteChallenge(id);
  });

  el.search.addEventListener("input", renderChallenges);
  el.category.addEventListener("change", renderChallenges);
  el.resetFilters.addEventListener("click", resetFilters);
  el.emptyReset.addEventListener("click", resetFilters);
  el.form.addEventListener("submit", handleFormSubmit);
  el.cancelButton.addEventListener("click", resetForm);

  el.reset.addEventListener("click", () => {
    if (!window.confirm("Reset all progress and custom challenges?")) return;

    state = {
      challenges: defaultChallenges.map(item => ({ ...item })),
      completed: [],
      earnedBadges: []
    };

    resetForm();
    saveState();
    renderChallenges();
    renderDashboard();
    showToast("Your EcoQuest progress has been reset.");
  });

  el.menu.addEventListener("click", () => {
    const opened = el.nav.classList.toggle("active");
    el.menu.setAttribute("aria-expanded", String(opened));
  });

  el.nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      el.nav.classList.remove("active");
      el.menu.setAttribute("aria-expanded", "false");
    });
  });
}

function initializeApp() {
  loadState();

  el.year.textContent = new Date().getFullYear();

  initializeEvents();
  updateAchievements();
  renderChallenges();
  renderDashboard();
  saveState();

  console.log("EcoQuest is ready!");
}

document.addEventListener("DOMContentLoaded", initializeApp);
