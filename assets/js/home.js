const keyDates = document.querySelector("[data-key-dates]");

if (keyDates) {
  const milestones = [...keyDates.querySelectorAll("[data-milestone-start]")];
  const todayMarker = document.createElement("li");
  todayMarker.className = "key-dates-now";
  todayMarker.setAttribute("aria-current", "date");
  // Compare calendar dates in the conference timezone, including the entire deadline day.
  const dateKey = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Athens" });

  const updateKeyDates = () => {
    const now = new Date();
    const today = dateKey.format(now);
    const current = milestones.find((item) => today <= item.dataset.milestoneEnd);
    // Give today its own position on the line; milestone dots always remain dots.
    if (current) {
      const status = today < current.dataset.milestoneStart
        ? current.dataset.nowBefore : current.dataset.nowDuring;
      todayMarker.textContent = `Now · ${status}`;
      current.before(todayMarker);
    } else {
      todayMarker.remove();
    }

    milestones.forEach((item) => {
      const past = today > item.dataset.milestoneEnd;
      const state = item.querySelector(".key-dates-state");
      item.classList.toggle("is-past", past);
      item.removeAttribute("aria-current");
      state.hidden = true;
      if (item === current) {
        if (today >= item.dataset.milestoneStart) item.setAttribute("aria-current", "step");
        state.textContent = today < item.dataset.milestoneStart ? "Up next"
          : item.dataset.milestoneStart === item.dataset.milestoneEnd ? "Today" : "Happening now";
        state.hidden = false;
      }
    });
  };

  updateKeyDates();
  window.setInterval(updateKeyDates, 60000);
}
