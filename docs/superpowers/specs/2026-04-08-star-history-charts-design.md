# Star Candidate History Charts — Design Spec
**Date:** 2026-04-08  
**Feature:** Election margin history line charts on each star candidate card in the Stars tab

---

## Overview

Each star candidate card in the Elections 2026 modal's "Stars" tab will display a collapsible line chart showing that candidate's win/loss margin across the past 5 Tamil Nadu assembly elections (2001–2021). The chart is hidden by default and revealed by clicking the card. M.K. Stalin's card opens by default to signal the feature exists.

---

## 1. Data Structure

The `history` field is added directly to each object in `STAR_CANDIDATES_2026` in `js/elections-2026-data.js`.

```js
{
  name: 'M.K. Stalin',
  party: 'DMK',
  partyColor: '#e53935',
  constituency: 'Kolathur',
  note: 'Chief Minister',
  status: 'confirmed',
  photo: 'assets/photos/stalin.jpg',
  history: [
    { year: 2021, margin: +34.2 },
    { year: 2016, margin: +21.4 },
    { year: 2011, margin: +1.6  },
    { year: 2006, margin: +2.2  },
    { year: 2001, margin: +5.3  },
  ]
}
```

**Rules:**
- `history` is always an array ordered **most recent first** (2021 → 2001)
- Years where the candidate did not contest are represented as `{ year: XXXX, margin: null }`
- Candidates who have never contested any of the 5 elections get `history: []`
- A future `note` field per entry (e.g., `{ year: 2021, margin: +34.2, note: 'Defeated X by Y votes' }`) will be added in a follow-up — the tooltip code should be written to render it if present

---

## 2. Charting Library

**Chart.js** loaded via CDN (`<script>` tag in `index.html`, before `elections-2026.js`).

- No build step required
- Native support for `null` data points (`spanGaps: false` — line breaks at missing data rather than interpolating)
- Built-in responsive canvas and tooltip system
- ~60KB gzipped

---

## 3. Chart Appearance

- **Type:** Line chart
- **X-axis:** Fixed labels `['2021', '2016', '2011', '2006', '2001']` — most recent on the left, oldest on the right. All 5 years always shown.
- **Y-axis:** Percentage (e.g., `-25` to `+45`). Scaled dynamically to the candidate's data range with some padding.
- **Zero line:** Bold/prominent horizontal grid line at y=0. This is the key visual reference — wins above, losses below.
- **Line color:** `star.partyColor`
- **Point style:** Filled circles. Null data points are skipped (no dot, line breaks).
- **Tooltip on hover/click of point:** Shows year + margin percentage (e.g., `"2016: +21.4%"`). If the data point has a `note`, it is shown on a second line.
- **Chart height:** 120px fixed. Compact — does not dominate the card.
- **Background:** Transparent.
- **Axis/grid colors:** Derived from CSS custom properties (`--color-text-muted` for labels, `--color-border` for grid lines) so dark/light mode is respected automatically.

---

## 4. Card Interaction

### Toggle behaviour
- Clicking **anywhere on the card** opens or closes the chart panel below the existing info row.
- A **chevron** (`▸` / `▾`) sits at the bottom-right of the card and rotates to indicate state. It is not a separate button — it is a visual indicator only.
- Only **one card can be open at a time.** Opening a new card closes the previously open one and destroys that chart (Chart.js `instance.destroy()`) to free memory. The newly opened chart is lazily initialized.
- Chart instances are **not cached** — each open creates a fresh Chart.js instance, each close destroys it. This keeps memory low given 31 candidates.

### Initial state
- On first render of the Stars tab, **M.K. Stalin's card** is opened automatically, chart rendered. This signals the feature to users.
- All other cards start collapsed.

### No-history state
- Candidates with `history: []` still show the chevron and are clickable.
- Clicking opens the panel, but instead of a canvas it shows: *"Did not contest in the past 5 Tamil Nadu assembly elections"*
- No Chart.js instance is created for these candidates.

---

## 5. DOM Structure (per card)

```html
<!-- new wrapper groups card + panel -->
<div class="epg-star-card-wrap">

  <div class="epg-star-card" data-star-idx="0">
    <!-- existing: photo wrap -->
    <div class="epg-star-photo-wrap">...</div>

    <!-- existing: info -->
    <div class="epg-star-info">
      <div class="epg-star-row epg-star-row-top">...</div>
      <div class="epg-star-row epg-star-row-bottom">
        <span class="epg-star-note">...</span>
        <span class="epg-star-constituency">...</span>
      </div>
    </div>

    <!-- new: chevron indicator -->
    <span class="epg-star-chevron">▸</span>
  </div>

  <!-- new: chart panel sibling -->
  <div class="epg-star-chart-panel hidden" data-star-idx="0">
    <canvas class="epg-star-canvas"></canvas>
    <!-- OR, for history: [] candidates: -->
    <p class="epg-star-no-history">Did not contest in the past 5 Tamil Nadu assembly elections</p>
  </div>

</div>
```

The chart panel is a **sibling** of the card div (not a child) to avoid disrupting the card's flex layout. Both are wrapped in `.epg-star-card-wrap`.

---

## 6. CSS Changes

- `.epg-star-card`: add `cursor: pointer`
- `.epg-star-card-wrap`: new wrapper, no visual styling — groups card + panel for grid layout
- `.epg-star-chevron`: right-aligned indicator inside card, transition on rotation
- `.epg-star-chart-panel`: padding, border-top, background matches card; `display: none` when `.hidden`
- `.epg-star-no-history`: muted italic text, centred, small font
- `.epg-stars-grid` column template unchanged — wraps fill the grid cells

---

## 7. JS Changes

All changes in `js/elections-2026.js`, within `e2026_renderStars()`.

1. Wrap each card + panel in `.epg-star-card-wrap`
2. Render chevron inside card
3. Render chart panel as sibling (hidden by default)
4. Attach click listener to card → toggles panel, initializes/destroys Chart.js instance
5. Track `currentOpenIdx` (module-level variable) to enforce one-open-at-a-time
6. After rendering all cards, programmatically open index 0 (Stalin)

Chart.js instance creation extracted into helper `e2026_renderStarChart(canvas, star)` that reads `star.history` and `star.partyColor`.

---

## 8. Files Changed

| File | Change |
|------|--------|
| `index.html` | Add Chart.js CDN `<script>` before `elections-2026.js` |
| `js/elections-2026-data.js` | Add `history: [...]` to each star candidate object |
| `js/elections-2026.js` | Update `e2026_renderStars()`, add chart helper |
| `css/components/elections-2026.css` | Add styles for wrap, chevron, chart panel, no-history message |

No new files needed.

---

## 9. Out of Scope (follow-up)

- Opponent/vote-count annotations on tooltip (data not yet provided)
- Tamil language variants of the no-history message
- Animation on chart reveal
