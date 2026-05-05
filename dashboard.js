if (localStorage.getItem("isLogin") !== "true") {
  window.location.replace("login.html");
}

const dayElement = document.getElementById("day");
const fullDateElement = document.getElementById("fullDate");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const dateButton = document.getElementById("dateButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const userNameElement = document.getElementById("userName");
const userEmailElement = document.getElementById("userEmail");
const welcomeTitle = document.getElementById("welcome-title");
const priorityList = document.getElementById("priorityList");
const priorityDetail = document.getElementById("priorityDetail");
const calendarMonth = document.getElementById("calendarMonth");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const filterButtons = document.querySelectorAll(".filter");
const menuItems = document.querySelectorAll(".menu li");
const pageSections = document.querySelectorAll(".page-section");

const TASK_STORAGE_KEY = "mqTasks";
const ACTIVE_PAGE_STORAGE_KEY = "mqActivePage";

let activeFilter = "all";
let searchKeyword = "";
let calendarViewDate = new Date();
const defaultTasks = [
  { id: 1, text: "Learn React", date: "", completed: false, priority: false, createdAt: "20/06/2023" },
  { id: 2, text: "Prototyping To-Do List", date: "", completed: true, priority: false, createdAt: "20/06/2023" },
  { id: 3, text: "Push to Github", date: "", completed: false, priority: false, createdAt: "20/06/2023" },
];

let tasks = loadTasks();
let selectedPriorityId = null;

function loadTasks() {
  const savedTasks = localStorage.getItem(TASK_STORAGE_KEY);

  if (!savedTasks) {
    return defaultTasks.map(normalizeTask);
  }

  try {
    return JSON.parse(savedTasks).map(normalizeTask);
  } catch (error) {
    localStorage.removeItem(TASK_STORAGE_KEY);
    return defaultTasks.map(normalizeTask);
  }
}

function saveTasks() {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

function normalizeTask(task) {
  return {
    ...task,
    priority: Boolean(task.priority),
    createdAt: task.createdAt || getTodayShortDate(),
  };
}

function showToday() {
  const today = new Date();

  dayElement.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
  });

  fullDateElement.textContent = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTaskDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTodayShortDate() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getVisibleTasks() {
  let visibleTasks = tasks;

  if (activeFilter === "active") {
    visibleTasks = visibleTasks.filter((task) => !task.completed);
  }

  if (activeFilter === "completed") {
    visibleTasks = visibleTasks.filter((task) => task.completed);
  }

  if (searchKeyword) {
    visibleTasks = visibleTasks.filter((task) =>
      task.text.toLowerCase().includes(searchKeyword)
    );
  }

  return visibleTasks;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showPage(pageName) {
  const pageMap = {
    dashboard: "dashboardPage",
    priority: "priorityPage",
    calendar: "calendarPage",
    "all-task": "allTaskPage",
    settings: "settingsPage",
    help: "helpPage",
  };

  if (!pageMap[pageName]) {
    pageName = "dashboard";
  }

  pageSections.forEach((section) => {
    section.classList.remove("active");
  });

  menuItems.forEach((item) => {
    item.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageMap[pageName]);
  const selectedMenu = document.querySelector(`[data-page="${pageName}"]`);

  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  if (selectedMenu) {
    selectedMenu.classList.add("active");
  }

  localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, pageName);
}

function logout() {
  localStorage.removeItem("isLogin");
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

function showUserProfile() {
  const username = localStorage.getItem("username") || "User";
  const userEmail = `${username.toLowerCase()}@example.com`;

  userNameElement.textContent = username;
  userEmailElement.textContent = userEmail;
  welcomeTitle.textContent = `Welcome Back, ${username} !`;
}

function getPriorityTasks() {
  return tasks.filter((task) => task.priority);
}

function getPriorityTaskById(taskId) {
  const priorityTasks = getPriorityTasks();
  return priorityTasks.find((task) => task.id === taskId) || priorityTasks[0] || null;
}

function renderPriorityTasks() {
  const priorityTasks = getPriorityTasks();

  priorityList.innerHTML = "";

  if (!priorityTasks.length) {
    selectedPriorityId = null;
    priorityList.innerHTML = `
      <div class="priority-empty">
        <i class="fa-regular fa-star"></i>
        <p>Belum ada priority task. Klik icon bintang pada task di Dashboard untuk menambahkannya ke sini.</p>
      </div>
    `;
    renderPriorityDetail();
    return;
  }

  if (!priorityTasks.some((task) => task.id === selectedPriorityId)) {
    selectedPriorityId = priorityTasks[0].id;
  }

  priorityTasks.forEach((task) => {
    const item = document.createElement("button");
    item.className = `priority-item${task.id === selectedPriorityId ? " active" : ""}`;
    item.type = "button";
    const statusText = task.completed ? "Completed" : "Not Started";
    const statusLevel = task.completed ? "completed-status" : "not-started";

    item.innerHTML = `
      <span class="priority-dot extreme" aria-hidden="true"></span>
      <div class="priority-copy">
        <div class="priority-card-top">
          <h2>${escapeHtml(task.text)}</h2>
          <span class="more-dots" aria-hidden="true">...</span>
        </div>
        <p>${escapeHtml(task.text)}${task.date ? ` - Deadline ${escapeHtml(formatTaskDate(task.date))}` : ""}</p>
        <div class="priority-card-meta">
          <span>Priority: <b class="extreme">Important</b></span>
          <span>Status: <b class="${statusLevel}">${statusText}</b></span>
          <span>Created on: ${escapeHtml(task.createdAt)}</span>
        </div>
      </div>
      <img src="assets/loginimg.png" alt="">
    `;

    item.addEventListener("click", () => {
      selectedPriorityId = task.id;
      renderPriorityTasks();
      renderPriorityDetail();
    });

    priorityList.appendChild(item);
  });
}

function renderPriorityDetail() {
  const task = getPriorityTaskById(selectedPriorityId);

  if (!task) {
    priorityDetail.innerHTML = `
      <div class="priority-empty priority-empty-detail">
        <i class="fa-regular fa-star"></i>
        <p>Priority task yang kamu tandai akan tampil detailnya di sini.</p>
      </div>
    `;
    return;
  }

  const statusText = task.completed ? "Completed" : "Not Started";
  const statusLevel = task.completed ? "completed-status" : "not-started";
  const deadline = task.date ? formatTaskDate(task.date) : "No deadline";

  priorityDetail.innerHTML = `
    <div class="priority-detail-head">
      <img src="assets/loginimg.png" alt="">
      <div>
        <h2>${escapeHtml(task.text)}</h2>
        <p>Priority: <b class="extreme">Important</b></p>
        <p>Status: <b class="${statusLevel}">${statusText}</b></p>
        <small>Created on: ${escapeHtml(task.createdAt)}</small>
      </div>
    </div>

    <div class="priority-detail-body">
      <p><b>Task Title:</b> ${escapeHtml(task.text)}.</p>
      <p><b>Objective:</b> Selesaikan task penting ini sesuai prioritas.</p>
      <p><b>Task Description:</b> Task ini ditandai sebagai priority task dari halaman Dashboard. Gunakan halaman ini untuk melihat daftar pekerjaan penting yang harus lebih dulu kamu perhatikan.</p>
      <p><b>Additional Notes:</b></p>
      <ul>
        <li>Pastikan task ini dikerjakan lebih dulu dibanding task biasa.</li>
        <li>Jika sudah selesai, centang task dari Dashboard.</li>
        <li>Klik bintang lagi pada Dashboard untuk menghapus task dari Priority Tasks.</li>
      </ul>
      <p><b>Deadline for Submission:</b> ${escapeHtml(deadline)}</p>
    </div>

    <div class="priority-detail-actions">
      <button class="detail-action delete-task" type="button" aria-label="Delete priority task">
        <i class="fa-solid fa-trash"></i>
      </button>
      <button class="detail-action edit-task" type="button" aria-label="Edit priority task">
        <i class="fa-solid fa-pen"></i>
      </button>
    </div>
  `;

  priorityDetail.querySelector(".delete-task").addEventListener("click", () => {
    task.priority = false;
    saveTasks();
    renderTasks();
    renderPriorityTasks();
    renderPriorityDetail();
  });

  priorityDetail.querySelector(".edit-task").addEventListener("click", () => {
    const updatedText = prompt("Edit your priority task", task.text);

    if (updatedText && updatedText.trim()) {
      task.text = updatedText.trim();
      saveTasks();
      renderTasks();
      renderPriorityTasks();
      renderPriorityDetail();
      renderCalendar();
    }
  });
}

function renderCalendar() {
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  const monthName = calendarViewDate.toLocaleDateString("en-US", {
    month: "long",
  });
  const weekDays = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const prevLastDay = new Date(year, month, 0).getDate();
  const todayKey = getDateKey(new Date());

  calendarMonth.textContent = `${monthName}, ${year}`;
  calendarGrid.innerHTML = "";

  weekDays.forEach((day) => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "calendar-weekday";
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });

  for (let index = 0; index < 42; index++) {
    const dayOffset = index - startDay + 1;
    let cellDate;
    let isCurrentMonth = true;

    if (dayOffset < 1) {
      cellDate = new Date(year, month - 1, prevLastDay + dayOffset);
      isCurrentMonth = false;
    } else if (dayOffset > lastDay) {
      cellDate = new Date(year, month + 1, dayOffset - lastDay);
      isCurrentMonth = false;
    } else {
      cellDate = new Date(year, month, dayOffset);
    }

    const dateKey = getDateKey(cellDate);
    const dayTasks = tasks.filter((task) => task.date === dateKey);
    const cell = document.createElement("div");
    cell.className = `calendar-day${isCurrentMonth ? "" : " muted"}${dateKey === todayKey ? " today" : ""}${dayTasks.length ? " has-task" : ""}`;

    const visibleTasks = dayTasks.slice(0, 2)
      .map((task, taskIndex) => `
        <div class="calendar-task task-color-${taskIndex % 3}${task.completed ? " completed" : ""}">
          <strong>${escapeHtml(task.text)}</strong>
          <span>${task.completed ? "Completed" : "Not Started"}</span>
        </div>
      `)
      .join("");

    const extraCount = dayTasks.length > 2
      ? `<small class="calendar-more">+${dayTasks.length - 2} more</small>`
      : "";

    cell.innerHTML = `
      <span class="calendar-day-number">${cellDate.getDate()}</span>
      <div class="calendar-task-list">
        ${visibleTasks}
        ${extraCount}
      </div>
    `;

    calendarGrid.appendChild(cell);
  }
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  const activeTasks = tasks.filter((task) => !task.completed).length;

  taskList.innerHTML = "";
  taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? "task" : "tasks"} left`;

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const dateText = formatTaskDate(task.date);
    const taskText = escapeHtml(task.text);

    item.innerHTML = `
      <input class="task-check" type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark task complete">
      <div class="task-title">
        <span>${taskText}</span>
        ${dateText ? `<small>${dateText}</small>` : ""}
      </div>
      <div class="task-actions">
        <button class="icon-btn priority-task${task.priority ? " active" : ""}" type="button" aria-label="Mark as priority task">
          <i class="${task.priority ? "fa-solid" : "fa-regular"} fa-star"></i>
        </button>
        <button class="icon-btn edit-task" type="button" aria-label="Edit task">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
        <button class="icon-btn delete-task" type="button" aria-label="Delete task">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
    `;

    item.querySelector(".task-check").addEventListener("change", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
      renderPriorityTasks();
      renderPriorityDetail();
      renderCalendar();
    });

    item.querySelector(".priority-task").addEventListener("click", () => {
      task.priority = !task.priority;
      selectedPriorityId = task.priority ? task.id : selectedPriorityId;
      saveTasks();
      renderTasks();
      renderPriorityTasks();
      renderPriorityDetail();
      renderCalendar();
    });

    item.querySelector(".edit-task").addEventListener("click", () => {
      const updatedText = prompt("Edit your task", task.text);

      if (updatedText && updatedText.trim()) {
        task.text = updatedText.trim();
        saveTasks();
        renderTasks();
        renderPriorityTasks();
        renderPriorityDetail();
        renderCalendar();
      }
    });

    item.querySelector(".delete-task").addEventListener("click", () => {
      tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
      saveTasks();
      renderTasks();
      renderPriorityTasks();
      renderPriorityDetail();
      renderCalendar();
    });

    taskList.appendChild(item);
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: Date.now(),
    text,
    date: taskDate.value,
    completed: false,
    priority: false,
    createdAt: getTodayShortDate(),
  });

  saveTasks();

  taskInput.value = "";
  taskDate.value = "";
  taskInput.focus();
  renderTasks();
  renderCalendar();
});

dateButton.addEventListener("click", () => {
  if (typeof taskDate.showPicker === "function") {
    taskDate.showPicker();
    return;
  }

  taskDate.focus();
});

searchInput.addEventListener("input", () => {
  searchKeyword = searchInput.value.trim().toLowerCase();
  renderTasks();
});

searchButton.addEventListener("click", () => {
  searchKeyword = searchInput.value.trim().toLowerCase();
  renderTasks();
});

prevMonth.addEventListener("click", () => {
  calendarViewDate = new Date(
    calendarViewDate.getFullYear(),
    calendarViewDate.getMonth() - 1,
    1
  );
  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  calendarViewDate = new Date(
    calendarViewDate.getFullYear(),
    calendarViewDate.getMonth() + 1,
    1
  );
  renderCalendar();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((filterButton) => filterButton.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderTasks();
  });
});

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    showPage(item.dataset.page);
  });
});

const savedPage = localStorage.getItem(ACTIVE_PAGE_STORAGE_KEY) || "dashboard";

showToday();
showUserProfile();
renderTasks();
renderPriorityTasks();
renderPriorityDetail();
renderCalendar();
showPage(savedPage);
