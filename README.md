# CricGuess 🏏

**A free cricketer guessing game. Identify the mystery player from 6 progressive clues.**

[**▶ Play now: cricguess.netlify.app**](https://cricguess.netlify.app/)

CricGuess is a Wordle-style quiz for cricket fans. Each puzzle starts with the hardest clue (debut year, matches played) and gets easier with every wrong guess, ending with records, nicknames and jersey numbers. Solve it in as few guesses as you can, build a win streak, and share your result as an emoji grid.

It is built with semantic HTML5, vanilla CSS design tokens and native ES modules. There are no frameworks, no build step and no backend, so it deploys as plain static files.

---

## How to play

1. **Read Clue 1.** It is the hardest one: debut year, total international matches, or early career facts.
2. **Submit a guess.** Search for any cricketer in the autocomplete box. A wrong guess uses up an attempt and unlocks the next, easier clue.
3. **Solve it in 6 guesses.** Identify the player, extend your streak and share your score grid.

| Mode | Description |
| --- | --- |
| 📅 **Daily Challenge** | One mystery cricketer per day, the same for everyone worldwide. Resets at midnight IST (UTC+5:30). |
| ♾️ **Unlimited Practice** | Endless rounds with country, role and era filters. A no-repeat pool means you don't see the same player twice until the pool is exhausted. |

Results are shared as emoji grids (`🟩🟥⬜`) through the Web Share API, with a one-click clipboard fallback.

---

## Features

- **Progressive clues:** 6 difficulty tiers, from hardest to easiest.
- **Deterministic daily puzzle:** the daily player is picked with a seeded PRNG (Mulberry32) keyed on the IST date (`YYYY-MM-DD`). Everyone gets the same puzzle without a server.
- **Stats tracking:** games played, win streaks and guess distribution, stored privately in your browser's `localStorage`.
- **Dark mode:** follows your system theme, with a manual toggle.
- **Accessible and responsive:** mobile-first layout, keyboard-navigable autocomplete, focus-trapped dialogs.
- **Plugin-based game modes:** add a new mode without touching the core engine (see [Adding a game mode](#adding-a-game-mode)).
- **Content pages:** How to Play, About, Contact, Privacy Policy, Terms and a small cricket blog.
- **Ad-ready (optional):** AdSense slots with reserved heights to avoid layout shift, a cookie consent banner, `ads.txt` and `sitemap.xml`.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Markup | Semantic HTML5 |
| Styling | Vanilla CSS with design tokens, split into base, layout, components and per-mode files |
| Scripting | Native ES modules (no bundler, no transpiler) |
| Data | A static `data/players.json` of 120+ curated international cricketers |
| Persistence | Namespaced, schema-versioned `localStorage` with an in-memory fallback |
| Tests | Node's built-in `node:assert` (no test framework) |
| Hosting | Static hosting on Netlify (also works on Cloudflare Pages and GitHub Pages) |

---

## Getting started

You only need a way to serve files over HTTP, because ES modules don't load from `file://`.

```bash
git clone https://github.com/divyanshshrivastava/Cricguess.git
cd Cricguess
```

Then use any one of these:

```bash
# Option 1: the bundled Node server (http://localhost:3000)
node server.js

# Option 2: npx serve
npx serve .

# Option 3: Python (http://localhost:8000)
python -m http.server 8000
```

---

## Running the tests

The tests are plain Node scripts. Each one exits non-zero on failure.

```bash
node tests/test-daily-seed.js          # deterministic seeding and puzzle numbers
node tests/test-unlimited-norepeat.js  # no-repeat selection and pool replenishment
node tests/test-storage-namespace.js   # storage namespacing and in-memory fallback
node tests/test-registry.js            # every mode satisfies the GameMode contract
```

---

## Project structure

```
Cricguess/
├── index.html · daily.html · unlimited.html     # game pages
├── how-to-play.html · about.html · contact.html # content pages
├── privacy-policy.html · terms.html
├── blog/                                        # SEO blog articles
├── data/players.json                            # curated cricketer dataset
├── css/
│   ├── base.css · layout.css                    # tokens, dark mode, layout
│   ├── components/                              # buttons, modals, clue cards, charts...
│   └── modes/                                   # per-mode scoped styles
├── js/
│   ├── config.js                                # constants and feature flags
│   ├── app.js                                   # bootstrap and mode lifecycle
│   ├── core/                                    # data service, autocomplete, router, share, theme, SEO
│   ├── services/                                # storage, stats, seeded RNG, IST date utils
│   ├── ui/                                      # toast, modal, confetti, countdown, cookie consent
│   └── modes/                                   # plugin modes + registry.js
├── tests/                                       # Node test scripts
├── docs/ARCHITECTURE.md                         # full design guide
├── server.js                                    # tiny local static server
├── _redirects                                   # Netlify routing rules
└── manifest.json · sitemap.xml · robots.txt · ads.txt
```

For a deeper walkthrough, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Adding a game mode

Every mode is an isolated ES module that talks to the app only through a `ModeContext` (data, storage, stats, events, UI helpers, config). Adding one takes five steps and no changes to existing modes:

1. **Create the module** at `js/modes/my-mode.js` and `export default` an object implementing the `GameMode` interface (`id`, `name`, `description`, `icon`, `route`, `seo`, plus `init`, `start`, `getPuzzle`, `handleGuess`, `render`, `onEnd`, `destroy`, `getShareText`).
2. **Register it** in `js/modes/registry.js`:
   ```js
   {
     id: 'my-mode',
     name: 'My Mode',
     description: 'One-line rules.',
     icon: '👑',
     route: 'my-mode',
     enabled: true,
     loader: () => import('./my-mode.js'),
   }
   ```
3. **Add scoped styles** in `css/modes/my-mode.css`, nested under `.mode-my-mode`.
4. *(Optional)* **Add a page** such as `my-mode.html` containing `<div data-mode-mount data-mode="my-mode"></div>`.
5. **Verify the contract** with `node tests/test-registry.js`.

The full interface spec is in [`js/modes/MODE_INTERFACE.md`](js/modes/MODE_INTERFACE.md). `js/modes/blitz.js` is a disabled example third mode to copy from.

---

## Deployment

CricGuess is static, so leave the **build command empty** and publish the repository root.

**Netlify** (current host)
1. Connect the repo.
2. Build command: *(blank)*. Publish directory: `.`
3. Deploy.

**Cloudflare Pages:** Workers & Pages → Create → Pages → select the repo, no build command, output directory `/`.

**GitHub Pages:** Settings → Pages → deploy from branch `main`, folder `/ (root)`.

### Optional: enabling AdSense

1. In `js/config.js`, set your publisher ID and enable ads:
   ```js
   export const ADSENSE = {
     publisherId: 'ca-pub-YOUR_ACTUAL_ID',
     enabled: true,
   };
   ```
2. In `ads.txt`, replace the placeholder with your ID:
   ```
   google.com, pub-YOUR_ACTUAL_ID, DIRECT, f08c47fec0942fa0
   ```
3. Update the production domain in `js/config.js` and `sitemap.xml`.

---

## Contributing

Found a wrong clue or a missing player? Contributions are welcome:

- **Data fixes:** edit `data/players.json` and open a pull request, or use the contact page on the site.
- **New modes or features:** follow [Adding a game mode](#adding-a-game-mode) and make sure all four test scripts pass.
- **Bugs:** open an issue with your browser, device and steps to reproduce.

---

## Disclaimer and license

CricGuess is an independent trivia game for cricket fans. It is not affiliated with the ICC, the BCCI or any national cricket board. Player statistics and trivia are historical facts, referenced for educational and quiz purposes.

Made with 🏏 by [Divyansh Shrivastava](https://github.com/divyanshshrivastava).
