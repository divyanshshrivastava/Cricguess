# CricGuess — Architectural Design & Extension Guide

CricGuess is engineered as a zero-build, modular web application using modern ES modules (ESM), semantic HTML5, and vanilla CSS design tokens. It has zero external framework dependencies, no backend, and deploys as static assets on Cloudflare Pages, Netlify, or GitHub Pages.

---

## 1. Directory Structure

```
cricguess/
├── index.html                      # Hub / mode launcher + embedded daily player
├── daily.html                      # Standalone daily challenge page
├── unlimited.html                  # Standalone unlimited practice page
├── how-to-play.html                # Rules, clue breakdown, and FAQ (Schema.org)
├── about.html                      # Background, mission, data curation
├── contact.html                    # Feedback & player corrections
├── privacy-policy.html             # AdSense, GDPR & CCPA disclosures
├── terms.html                      # Fair play & IP terms
├── manifest.json                   # Web app manifest
├── sitemap.xml                     # Search engine sitemap
├── robots.txt                      # Crawler directives
├── ads.txt                         # AdSense digital seller authorization
│
├── data/
│   └── players.json                # 120+ curated international cricketers
│
├── css/
│   ├── base.css                    # Design tokens, dark mode, resets, animations
│   ├── layout.css                  # Grid layout, sticky headers, responsive containers
│   ├── components/                 # Atomic UI component styles
│   │   ├── autocomplete.css
│   │   ├── button.css
│   │   ├── modal.css
│   │   ├── toast.css
│   │   ├── stats-chart.css
│   │   ├── countdown.css
│   │   ├── clue-card.css
│   │   ├── attempt-indicator.css
│   │   ├── progress-bar.css
│   │   ├── cookie-consent.css
│   │   └── ad-slot.css
│   └── modes/                      # Scoped styles for individual modes
│       ├── daily.css
│       ├── unlimited.css
│       └── blitz.css
│
├── js/
│   ├── config.js                   # App constants, schema versions, feature flags
│   ├── app.js                      # Bootstrap, routing, mode lifecycle manager
│   ├── core/                       # Shared platform modules
│   │   ├── data-service.js         # Player queries, fuzzy search, random filtering
│   │   ├── autocomplete.js         # Accessible dropdown with keyboard navigation
│   │   ├── clue-renderer.js        # 6 progressive difficulty tiers
│   │   ├── attempt-renderer.js     # 🟩/🟥 attempt badges & progress bar
│   │   ├── modal.js                # Focus-trapped modal manager
│   │   ├── theme-manager.js        # Dark/light mode with system sync
│   │   ├── share.js                # Web Share & clipboard formatting
│   │   ├── event-bus.js            # Pub/sub event emitter
│   │   ├── router.js               # Route resolution & active nav updates
│   │   └── seo.js                  # Dynamic meta tags & JSON-LD injection
│   ├── services/                   # Business logic services
│   │   ├── storage.js              # Namespaced localStorage with schema versioning
│   │   ├── stats-service.js        # Games, win streaks, guess distribution
│   │   ├── seeded-rng.js           # Mulberry32 PRNG for deterministic daily puzzles
│   │   └── date-utils.js           # IST midnight sync & countdown calculations
│   ├── ui/                         # UI factories
│   │   ├── modal-component.js
│   │   ├── toast.js
│   │   ├── button.js
│   │   ├── stat-chart.js
│   │   ├── countdown.js
│   │   ├── confetti.js
│   │   ├── cookie-consent.js
│   │   └── ad-slot.js
│   └── modes/                      # Plugin architecture
│       ├── MODE_INTERFACE.md       # Plugin contract specification
│       ├── registry.js             # Central mode registration
│       ├── daily.js                # Daily Challenge mode
│       ├── unlimited.js            # Unlimited Practice mode
│       └── blitz.js                # Example disabled third mode
│
├── tests/
│   ├── test-daily-seed.js          # Deterministic seed & puzzle number tests
│   ├── test-unlimited-norepeat.js  # Verification of no duplicate players
│   ├── test-storage-namespace.js   # Isolated storage and memory fallback tests
│   └── test-registry.js            # Interface contract compliance tests
│
└── blog/
    ├── index.html                  # Blog index
    ├── top-10-odi-batting-records.html
    ├── history-of-the-ipl.html
    └── cricket-quiz-tips.html
```

---

## 2. Core Architectural Principles

1. **Plugin-Driven Game Modes**: Every game mode is completely decoupled from the main app. Game modes only interact with the system through the standardized `ModeContext`.
2. **Zero Framework Dependencies**: No build tool (Vite, Webpack, etc.) is required. Native ES modules load directly in all modern browsers.
3. **Deterministic Daily Rotation**: Daily puzzles use Mulberry32 seeded by IST calendar date (`YYYY-MM-DD`). Every player worldwide receives the exact same puzzle on the same day without requiring a central server.
4. **AdSense Compliance & CLS Prevention**: Ad slots enforce explicit minimum dimensions and load placeholder visuals until user cookie consent is provided.

---

## 3. How to Add a New Game Mode in 5 Steps

Adding a new game mode (e.g. `ipl-quiz` or `legend-mode`) requires zero modifications to existing mode code:

### Step 1: Create the Mode Module
Create `js/modes/legend-mode.js` implementing the `GameMode` interface:
```javascript
const legendMode = {
  id: 'legend-mode',
  name: 'Legends Only',
  description: 'Guess cricketers who debuted before 2000.',
  icon: '👑',
  route: 'legends',
  seo: { title: 'Legends Cricket Quiz', description: 'Classic cricketers quiz.' },
  async init(context) { /* load and filter players */ },
  render(container) { /* mount UI */ },
  handleGuess(player) { /* check guess */ },
  getPuzzle() { /* return active player */ },
  getShareText() { /* return share text */ },
  destroy() { /* clean up timers */ }
};
export default legendMode;
```

### Step 2: Register in `js/modes/registry.js`
Add an entry to `modeRegistry`:
```javascript
{
  id: 'legend-mode',
  name: 'Legends Only',
  description: 'Classic cricket era guessing.',
  icon: '👑',
  route: 'legends',
  enabled: true,
  loader: () => import('./legend-mode.js'),
}
```

### Step 3: Add Scoped Styles
Create `css/modes/legend-mode.css` scoping all styles under `.mode-legend-mode`.

### Step 4: (Optional) Add Dedicated HTML Page
Create `legends.html` with `<div data-mode-mount data-mode="legend-mode"></div>`.

### Step 5: Test Contract Compliance
Run `node tests/test-registry.js` to ensure the new mode satisfies all interface contracts!
