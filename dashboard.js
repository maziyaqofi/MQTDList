const dayElement = document.getElementById("day");
const fullDateElement = document.getElementById("fullDate");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const dateButton = document.getElementById("dateButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const filterButtons = document.querySelectorAll(".filter");

let activeFilter = "all";
let tasks = [
  { id: 1, text: "Learn React", date: "", completed: false },
  { id: 2, text: "Prototyping To-Do List", date: "", completed: true },
  { id: 3, text: "Push to Github", date: "", completed: false },
];

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

function getVisibleTasks() {
  if (activeFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (activeFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
      renderTasks();
    });

    item.querySelector(".edit-task").addEventListener("click", () => {
      const updatedText = prompt("Edit your task", task.text);

      if (updatedText && updatedText.trim()) {
        task.text = updatedText.trim();
        renderTasks();
      }
    });

    item.querySelector(".delete-task").addEventListener("click", () => {
      tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
      renderTasks();
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
  });

  taskInput.value = "";
  taskDate.value = "";
  taskInput.focus();
  renderTasks();
});

dateButton.addEventListener("click", () => {
  if (typeof taskDate.showPicker === "function") {
    taskDate.showPicker();
    return;
  }

  taskDate.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((filterButton) => filterButton.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderTasks();
  });
});

showToday();
renderTasks();
