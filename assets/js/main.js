const renderSiteChrome = () => {
  const navMount = document.querySelector("[data-site-nav]");
  const footerMount = document.querySelector("[data-site-footer]");

  if (navMount) {
    navMount.innerHTML = `
      <nav class="navbar navbar-expand-lg sticky-top site-navbar" aria-label="Primary">
        <div class="container">
          <a class="navbar-brand d-inline-flex align-items-center text-decoration-none" href="index.html">
            <span class="brand-mark" aria-hidden="true">
              <img src="assets/img/logo-square.svg" alt="">
            </span>
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
        <!-- PLACEHOLDER
          <div class="footer-sponsor-strip mb-5">
            <div class="placeholder-box placeholder-logo small-sponsor" role="img" aria-label="Footer sponsor placeholder">Sponsor</div>
            <div class="placeholder-box placeholder-logo small-sponsor" role="img" aria-label="Footer sponsor placeholder">Sponsor</div>
            <div class="placeholder-box placeholder-logo small-sponsor" role="img" aria-label="Footer sponsor placeholder">Sponsor</div>
            <div class="placeholder-box placeholder-logo small-sponsor" role="img" aria-label="Footer sponsor placeholder">Sponsor</div>
          </div>
          <div class="row g-4">
            <div class="col-lg-4">
              <h2 class="h4 mb-3">Contact</h2>
              <p>WCNH2027 Conference Secretariat<br>University of Cambridge [Placeholder Office]<br>Cambridge, United Kingdom</p>
              <p class="mb-0"><a href="mailto:hello@wcnh2027.org">hello@wcnh2027.org</a></p>
            </div>
            <div class="col-lg-4">
              <h2 class="h4 mb-3">Quick Links</h2>
              <ul class="footer-list">
                <li><a href="programme.html">Scientific Programme</a></li>
                <li><a href="registration.html">Registration, Venue &amp; Travel</a></li>
                <li><a href="symposia.html">Symposia Proposals</a></li>
                <li><a href="sponsorships.html">Sponsorship Opportunities</a></li>
              </ul>
            </div>
            <div class="col-lg-4">
              <h2 class="h4 mb-3">Social</h2>
              <ul class="footer-list">
                <li><a href="#"><i class="bi bi-linkedin me-2"></i>LinkedIn</a></li>
                <li><a href="#"><i class="bi bi-twitter-x me-2"></i>X / Twitter</a></li>
                <li><a href="#"><i class="bi bi-instagram me-2"></i>Instagram</a></li>
                <li><a href="#"><i class="bi bi-youtube me-2"></i>YouTube</a></li>
              </ul>
            </div>
          </div>
          -->
          <div class="footer-bottom mt-5 pt-4">
            <p class="mb-0 small">Copyright &copy; <span data-current-year></span> WCNH2027. Conference website for World Congress on Neurohypophyseal Hormones.</p>
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
