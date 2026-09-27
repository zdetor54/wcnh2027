document.querySelectorAll("[data-programme-category]").forEach((button) => {
  const category = button.dataset.programmeCategory;
  const sessions = document.querySelectorAll(`.programme-events .${category}`);

  button.addEventListener("click", () => {
    const selected = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(selected));
    sessions.forEach((session) => {
      session.classList.toggle("programme-dimmed", !selected);
    });
  });
});

const programmeDays = [...document.querySelectorAll(".programme-day")];
const compactProgramme = window.matchMedia("(max-width: 1199.98px)");
const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const currentDay = programmeDays.find((day) => day.querySelector("time")?.dateTime === localDate) || programmeDays[0];

programmeDays.forEach((day) => {
  const heading = day.querySelector(".programme-day-header h3");
  const periods = day.querySelector(".programme-periods");
  const label = document.createElement("span");
  label.className = "programme-day-title";
  label.textContent = heading.textContent;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "programme-day-toggle";
  button.textContent = heading.textContent;
  periods.id = `${day.id}-sessions`;
  button.setAttribute("aria-controls", periods.id);
  let expanded = day === currentDay;

  const syncDay = () => {
    periods.hidden = compactProgramme.matches && !expanded;
    button.setAttribute("aria-expanded", String(!periods.hidden));
  };

  button.addEventListener("click", () => {
    expanded = !expanded;
    syncDay();
  });
  heading.replaceChildren(label, button);
  day.classList.add("programme-collapsible");
  compactProgramme.addEventListener("change", syncDay);
  syncDay();
});
