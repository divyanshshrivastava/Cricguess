# CricGuess 🏏

A production-ready, modular cricket guessing game built entirely with modern semantic HTML5, vanilla CSS design tokens, and native ES modules (ESM). No frameworks, no build step, no backend required. Deploys as static files directly to **Cloudflare Pages**, **Netlify**, or **GitHub Pages**.

---

## 🌟 Key Features

- **Progressive Clue Deduction:** Guess the mystery cricketer from 6 clues ranging from hardest (debut year, match count) to easiest (records, nicknames, jersey numbers).
- **Daily Challenge Mode:** One mystery cricketer per day worldwide, deterministically synchronized at midnight IST (UTC+5:30).
- **Unlimited Practice Mode:** Endless guessing with country, role, and era filters, featuring smart no-repeat pool selection.
- **Pluggable Architecture:** Add new game modes in 5 simple steps without modifying core engine logic.
- **Rich Cricket-Themed Design System:** Pitch green, leather red, and stump gold palette with built-in Dark Mode and smooth micro-animations.
- **Accessible & Responsive:** Fully responsive mobile-first UI with keyboard-navigable autocomplete and focus-trapped dialogs.
- **Shareable Results:** Generates clean emoji score grids (`🟩🟥⬜`) compatible with the Web Share API and one-click clipboard copying.
- **Google AdSense Monetization Ready:**
  - Policy-safe ad slot components with reserved height to eliminate Cumulative Layout Shift (CLS).
  - Pre-configured `ads.txt` and `sitemap.xml`.
  - GDPR / ePrivacy compliant cookie consent banner with localStorage persistence.
  - Required content pages: Privacy Policy, Terms of Service, About, Contact, and 3 full-length SEO blog articles.
- **Local Storage Persistence:** Tracks games played, win streaks, guess distribution charts, and in-progress daily state privately in the user's browser.

---

## 🚀 Running Locally

Because CricGuess uses standard ES modules, it should be served over HTTP rather than `file://` to allow module fetching.

### Option 1: Using Node (`npx serve`)
```bash
npx serve .
```

### Option 2: Using Python
```bash
# Python 3
python -m http.server 8000
```

Open your browser and navigate to `http://localhost:3000` (or `http://localhost:8000`).

---

## 🧪 Running Automated Tests

A comprehensive suite of test scripts validates core logic using Node's built-in `node:assert`:

```bash
# Test deterministic daily seeding and puzzle numbers
node tests/test-daily-seed.js

# Test unlimited mode no-repeat selection and pool replenishment
node tests/test-unlimited-norepeat.js

# Test storage namespacing and in-memory fallbacks
node tests/test-storage-namespace.js

# Test that all modes implement the GameMode plugin contract
node tests/test-registry.js
```

---

## 🌐 Deploying to Production

### Cloudflare Pages
1. Push your repository to GitHub or GitLab.
2. In Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages**.
3. Select your repository.
4. Leave **Build command** empty.
5. Set **Build output directory** to `/` (root).
6. Click **Save and Deploy**.

### Netlify
1. Connect your repository to Netlify.
2. Leave **Build command** blank.
3. Set **Publish directory** to `.` or leave empty.
4. Deploy!

### GitHub Pages
1. Go to repository **Settings** > **Pages**.
2. Under **Source**, select `Deploy from a branch`.
3. Choose branch `main` and folder `/ (root)`.
4. Click **Save**.

---

## 💰 AdSense Setup Checklist

1. **Update Publisher ID:**
   Open `js/config.js` and set:
   ```javascript
   export const ADSENSE = {
     publisherId: 'ca-pub-YOUR_ACTUAL_ID',
     enabled: true,
   };
   ```
2. **Update `ads.txt`:**
   In `ads.txt`, replace `pub-XXXXXXXXXXXXXXXX` with your approved publisher ID:
   ```
   google.com, pub-YOUR_ACTUAL_ID, DIRECT, f08c47fec0942fa0
   ```
3. **Verify Domain in `config.js` and `sitemap.xml`:**
   Replace `https://cricguess.com` with your production domain.

---

## 📂 Project Architecture

Read the full design guide and plugin specification in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and [`js/modes/MODE_INTERFACE.md`](./js/modes/MODE_INTERFACE.md).

---

## 📜 License

Created for cricket fans worldwide. Cricket player statistics and trivia are public domain historical facts referenced under nominative fair use for educational and quiz purposes.
