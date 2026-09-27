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
