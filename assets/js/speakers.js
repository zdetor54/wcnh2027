// Native dialog provides focus containment, Escape dismissal and an inert background.
const bioDialog = document.querySelector("#speaker-bio-dialog");
if (bioDialog && typeof bioDialog.showModal === "function") {
  let trigger;
  document.querySelectorAll(".speaker-bio").forEach((details) => {
    const summary = details.querySelector("summary");
    summary.setAttribute("aria-haspopup", "dialog");
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      trigger = summary;
      const card = details.closest(".speaker-card");
      const portrait = card.querySelector(".speaker-photo").cloneNode();
      portrait.removeAttribute("loading");
      bioDialog.querySelector(".bio-portrait").replaceChildren(portrait);
      bioDialog.querySelector(".bio-text").replaceChildren(...Array.from(details.querySelector(".speaker-full-bio").children, (paragraph) => paragraph.cloneNode(true)));
      bioDialog.querySelector(".bio-name").textContent = card.querySelector(".speaker-name").textContent;
      bioDialog.showModal();
      bioDialog.querySelector(".bio-layout").scrollTop = 0;
      document.body.classList.add("bio-dialog-open");
    });
  });
  bioDialog.querySelector(".bio-close").addEventListener("click", () => bioDialog.close());
  bioDialog.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const close = bioDialog.querySelector(".bio-close");
      const content = bioDialog.querySelector(".bio-layout");
      (document.activeElement === close ? content : close).focus();
    }
  });
  bioDialog.addEventListener("click", (event) => {
    const bounds = bioDialog.getBoundingClientRect();
    if (event.target === bioDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) bioDialog.close();
  });
  bioDialog.addEventListener("close", () => {
    document.body.classList.remove("bio-dialog-open");
    trigger?.focus({ preventScroll: true });
  });
}
