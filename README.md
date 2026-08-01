# Sushrut Kane — Developer Portfolio

A personal portfolio built around an editorial, warm-paper aesthetic — big
typography, a single confident accent, and a lot of motion. No dark-glass
templates here; every section is hand-composed.

**Live:** portfolio-hazel-mu-19.vercel.app

---

## Highlights

- **Editorial design system** — Fraunces (display serif), Space Grotesk (body),
  and JetBrains Mono (labels) on a warm cream palette with a vermilion accent and
  a dark contrast section for the work showcase.
- **Motion, everywhere (tastefully)**
  - Smooth scrolling with [Lenis](https://github.com/darkroomengineering/lenis)
  - Preloader counter → hero reveal
  - Custom cursor with contextual hover labels + magnetic buttons
  - Masked word / line text reveals on scroll (custom splitter, no paid plugins)
  - Marquees that react to scroll velocity (speed + skew)
  - Interactive "Selected Work" list with a preview image that follows the cursor
  - Count-ups, animated nav, scroll progress bar, section highlighting
- **Accessible & resilient** — respects `prefers-reduced-motion`, degrades
  gracefully if any CDN fails, and swaps the hover-preview list for a tappable
  list on touch devices.

---

## Tech

- **HTML / CSS / JavaScript** (no framework, no build step)
- **[GSAP](https://gsap.com/) + ScrollTrigger** for animation
- **[Lenis](https://github.com/darkroomengineering/lenis)** for smooth scroll

---

## Project structure

```text
portfolio/
├── index.html     # Markup & content
├── style.css      # Editorial design system + responsive rules
├── script.js      # Lenis + GSAP motion system
└── *.png          # Project screenshots
```

## Run locally

```bash
git clone https://github.com/Sushrut-Kane/portfolio.git
cd portfolio

# Any static server works, e.g.:
python -m http.server 5510
# then open http://127.0.0.1:5510/
```

A server is recommended over opening the file directly so the CDN scripts and
local images load cleanly.

---

## Customize

- **Email** — update the `mailto:` address in the Contact section of
  `index.html` (search for `hello@sushrutkane.dev`).
- **Accent / palette** — tweak the CSS custom properties under `:root` in
  `style.css`.
- **Rotating role words** — edit the `words` array in `script.js`.
