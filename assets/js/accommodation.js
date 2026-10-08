const gallery = document.querySelector("[data-hotel-gallery]");

if (gallery) {
  const thumbnails = [...gallery.querySelectorAll(".hotel-gallery-thumbnail")];
  const track = gallery.querySelector("[data-gallery-track]");
  const status = gallery.querySelector("[data-gallery-status]");
  const carousel = gallery.querySelector(".hotel-gallery-carousel");
  const thumbnailStrip = gallery.querySelector(".hotel-gallery-thumbnails");
  const slides = thumbnails.map((thumbnail, index) => {
    const slide = thumbnail.cloneNode(true);
    slide.className = "hotel-gallery-preview";
    slide.removeAttribute("aria-current");
    slide.setAttribute("aria-label", `Open photo ${index + 1} at full size (opens in a new tab)`);
    return slide;
  });
  track.replaceChildren(...slides);
  let current = 0;

  const showPhoto = (index) => {
    current = (index + thumbnails.length) % thumbnails.length;
    const thumbnail = thumbnails[current];
    const description = thumbnail.querySelector("img").alt;
    status.textContent = `Photo ${current + 1} of ${thumbnails.length}: ${description}`;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
      slide.tabIndex = slideIndex === current ? 0 : -1;
      slide.setAttribute("aria-hidden", String(slideIndex !== current));
    });
    slides[current].querySelector("img").loading = "eager";
    slides[(current + 1) % slides.length].querySelector("img").loading = "eager";
    thumbnails.forEach((item, itemIndex) => {
      if (itemIndex === current) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });
    const selected = thumbnails[current];
    const left = selected.offsetLeft - thumbnailStrip.offsetLeft;
    if (left < thumbnailStrip.scrollLeft || left + selected.offsetWidth > thumbnailStrip.scrollLeft + thumbnailStrip.clientWidth) {
      thumbnailStrip.scrollTo({ left: left - (thumbnailStrip.clientWidth - selected.offsetWidth) / 2, behavior: "smooth" });
    }
  };

  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      showPhoto(index);
    });
  });

  gallery.querySelector("[data-gallery-previous]").addEventListener("click", () => showPhoto(current - 1));
  gallery.querySelector("[data-gallery-next]").addEventListener("click", () => showPhoto(current + 1));
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(current + (event.key === "ArrowRight" ? 1 : -1));
    }
  });

  let touchStartX = null;
  track.addEventListener("touchstart", (event) => {
    touchStartX = event.touches.length === 1 ? event.touches[0].clientX : null;
  }, { passive: true });
  track.addEventListener("touchend", (event) => {
    if (touchStartX !== null && event.changedTouches.length === 1) {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 50) {
        showPhoto(current + (distance < 0 ? 1 : -1));
      }
    }
    touchStartX = null;
  }, { passive: true });
  track.addEventListener("touchcancel", () => {
    touchStartX = null;
  }, { passive: true });
  let paused = false;
  carousel.addEventListener("mouseenter", () => {
    paused = true;
  });
  carousel.addEventListener("mouseleave", () => {
    paused = false;
  });
  gallery.addEventListener("focusin", () => {
    paused = true;
  });
  gallery.addEventListener("focusout", (event) => {
    if (!gallery.contains(event.relatedTarget)) {
      paused = false;
    }
  });
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.setInterval(() => {
      if (!paused && !document.hidden) {
        showPhoto(current + 1);
      }
    }, 5000);
  }
  gallery.querySelector("[data-gallery-controls]").hidden = false;
  showPhoto(0);
}
