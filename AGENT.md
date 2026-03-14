# AGENT.md — WCNH Conference Website

## Project Overview

Static multi-page conference website for WCNH (academic/scientific conference). Built with Bootstrap 5, HTML, CSS, and vanilla JavaScript. Hosted on GitHub Pages — no server-side code, no build tools, no frameworks beyond Bootstrap.

## Tech Stack & Constraints

- **HTML5, CSS3, vanilla JS only** — no React, no Vue, no TypeScript, no bundlers
- **Bootstrap 5.3.x** via CDN (both CSS and JS bundle)
- **Bootstrap Icons** via CDN for iconography
- **Google Fonts** — one or two professional fonts (e.g. Inter for body, Playfair Display for headings)
- **No backend** — all forms are embedded Google Forms via iframe or link out to external services
- **No npm, no node_modules, no package.json** — this is a pure static site
- **GitHub Pages compatible** — no server-side processing, relative paths throughout, no trailing slashes required
- **All assets in an `/assets` directory** — subdirectories: `/assets/css`, `/assets/js`, `/assets/img`, `/assets/img/speakers`, `/assets/img/sponsors`

## File Structure

```
/
├── index.html                  # Landing page
├── programme.html              # Scientific & social programme
├── registration.html           # Registration, venue & travel
├── symposia.html               # Symposia proposal guidelines & form
├── abstracts.html              # Abstract submission guidelines & form
├── awards.html                 # Awards (TBC placeholder)
├── sponsorships.html           # Sponsor info & sponsor listing
├── AGENT.md
├── PROMPT.md
└── assets/
    ├── css/
    │   └── style.css           # Custom styles (overrides and extensions to Bootstrap)
    ├── js/
    │   └── main.js             # Minimal JS — navbar behaviour, countdown, scroll effects
    └── img/
        ├── logo-placeholder.png
        ├── speakers/           # Speaker headshots
        └── sponsors/           # Sponsor logos
```

## Design Conventions

### Layout
- Shared navbar across all pages with active state highlighting based on current page
- Shared footer across all pages with contact info, social links, copyright, and sponsor logo strip
- Use Bootstrap's grid system consistently — `container` or `container-lg` for content width
- Sections within pages separated with alternating subtle background colours (white / light grey)
- Generous vertical padding on sections (`py-5` minimum)
- Mobile-first responsive design — must look good on phone, tablet, and desktop

### Visual Style
- Professional, clean, academic tone — not flashy startup aesthetic
- Primary colour palette: define as CSS custom properties in `:root` and use throughout
- Cards for speakers, symposia, sponsors — consistent card styling
- Timeline component on landing page for important dates (CSS-based, vertical on mobile, horizontal on desktop)
- Hero section on landing page with conference name, dates, location, and a subtle background pattern or gradient (no stock photo dependency)

### Typography
- Body: 16px base, clean sans-serif (Inter or similar)
- Headings: serif or display font for contrast (Playfair Display or similar)
- Consistent heading hierarchy — h1 for page titles, h2 for sections, h3 for subsections

### Navigation
- Sticky/fixed-top Bootstrap navbar
- Collapses to hamburger on mobile
- Clear visual indicator of current page
- No dropdowns unless a page has many subsections — prefer flat navigation

### Content Approach
- **All content is placeholder** — use realistic but clearly fake text
- Speaker names: use "Prof. [First] [Last]" style placeholders, e.g. "Prof. Jane Smith"
- Abstracts: use lorem ipsum or realistic academic-style placeholder text
- Dates: use realistic future dates, clearly marked as placeholder with `[TBC]` or similar
- Images: use solid colour placeholder divs with text labels (e.g. "Speaker Photo") rather than broken image links
- Mark all placeholder content with an HTML comment `<!-- PLACEHOLDER -->` above it so it's easy to find and replace later

### Forms & Interactive Elements
- Symposia proposal form: embed Google Form via responsive iframe, or link to external Google Form with a styled button. Include guidelines text above.
- Abstract submission form: same approach — embedded Google Form or external link with guidelines.
- Registration: link to external registration/payment service (Eventbrite, Stripe payment link, or Google Form) with a prominent call-to-action button. Include registration info (fees, deadlines, what's included) as static content above.
- No custom form validation, no custom form handling, no JavaScript form processing

### Accessibility
- Semantic HTML throughout (`nav`, `main`, `section`, `article`, `footer`)
- Alt text on all images (placeholder alt text is fine)
- Sufficient colour contrast (WCAG AA minimum)
- Skip-to-content link
- Proper heading hierarchy — no skipping levels

### Performance
- No unnecessary JS libraries
- Minimal custom CSS — leverage Bootstrap utilities where possible
- Lazy-load images where appropriate (`loading="lazy"`)
- No animations that serve no purpose — subtle fade-ins on scroll are acceptable but not required

## Code Style

- 2-space indentation in HTML, CSS, and JS
- HTML attributes: double quotes
- CSS: use custom properties for colours and key spacing values
- JS: `const`/`let` only, no `var`; use vanilla DOM APIs, no jQuery
- Comments in code for major sections and any non-obvious logic
- Each HTML page should be self-contained (shared CSS/JS via linked files, but no templating engine)

## What NOT To Do

- Do not add a backend, database, or server-side code
- Do not use npm, webpack, vite, or any build tooling
- Do not add login/authentication functionality
- Do not use jQuery
- Do not use placeholder image services that require network requests (e.g. placeholder.com) — use CSS placeholder boxes instead
- Do not hardcode absolute paths — all links must be relative for GitHub Pages
- Do not create a single-page app — each page is a separate HTML file
- Do not over-engineer — this is a content site with embedded forms, not a web application