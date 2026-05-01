const dayElement = document.getElementById("day");
const fullDateElement = document.getElementById("fullDate");

const today = new Date();

const dayName = today.toLocaleDateString("en-US", {
  weekday: "long",
});

const fullDate = today.toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

dayElement.textContent = dayName;
fullDateElement.textContent = fullDate;
