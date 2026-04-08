const renderSiteChrome = () => {
  const navMount = document.querySelector("[data-site-nav]");
  const footerMount = document.querySelector("[data-site-footer]");

  if (navMount) {
    navMount.innerHTML = `
      <nav class="navbar navbar-expand-lg sticky-top site-navbar" aria-label="Primary">
        <div class="container">
          <a class="navbar-brand d-inline-flex align-items-center text-decoration-none" href="index.html">
            <span>
              WCNH2027
              <small>Conference Website</small>
            </span>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#siteNav" aria-controls="siteNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <!-- Note: This will be enabled once the full site is built out with all pages, to avoid confusion during development with multiple navbars visible
          <div class="collapse navbar-collapse" id="siteNav">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <li class="nav-item"><a class="nav-link" href="programme.html" data-nav-link>Programme</a></li>
              <li class="nav-item"><a class="nav-link" href="registration.html" data-nav-link>Registration</a></li>
              <li class="nav-item"><a class="nav-link" href="symposia.html" data-nav-link>Symposia</a></li>
              <li class="nav-item"><a class="nav-link" href="abstracts.html" data-nav-link>Abstracts</a></li>
              <li class="nav-item"><a class="nav-link" href="awards.html" data-nav-link>Awards</a></li>
              <li class="nav-item"><a class="nav-link" href="sponsorships.html" data-nav-link>Sponsorships</a></li>
            </ul>
            <a class="btn btn-primary ms-lg-3 mt-3 mt-lg-0" href="registration.html#register">Register</a>
          </div>
          -->
        </div>
      </nav>
    `;
  }

  if (footerMount) {
    footerMount.innerHTML = `
      <footer class="site-footer pt-5 pb-4">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-xl-10">
              <div class="d-flex flex-column flex-md-row align-items-center justify-content-center text-center text-md-start gap-4">
                <img
                  src="assets/img/logo-square.svg"
                  alt="WCNH 2027 logo"
                  width="160"
                  height="160"
                  style="width: 160px; height: auto;"
                >
                <div class="d-flex flex-column align-items-center text-center gap-2">
                  <p class="mb-0">World Congress on Neurohypophysial Hormones (WCNH) 2027</p>
                  <p class="mb-0"><a href="mailto:info@wcnh2027.com">info@wcnh2027.com</a></p>
                  <p class="mb-0 small">
                    <a href="index.html">Home</a> |
                    <a href="privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> |
                    <a href="mailto:info@wcnh2027.com">Contact Us</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="footer-bottom mt-4 pt-4 text-center">
            <p class="mb-0 small">&copy;<span data-current-year></span> Website by the WCNH 2027 Organizing Committee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderSiteChrome();

  const navbar = document.querySelector(".site-navbar");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const yearTargets = document.querySelectorAll("[data-current-year]");
  const countdown = document.querySelector("[data-countdown-date]");
  const revealItems = document.querySelectorAll(".reveal-on-scroll");

  const updateNavbarState = () => {
    if (!navbar) {
      return;
    }

    navbar.classList.toggle("scrolled", window.scrollY > 16);
  };

  updateNavbarState();
  window.addEventListener("scroll", updateNavbarState, { passive: true });

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href");

    if (href === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const targetId = anchor.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  yearTargets.forEach((target) => {
    target.textContent = String(new Date().getFullYear());
  });

  if (revealItems.length > 0) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("reveal-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -10% 0px",
        }
      );

      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("reveal-visible"));
    }
  }

  if (countdown) {
    const countdownDate = countdown.dataset.countdownDate;
    const fields = {
      days: countdown.querySelector('[data-countdown-field="days"]'),
      hours: countdown.querySelector('[data-countdown-field="hours"]'),
      minutes: countdown.querySelector('[data-countdown-field="minutes"]'),
      seconds: countdown.querySelector('[data-countdown-field="seconds"]'),
    };
    const conferenceDate = new Date(countdownDate);

    const updateCountdown = () => {
      const now = new Date();
      const difference = conferenceDate.getTime() - now.getTime();

      if (Number.isNaN(conferenceDate.getTime())) {
        return;
      }

      if (difference <= 0) {
        Object.values(fields).forEach((field) => {
          if (field) {
            field.textContent = "00";
          }
        });
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const values = { days, hours, minutes, seconds };

      Object.entries(values).forEach(([key, value]) => {
        if (fields[key]) {
          fields[key].textContent = String(value).padStart(2, "0");
        }
      });
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }
});
