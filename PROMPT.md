# PROMPT.md — Initial Build Prompt for Codex

## Prompt

Read AGENT.md first, then build the complete WCNH conference website scaffold.

Create all files as specified in the AGENT.md file structure. Build every page fully — not just stubs — with realistic placeholder content throughout. Each page should feel like a real conference website that's waiting for final content to be dropped in.

### Page-by-page requirements:

**index.html (Landing Page)**
- Hero section: conference name "WCNH 2026", tagline placeholder, dates "[15–18 September 2026]", location "[University of Cambridge, UK]"
- Brief overview section: 2-3 paragraphs of placeholder text describing the conference theme and scope
- Important dates timeline: vertical timeline component with 5-6 milestones (symposia deadline, abstract deadline, early bird registration, programme release, conference dates). Style with CSS, not an image.
- Organising committee section: grid of cards with name, role, institution, and placeholder photo box for 6-8 committee members
- Sponsor logo strip at the bottom: row of placeholder boxes representing sponsor logos

**programme.html (Programme)**
- Scientific programme outline section: placeholder schedule grid/table showing a 4-day programme overview (day, time blocks, session types)
- Plenary speakers section: featured cards for 3-4 keynote speakers with photo placeholder, name, institution, talk title, and short bio
- Symposia section: accordion or card-based listing of 4-5 symposia, each with title, abstract paragraph, chair name, and a list of 3-4 talks (talk title, speaker name, abstract snippet)
- Social programme section: cards or timeline for 2-3 social events (welcome reception, conference dinner, excursion) with date, time, venue, description

**registration.html (Registration, Venue & Travel)**
- Registration section: fee table (early bird / standard / student rates), what's included list, deadline info, and a prominent CTA button labelled "Register Now" linking to "#" with a comment noting this will link to an external registration service
- Venue section: info about the venue with an embedded Google Maps iframe placeholder (use a real embed of Cambridge, UK), photos placeholder boxes, facilities info
- Travel section: cards or sections for "Getting Here" (by air, rail, car), local transport, and accommodation recommendations with 3-4 hotel suggestions (name, distance, price range, link placeholder)

**symposia.html (Symposia Proposals)**
- Guidelines section: detailed placeholder text explaining eligibility, format requirements, evaluation criteria, and deadlines
- Submission section: intro text explaining the process, then either an embedded Google Form iframe (use a placeholder `src` with a comment explaining a real Google Form URL goes here) or a styled "Submit Your Proposal" button linking to "#". List the required fields as a reference: symposium title, organiser names & affiliations, symposium abstract, proposed speakers with talk titles, and preferred session length.

**abstracts.html (Abstract Submissions)**
- Guidelines section: word limits, formatting requirements, topic categories, review process, deadlines
- Submission section: same approach as symposia — embedded form placeholder or CTA button. List required fields: title, presenting author (name, email, institution), co-authors, abstract text (max 300 words), references, preference for oral or poster presentation.

**awards.html (Awards)**
- A clean "coming soon" style page that fits the overall site design
- Placeholder section suggesting award categories (best oral presentation, best poster, early career researcher award) with "Details to be confirmed" messaging
- Don't make it look broken or empty — make it look intentionally teased

**sponsorships.html (Sponsorships)**
- "Why Sponsor" section: benefits of sponsoring, expected attendance, audience profile
- Sponsorship tiers: 3-4 tiers (Platinum, Gold, Silver, Bronze) as cards or a comparison table, with benefits per tier and price placeholders
- Current sponsors section: grid of placeholder sponsor cards grouped by tier
- Contact section: CTA to get in touch about sponsorship opportunities

### Shared components:

**Navbar**
- Logo placeholder (text-based "WCNH 2026" is fine) on the left
- Nav links: Home, Programme, Registration, Symposia, Abstracts, Awards, Sponsorships
- "Register" button (styled differently from nav links, e.g. `btn-primary`) on the right
- Active state on current page — use a simple JS snippet or just set the class manually per page

**Footer**
- 3-column layout: contact info & email, quick links, social media links (placeholder hrefs)
- Sponsor logo strip (small versions)
- Copyright line with current year

**assets/css/style.css**
- CSS custom properties for the colour palette in `:root`
- Custom styles for: hero section, timeline component, speaker cards, sponsor grid, section spacing
- Responsive adjustments beyond what Bootstrap provides
- Placeholder image box styling (coloured rectangles with centred text)

**assets/js/main.js**
- Navbar scroll behaviour (e.g. add shadow on scroll)
- Active nav link highlighting based on current page filename
- Smooth scroll for any anchor links
- Optional: simple fade-in-on-scroll for sections using IntersectionObserver
- Countdown timer to conference date on the hero section

Build everything in one pass. Every page should be complete, navigable, and visually cohesive. When I open index.html in a browser, I should see a professional conference website that looks ready for content.