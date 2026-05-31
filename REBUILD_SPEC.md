# Guulp: an archive of waters — Frontend Rebuild Spec

This document is a build brief for a coding agent. It describes a near-complete
front-end rewrite of the existing **gulp** project
(https://github.com/ilovehhhyn/gulp), currently deployed on Vercel at
`gulp-tau.vercel.app`.

The goal: **keep the backend and deployment plumbing intact so Vercel does not
break, but replace almost the entire front end** with a new design and new
functionality.

---

## 0. READ THIS FIRST — Do not break the deployment

Before writing any code, **inspect the existing repo** and record the exact
contents of these files. Do **NOT** delete or restructure them blindly. They are
what makes the Vercel deployment work.

Files/folders to read and preserve (modify only as noted):

- `vercel.json` — build + routing config. **Preserve routing behavior.** If the
  app is an SPA, there must be a rewrite that sends all non-API routes to
  `index.html`. Do not remove API route handling.
- `package.json` — keep the existing `build`, `dev`, and `start` scripts and the
  existing dependency set. Add new deps only if needed (see §9).
- `vite.config.ts` and `vite.config.server.ts` — keep build output paths exactly
  as they are. The Vercel build expects output in a specific directory; do not
  change it.
- `index.html` — the SPA entry point. You may edit `<title>`, fonts, and meta
  tags, but keep the root mount `<div id="root">` (or whatever id the existing
  app mounts to — confirm by reading the file).
- `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`,
  `components.json` — keep. You may extend the Tailwind theme (colors, fonts) but
  do not remove existing config.
- `server/` — the Express/serverless API. **Keep the existing API endpoints and
  their request/response shapes.** You will reuse them, not rewrite them, unless
  §6 requires a field change.
- `shared/` — shared TypeScript types between client and server (this likely
  defines the entry/record type). **Read this first** — the data model for an
  entry lives here or in the server. Reuse it.
- `netlify/functions/` — legacy Netlify config. Ignore for Vercel; do not let it
  interfere with the Vercel build.

**Action item for the agent:** Open `shared/` and `server/` and write down the
exact shape of an "entry" object and the exact API routes (method + path +
body + response). The new front end must speak to those same routes. If a new
field is added (see §6), update the type in `shared/` and the server handler
consistently in the same commit.

If any required field is missing from the current backend, extend the existing
endpoint rather than creating a parallel one — keep the API surface minimal and
backward compatible.

---

## 1. Project overview

**Guulp** is a public web app for recording and browsing waters people drink —
water fountains, restaurant waters, creek water, etc. It is an ongoing communal
archive.

User flow:

1. **Landing page** — full-screen background image with two buttons:
   "make entry" (left) and "archive" (right).
2. **Make entry** — an ID-card form where the user enters details about a water
   and submits it.
3. **Archive** — a scrollable collection of all submitted ID cards, sorted by
   rating (highest first), on a background that gradients as you scroll.

The app is **landscape-only**: on phones the user is asked/forced to rotate to
horizontal.

The brand/aesthetic comes from the cover image (`coverwithwords.png`): soft
airbrushed pastel gradients — warm cream, peach/orange, aqua/teal, with hot
pink/red accents and a yellow title.

---

## 2. Global design system

### 2.1 Font
- Use **Source Sans Pro** for **all** text in the app (headings, body, buttons,
  form fields, everything).
- Load it via Google Fonts in `index.html`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  ```
- Set it as the default font family in `tailwind.config.ts`:
  ```ts
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans Pro"', 'sans-serif'],
      },
    },
  }
  ```
  and ensure the `<body>` uses `font-sans`. Source Sans Pro should win
  everywhere, including form inputs and buttons (inputs don't inherit font by
  default — set it explicitly).

### 2.2 Color palette
Derived from `coverwithwords.png`. Define these as Tailwind theme colors and/or
CSS variables so they're reused consistently.

| Token            | Hex       | Use |
|------------------|-----------|-----|
| `card`           | `#D0DFD6` | Buttons (landing ellipses) and ID cards — the pale sage/mint green |
| `cream`          | `#FBF3E4` | Soft warm background base (approx; sample from the image's cream corners) |
| `peach`          | `#F4A77E` | Warm accent (approx) |
| `aqua`           | `#5FD0C5` | Cool accent (approx) |
| `title-yellow`   | `#F5E000` | The yellow used for the "Guulp" title (approx) |
| `pink-light`     | `#F8D7E3` | Archive gradient start (light pink) |
| `pink-bright`    | `#F25FA0` | Archive gradient end (bright pink) |

The exact pinks for the archive gradient (§5) are design choices — `pink-light`
→ `pink-bright` above are starting values; tune to taste against the cover image.

`#D0DFD6` is the one **fixed, required** color: it is used for both the landing
buttons and the ID cards.

### 2.3 Orientation lock (landscape only)
The app must be viewed horizontally. On phones (portrait), do **not** show the
app — show a rotate-your-device overlay instead.

Implementation (CSS-first, with a JS fallback):

- Add a full-screen overlay that is shown only in portrait on small screens:
  ```css
  .rotate-notice { display: none; }

  @media (max-width: 900px) and (orientation: portrait) {
    .app-root { display: none; }
    .rotate-notice {
      display: flex;
      position: fixed;
      inset: 0;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      background: #FBF3E4;
      font-family: '"Source Sans Pro"', sans-serif;
    }
  }
  ```
- Overlay copy: something like "Please rotate your device to landscape to view
  Guulp 🌊" with a small rotating-phone icon.
- Optionally attempt `screen.orientation.lock('landscape')` inside a user
  gesture where supported, but treat it as best-effort — the CSS overlay is the
  reliable cross-browser solution. Do not rely on the lock API alone (it is not
  supported on iOS Safari).

Note: lock the experience to landscape, but the desktop experience must be
unaffected — the overlay should only trigger on small viewports in portrait.

---

## 3. Routing / app structure

Keep it an SPA. Use the router already present in the project (read
`client/` to confirm — likely React Router). Three views:

| Route        | View          |
|--------------|---------------|
| `/`          | Landing page  |
| `/entry`     | Make entry    |
| `/archive`   | Archive       |

Ensure `vercel.json` rewrites all non-API paths to `index.html` so deep links
(`/archive`, `/entry`) don't 404 on refresh. If a rewrite like this already
exists, keep it; if not, add one **without** disturbing existing API routes:

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```
Confirm against the existing `vercel.json` before changing — match its existing
schema/structure rather than overwriting wholesale.

---

## 4. Landing page (`/`)

- **Background:** full-viewport `coverwithwords.png`, covering the whole screen
  (`object-fit: cover` / `background-size: cover`, centered). Place the image
  file in the `public/` folder so it's served at `/coverwithwords.png`. (The
  image is provided separately — `coverwithwords.png`.)
- The image already contains the title "Guulp: an archive of waters" and the
  subtitle text, so **do not** re-add title text over it. The page is the image
  plus the two buttons.
- **Two buttons, as ellipses** of color `#D0DFD6`:
  - Left side of the screen: **"make entry"** → navigates to `/entry`.
  - Right side of the screen: **"archive"** → navigates to `/archive`.
  - Shape: true ellipses (wider than tall), e.g. an element with a large
    `border-radius: 50%` and an aspect ratio around 2:1 (e.g. width ~220px,
    height ~110px), vertically centered, with comfortable margins from the left
    and right edges.
  - Button label text: Source Sans Pro, lowercase to match the cover's subtitle
    styling, dark enough to read on `#D0DFD6` (e.g. a soft charcoal `#3A3A3A`).
  - Add a subtle hover state (slight scale-up and/or slight opacity/shadow
    change). Keep it gentle to match the soft aesthetic.
- Layout must remain centered and balanced in landscape across common desktop
  sizes. The buttons should sit at roughly the vertical middle, hugging the left
  and right edges with padding.

---

## 5. Make entry page (`/entry`)

A single **ID card** centered on screen where the user fills in their entry.

### 5.1 Card styling
- Rounded-corner card, fill color `#D0DFD6`.
- Centered on a soft background (use `cream` or a gentle pastel; keep it calm so
  the card stands out).
- Source Sans Pro throughout.
- Give it an ID-card feel: a header strip/label (e.g. "GUULP // water entry"),
  generous padding, soft shadow, rounded corners (~16–24px radius).

### 5.2 Fields (in this order)
All labels in Source Sans Pro, lowercase to match the aesthetic.

1. **date** — date input (`<input type="date">`). Default to today.
2. **city** — text input.
3. **name** — text input (the name of the water / fountain / place, or the
   submitter's name — keep the label simply "name" per the spec; place it as a
   single line text field).
4. **rating** — a number out of 10. Use a number input constrained to `0–10`
   (allow integers; optionally allow `.5` steps — integer is fine and simplest).
   Show "/10" next to the field so it reads "rating: __ / 10".
5. **description** — multi-line `<textarea>`.

### 5.3 Submit
- A **"send"** button (styled consistently — could be a smaller ellipse or a
  rounded pill, Source Sans Pro).
- On click:
  - Validate: rating between 0 and 10; required fields non-empty (decide
    sensible required set — at least city, name, rating).
  - POST the entry to the **existing backend endpoint** (read `server/` to get
    the exact route and body shape — see §0 and §6).
  - On success: show a brief confirmation (e.g. a small toast or a "saved!"
    state) and either clear the form or navigate to `/archive` so the user sees
    their card.
  - On error: show a non-blocking error message; do not lose the user's input.

---

## 6. Data model

Read `shared/` and `server/` to find the existing entry type. The new entry must
include these fields:

```ts
interface WaterEntry {
  id: string;          // server-generated (keep existing id strategy)
  date: string;        // ISO date string, e.g. "2026-05-31"
  city: string;
  name: string;
  rating: number;      // 0–10
  description: string;
  createdAt?: string;  // if the existing schema has a timestamp, keep it
}
```

- If the existing backend already stores some of these (it likely has at least
  some entry fields), **map onto the existing fields** rather than inventing new
  ones. Only add fields that are genuinely missing (`date`, `city`, `rating`,
  `description` as applicable).
- When you add a field, update it in **three** places consistently:
  1. `shared/` type definition,
  2. the `server/` handler that creates/reads entries,
  3. the client form + archive rendering.
- Keep the API method/path the same as today (e.g. `POST /api/entries`,
  `GET /api/entries` — confirm actual paths from the repo). Do not rename
  existing routes.

---

## 7. Archive page (`/archive`)

- Fetch all entries from the existing `GET` endpoint.
- Render every entry as an **ID card**:
  - Rounded corners, fill `#D0DFD6` (same card look as the entry page).
  - Show: name, city, date, rating ("X / 10"), and description.
  - Source Sans Pro throughout.
- **Sort: highest rating first** (descending by `rating`). For ties, a secondary
  sort by `date` (newest first) is a reasonable default.
- **Layout:** a responsive grid or column of cards, comfortable spacing, scrolls
  vertically. (Page content scrolls within the landscape viewport.)
- **Scroll-reactive background gradient:** the page background transitions from
  **lighter pink at the top → brighter pink as the user scrolls down**.
  - Implement by mapping scroll progress (0 → 1) to an interpolated background
    color between `pink-light` and `pink-bright`, OR by using a tall fixed
    gradient background (`linear-gradient(pink-light → pink-bright)`) that the
    content scrolls over so deeper scroll reveals brighter pink.
  - The simplest robust approach: a fixed full-height background
    `linear-gradient(to bottom, #F8D7E3, #F25FA0)` sized to the full scrollable
    height, so scrolling naturally moves through light → bright pink. If you want
    it tied precisely to scroll position, use a scroll listener (throttled with
    `requestAnimationFrame`) to set the background color via interpolation.
  - Keep the cards (`#D0DFD6`) legible against pink at all scroll depths.
- Include a way back to the landing page (e.g. a small "back" / "home" link or a
  Guulp wordmark in a corner). Same for the entry page.

---

## 8. Assets

- `coverwithwords.png` — the landing background. Provided separately. Put it in
  `public/` so it resolves at `/coverwithwords.png`.
- Any icons (rotate-phone icon, etc.) — use a lightweight icon set already in the
  project if present (e.g. lucide-react), otherwise inline SVG. Don't add a heavy
  icon dependency.

---

## 9. Dependencies

- Reuse what's already installed (React, the existing router, Tailwind, the
  existing data-fetching approach). Read `package.json` before adding anything.
- Add new dependencies only if necessary. If you need data fetching and there's
  no existing client, `fetch` is sufficient — don't introduce a new library.
- Do not change the package manager. The repo has both `package-lock.json` and
  `pnpm-lock.yaml`; use whichever the existing scripts/Vercel build expect
  (check `vercel.json` / project settings) and keep that one consistent.

---

## 10. Acceptance checklist

- [ ] Existing `vercel.json`, build scripts, and output dirs are intact; the app
      still builds and deploys on Vercel.
- [ ] Existing API routes and the `shared/` entry type still work; new fields
      added consistently across `shared/`, `server/`, and client.
- [ ] All text everywhere uses Source Sans Pro.
- [ ] Landing page shows `coverwithwords.png` full-screen with two `#D0DFD6`
      ellipse buttons: "make entry" (left → `/entry`), "archive" (right →
      `/archive`).
- [ ] Entry page shows an ID card (`#D0DFD6`, rounded) with fields date, city,
      name, rating (/10), description, and a "send" button that POSTs to the
      existing backend.
- [ ] Archive page lists all entries as rounded `#D0DFD6` ID cards, sorted by
      rating descending.
- [ ] Archive background gradients from lighter pink → brighter pink as the user
      scrolls.
- [ ] On phones in portrait, a rotate-to-landscape overlay is shown; desktop is
      unaffected.
- [ ] Deep links (`/entry`, `/archive`) work on refresh (SPA rewrite in place).

---

## 11. Notes for the agent

- The cover image already contains the title and subtitle text — do not duplicate
  that text in HTML on the landing page.
- Match the soft, airbrushed pastel aesthetic of the cover: gentle shadows,
  generous rounding, calm transitions. Avoid harsh borders or high-contrast UI
  chrome.
- Keep everything landscape-first in layout decisions.
- When in doubt about backend shape, **read the repo `server/` and `shared/`
  first** and conform to what exists rather than assuming.