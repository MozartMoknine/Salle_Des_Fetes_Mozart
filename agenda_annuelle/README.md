# Agenda Bilingue A5

A bilingual (French/Arabic) A5 digital agenda generator. No build tools needed — just open `index.html` in a browser.

## Features

- Monthly calendar pages with A.M. / Soir sessions
- Year overview grid
- Customizable cover and back cover (upload your own photos)
- Color customization for weekends, A.M./Soir boxes, fonts
- Print to PDF in A5 format
- Settings saved in browser localStorage

## How to use

1. Just open `index.html` in any modern browser.
2. Use the Settings panel to customize colors, text, images, and fonts.
3. Click "Enregistrer PDF" to print/save as PDF.

## Deploy to GitHub Pages

1. Create a new repository on GitHub.
2. Upload all files (`index.html`, `css/`, `js/` folders).
3. Go to **Settings → Pages**.
4. Under **Source**, select the branch (usually `main`) and `/ (root)`.
5. Click Save. Your site will be live at `https://yourusername.github.io/your-repo-name/`.

## File structure

```
index.html        — Main HTML entry point
css/style.css     — Custom styles (A5 sizing, print rules, animations)
js/
  icons.js          — SVG icon components (replaces lucide-react)
  config.js         — Default settings, image URLs, calendar constants, utility functions
  pages/
    cover.js        — Cover page
    back-cover.js   — Back cover page
    year-overview.js — 12-month grid overview
    month.js        — Monthly agenda page with day rows
  settings-panel.js — Settings sidebar
  agenda-viewer.js  — Main viewer with page navigation
  app.js            — Root app component
```

## Tech

- React 18 (via CDN)
- Babel standalone (in-browser JSX transpilation)
- Tailwind CSS (via CDN)
- Google Fonts (Playfair Display, Cairo, Inter, Amiri, Noto Naskh Arabic)
