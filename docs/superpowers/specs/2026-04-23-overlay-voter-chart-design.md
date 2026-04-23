# Constituency Overlay Voter Chart

**Date:** 2026-04-23  
**Status:** Approved

## Goal

Add a dual-axis combo chart (Chart.js) to the constituency popup overlay, below the Registered Voters / Constituency ID stats card. The chart shows two metrics across election years so users can quickly see voter roll growth and turnout trends side by side.

## Data Sources

| Metric | Source | Notes |
|--------|--------|-------|
| Registered voters | `data/constituencies.json` → `electors` object | Keys: `"2016"`, `"2021"`. No 2026 value yet. |
| Turnout % | `data/elections-2016.json`, `data/elections-2021.json` | Field: `turnout_percent` per constituency. No 2026 value yet. |

X-axis years: `['2016', '2021', '2026']`. Both series use `null` for 2026 — Chart.js renders null as a gap (no bar, broken line).

## Chart Spec

- **Type:** Chart.js combo — `type: 'bar'` at the top level, with the turnout dataset using `type: 'line'`
- **Bars (left y-axis):** Registered voters. Color: muted accent. Y-axis tick format: `284K` style (abbreviate thousands).
- **Line + dots (right y-axis):** Turnout %. Color: indigo/neutral (not a party color). Y-axis range: 0–100, suffix `%`.
- **Styling:** CSS variables (`--color-text-muted`, `--color-border`) matching the existing `e2026_renderStarChart` pattern in `js/elections-2026.js`.
- **Theme support:** Chart instance destroyed and recreated on dark/light theme toggle.
- **Size:** Compact — fits comfortably in the overlay sidebar without pushing election results too far down.

## HTML Changes (`index.html`)

Add below the `.stats-card` div in the overlay section:

```html
<div class="overlay-voter-chart">
  <canvas id="overlay-voter-canvas"></canvas>
</div>
```

## New File: `js/overlay-charts.js`

IIFE module exposing:

```javascript
const OverlayCharts = (function() {
    let _chart = null;

    return {
        render(electors, turnoutByYear) { /* create/recreate chart */ },
        destroy() { /* destroy chart instance */ }
    };
})();
```

- `render` receives already-resolved data (electors object + turnout map keyed by year string)
- Destroys existing chart before creating a new one
- Reads CSS variables at render time so dark/light colors are always current

## Changes to `js/ui.js`

- In `updateOverlayElectionResults` (or the overlay open handler): after resolving constituency data, call `OverlayCharts.render(info.electors, turnoutMap)` where `turnoutMap = { "2016": pct, "2021": pct }`
- In overlay close handler: call `OverlayCharts.destroy()`
- On theme toggle (already calls `MapModule._redrawStyles()`): also call `OverlayCharts.destroy()` then re-render if overlay is open

## Script Loading (`index.html`)

Load `js/overlay-charts.js` **before** `js/ui.js` (Chart.js is already loaded earlier in the file).

## CSS (`css/components/overlay.css`)

Add `.overlay-voter-chart` styles:
- Modest top margin to separate from stats card
- Canvas fills container width, fixed height (~160px)

## Out of Scope

- 2026 actual data (added when election results are available)
- 2011 or earlier years (not in current data sources)
- Tooltips beyond Chart.js defaults
