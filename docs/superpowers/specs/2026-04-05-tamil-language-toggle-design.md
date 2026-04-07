# Tamil Language Toggle — Design Spec
**Date:** 2026-04-05  
**Status:** Approved

## Overview

Add a Tamil/English language toggle to the Therdhal site. When active, all UI labels, constituency names, district names, and candidate names switch to Tamil script. Language preference persists across sessions via `localStorage`.

---

## Architecture

### New module: `js/utils/i18n.js`

Loads in `index.html` immediately after `theme.js` (before all other scripts).

**Responsibilities:**
- Holds a `TRANSLATIONS` dictionary with `en` and `ta` keys for all static UI strings
- Exposes `I18n.t(key)` — returns the translated string for the current language
- Exposes `I18n.setLang(lang)` — switches language, saves to `localStorage`, fires `langchange` custom event on `document`
- Exposes `I18n.getLang()` — returns `'en'` or `'ta'`
- On module load, reads `localStorage` key `tn-map-lang` and sets the initial language (default: `'en'`)
- On init, walks all `[data-i18n]` elements in the DOM and sets their `textContent` to the correct translation

**Event system:**  
`document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }))` — fired whenever language changes. Dynamic render functions in `ui.js` and `elections-2026.js` listen for this event and re-render open panels.

### Static HTML translation

All static text nodes in `index.html` get a `data-i18n="key"` attribute on their element. On `langchange`, `i18n.js` re-walks all `[data-i18n]` elements and updates their text.

Example:
```html
<label for="year-filter" class="filter-label" data-i18n="filter.year">Year</label>
```

### Dynamic content translation

`ui.js` and `elections-2026.js` listen for `langchange` and call their existing render functions to re-render:
- District and constituency dropdowns
- Open constituency overlay (if visible)
- Legend (if visible)
- Elections 2026 modal tab panels (if open)

Dynamic renders already pull data from JSON — they just need to switch which field they read (`name` vs `name_ta`, `district` vs `district_ta`, candidate `name` vs `name_ta`).

---

## UI Toggle

**Placement:** `header-actions` row in `index.html`, between the Elections 2026 button and the theme toggle.

**Markup:**
```html
<button id="lang-toggle" class="lang-toggle-btn" aria-label="Switch to Tamil">
    <span class="lang-option" data-lang="en">EN</span>
    <span class="lang-option" data-lang="ta">த</span>
</button>
```

**Styling:** Pill/segmented-control appearance in `css/components/header.css`. The active language option gets a filled highlight; inactive is muted. Compact — matches the height of the theme toggle button.

**Behaviour:** On click, calls `I18n.setLang(newLang)`. On page load, reads saved language from `localStorage` and applies the correct active state to the pill.

---

## Data Layer

### `data/constituencies.json`

Each constituency entry gets two new fields:
- `name_ta` — Tamil script name of the constituency
- `district_ta` — Tamil script name of the district

Example:
```json
"1": {
  "name": "GUMMIDIPUNDI",
  "name_ta": "கும்மிடிப்பூண்டி",
  "district": "TIRUVALLUR",
  "district_ta": "திருவள்ளூர்",
  ...
}
```

All 234 constituency entries and 38 district names are generated using standard Tamil transliteration conventions for Tamil Nadu proper nouns.

### `data/elections-2021.json`, `data/elections-2016.json`, `data/elections-2026.json`

Each candidate entry gets one new field:
- `name_ta` — phonetic Tamil script rendering of the candidate's name

Example:
```json
{ "name": "GOVINDARAJAN T.J", "name_ta": "கோவிந்தராஜன் டி.ஜே", ... }
```

Tamil names are generated using phonetic transliteration. Initials are rendered as Tamil letter abbreviations.

---

## Translation Scope

### Translated (i18n module keys)

| Location | English | Tamil key |
|---|---|---|
| Filter label | Year | `filter.year` |
| Filter label | District | `filter.district` |
| Filter label | Constituency | `filter.constituency` |
| Filter label | Candidate Name | `filter.candidate` |
| Filter placeholder | All Years | `filter.all_years` |
| Filter placeholder | All Districts | `filter.all_districts` |
| Filter placeholder | All Constituencies | `filter.all_constituencies` |
| Search placeholder | Search candidate... | `filter.search_placeholder` |
| Header button | Filters | `btn.filters` |
| Header button | Elections 2026 | `btn.elections_2026` |
| Back button | Overview | `btn.overview` |
| Legend title | Winning Party | `legend.title` |
| Loading text | Loading map data... | `loading.text` |
| Overlay stat label | Registered Voters | `overlay.registered_voters` |
| Overlay stat label | Constituency ID | `overlay.constituency_id` |
| Overlay section | Election History | `overlay.election_history` |
| Overlay section | Election Results | `overlay.election_results` |
| Overlay badge | General | `badge.general` |
| Overlay badge | SC | `badge.sc` |
| Elections modal tab | Alliances | `modal.tab_alliances` |
| Elections modal tab | Candidates | `modal.tab_candidates` |
| Elections modal tab | Stars | `modal.tab_stars` |
| Countdown label | Polling Day — Apr 23 | `modal.polling_day` |
| Countdown unit | d | `countdown.d` |
| Countdown unit | h | `countdown.h` |
| Countdown unit | m | `countdown.m` |
| Countdown unit | s | `countdown.s` |

### Translated (data fields)

| Data | Field added |
|---|---|
| Constituency names (234) | `constituencies.json` → `name_ta` |
| District names (38) | `constituencies.json` → `district_ta` |
| Candidate names (all years) | election JSON files → candidate `name_ta` |

### Not translated

- Party names and abbreviations (DMK, AIADMK, BJP, INC, etc.) — same in both languages
- Numbers, vote counts, percentages, years
- The brand name "therdhal" / "election companion" in the header (brand identity)
- URL, meta tags, page title

---

## Render Logic Changes

### `ui.js`

- `populateDistrictDropdown()` — use `district_ta` when lang is `ta`
- `populateConstituencyDropdown()` — use `name_ta` when lang is `ta`
- `showConstituencyOverlay()` — already uses `info.name_ta`; update district display and candidate names to use Tamil fields when lang is `ta`
- Election history render — use `candidate.name_ta` when lang is `ta`
- Candidates table render — use `candidate.name_ta` when lang is `ta`
- Legend — use `I18n.t('legend.title')` for title; alliance/party names stay in English
- Add `langchange` listener that re-renders open overlay and dropdowns

### `elections-2026.js`

- Tab panel renders — use `I18n.t()` for all headings and labels
- Add `langchange` listener to re-render open modal panels

### `index.html`

- Add `data-i18n` attributes to all static text elements listed in the translation scope table above
- Add lang toggle button markup to `header-actions`

---

## File Changes Summary

| File | Change |
|---|---|
| `js/utils/i18n.js` | **New** — i18n module |
| `css/components/header.css` | Add lang toggle pill styles |
| `index.html` | Add `data-i18n` attrs, lang toggle button, load `i18n.js` |
| `js/ui.js` | Language-aware renders + `langchange` listener |
| `js/elections-2026.js` | Language-aware renders + `langchange` listener |
| `data/constituencies.json` | Add `name_ta`, `district_ta` to all 234 entries |
| `data/elections-2021.json` | Add `name_ta` to all candidate entries |
| `data/elections-2016.json` | Add `name_ta` to all candidate entries |
| `data/elections-2026.json` | Add `name_ta` to all candidate entries |
