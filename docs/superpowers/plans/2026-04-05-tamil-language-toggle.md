# Tamil Language Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent EN/த pill toggle to the header that switches all UI labels, constituency names, district names, and candidate names between English and Tamil script.

**Architecture:** A new `I18n` module (IIFE, loads after `theme.js`) holds all static string translations and owns the toggle event. It fires a `langchange` custom event when language changes; `ui.js` and `elections-2026.js` listen and re-render dynamic content. Tamil names for constituencies and candidates live in the JSON data files as new fields (`name_ta`, `district_ta`).

**Tech Stack:** Vanilla JS (IIFE module pattern), CSS custom properties, Python 3 for data enrichment scripts.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `js/utils/i18n.js` | Translation dictionary, `I18n.t()`, `I18n.setLang()`, toggle click binding |
| Modify | `css/components/header.css` | Pill toggle styles (`.lang-toggle-btn`, `.lang-option`) |
| Modify | `index.html` | Add `<script src="js/utils/i18n.js">`, lang toggle button markup, `data-i18n` attributes on static text |
| Modify | `js/data/dataQueries.js` | `getConstituencyList()` returns `name_ta` + `district_ta`; `searchCandidates()` searches `name_ta` in Tamil mode |
| Modify | `js/ui.js` | Language-aware district/constituency dropdowns, overlay, candidate renders; `langchange` listener |
| Modify | `js/elections-2026.js` | Language-aware tab renders; `langchange` listener |
| Modify | `data/constituencies.json` | Add `name_ta` (Tamil constituency name) and `district_ta` (Tamil district name) to all 234 entries |
| Modify | `data/elections-2021.json` | Add `name_ta` to every candidate entry |
| Modify | `data/elections-2016.json` | Add `name_ta` to every candidate entry |
| Modify | `data/elections-2026.json` | Add `name_ta` to every candidate entry |

---

## Task 1: Create `js/utils/i18n.js`

**Files:**
- Create: `js/utils/i18n.js`

- [ ] **Step 1: Create the file with the full translations module**

```javascript
/**
 * i18n Module — Tamil/English language support
 * - I18n.t(key)         → translated string for current language
 * - I18n.getLang()      → 'en' | 'ta'
 * - I18n.setLang(lang)  → switch language, save to localStorage, fire langchange event
 * Fires: document CustomEvent 'langchange' with detail { lang }
 * Persists: localStorage key 'tn-map-lang'
 */
const I18n = (function () {
    const STORAGE_KEY = 'tn-map-lang';
    let _lang = 'en';

    const TRANSLATIONS = {
        en: {
            'filter.year':                  'Year',
            'filter.district':              'District',
            'filter.constituency':          'Constituency',
            'filter.candidate':             'Candidate Name',
            'filter.all_years':             'All Years',
            'filter.all_districts':         'All Districts',
            'filter.all_constituencies':    'All Constituencies',
            'filter.search_placeholder':    'Search candidate...',
            'btn.filters':                  'Filters',
            'btn.elections_2026':           'Elections 2026',
            'btn.overview':                 'Overview',
            'legend.title':                 'Winning Party',
            'loading.text':                 'Loading map data...',
            'overlay.registered_voters':    'Registered Voters',
            'overlay.constituency_id':      'Constituency ID',
            'overlay.election_history':     'Election History',
            'overlay.election_results':     'Election Results',
            'overlay.declared_candidates':  'Declared Candidates',
            'overlay.no_data':              'No data',
            'overlay.no_candidates':        'No candidates declared',
            'overlay.no_candidate_data':    'No candidate data available for this year',
            'overlay.error_loading':        'Error loading data',
            'badge.general':                'General',
            'badge.sc':                     'SC',
            'modal.tab_alliances':          'Alliances',
            'modal.tab_candidates':         'Candidates',
            'modal.tab_stars':              'Stars',
            'modal.polling_day':            'Polling Day \u2014 Apr 23',
            'countdown.d':                  'd',
            'countdown.h':                  'h',
            'countdown.m':                  'm',
            'countdown.s':                  's',
        },
        ta: {
            'filter.year':                  '\u0b86\u0ba3\u0bcd\u0b9f\u0bc1',
            'filter.district':              '\u0bae\u0bbe\u0bb5\u0b9f\u0bcd\u0b9f\u0bae\u0bcd',
            'filter.constituency':          '\u0ba4\u0bca\u0b95\u0bc1\u0ba4\u0bbf',
            'filter.candidate':             '\u0bb5\u0bc7\u0b9f\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bcd \u0baa\u0bc6\u0baf\u0bb0\u0bcd',
            'filter.all_years':             '\u0b85\u0ba9\u0bc8\u0ba4\u0bcd\u0ba4\u0bc1 \u0b86\u0ba3\u0bcd\u0b9f\u0bc1\u0b95\u0bb3\u0bc1\u0bae\u0bcd',
            'filter.all_districts':         '\u0b85\u0ba9\u0bc8\u0ba4\u0bcd\u0ba4\u0bc1 \u0bae\u0bbe\u0bb5\u0b9f\u0bcd\u0b9f\u0b99\u0bcd\u0b95\u0bb3\u0bc1\u0bae\u0bcd',
            'filter.all_constituencies':    '\u0b85\u0ba9\u0bc8\u0ba4\u0bcd\u0ba4\u0bc1 \u0ba4\u0bca\u0b95\u0bc1\u0ba4\u0bbf\u0b95\u0bb3\u0bc1\u0bae\u0bcd',
            'filter.search_placeholder':    '\u0bb5\u0bc7\u0b9f\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bc8\u0ba4\u0bcd \u0ba4\u0bc7\u0b9f\u0bc1\u0b95...',
            'btn.filters':                  '\u0bb5\u0b9f\u0bbf\u0b95\u0b9f\u0bcd\u0b9f\u0bbf\u0b95\u0bb3\u0bcd',
            'btn.elections_2026':           '\u0ba4\u0bc7\u0bb0\u0bcd\u0ba4\u0bb2\u0bcd 2026',
            'btn.overview':                 '\u0b95\u0ba3\u0bcd\u0ba3\u0bcb\u0b9f\u0bcd\u0b9f\u0bae\u0bcd',
            'legend.title':                 '\u0bb5\u0bc6\u0bb1\u0bcd\u0bb1\u0bbf\u0baa\u0bc6\u0bb1\u0bcd\u0bb1 \u0b95\u0b9f\u0bcd\u0b9a\u0bbf',
            'loading.text':                 '\u0bb5\u0bb0\u0bc8\u0baa\u0b9f \u0ba4\u0bb0\u0bb5\u0bc8 \u0b8f\u0bb1\u0bcd\u0bb1\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1...',
            'overlay.registered_voters':    '\u0baa\u0ba4\u0bbf\u0bb5\u0bc1 \u0b9a\u0bc6\u0baf\u0bcd\u0ba4 \u0bb5\u0bbe\u0b95\u0bcd\u0b95\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bcd',
            'overlay.constituency_id':      '\u0ba4\u0bca\u0b95\u0bc1\u0ba4\u0bbf \u0b8e\u0ba3\u0bcd',
            'overlay.election_history':     '\u0ba4\u0bc7\u0bb0\u0bcd\u0ba4\u0bb2\u0bcd \u0bb5\u0bb0\u0bb2\u0bbe\u0bb1\u0bc1',
            'overlay.election_results':     '\u0ba4\u0bc7\u0bb0\u0bcd\u0ba4\u0bb2\u0bcd \u0bae\u0bc1\u0b9f\u0bbf\u0bb5\u0bc1\u0b95\u0bb3\u0bcd',
            'overlay.declared_candidates':  '\u0b85\u0bb1\u0bbf\u0bb5\u0bbf\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f \u0bb5\u0bc7\u0b9f\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bcd',
            'overlay.no_data':              '\u0ba4\u0bb0\u0bb5\u0bc1 \u0b87\u0bb2\u0bcd\u0bb2\u0bc8',
            'overlay.no_candidates':        '\u0bb5\u0bc7\u0b9f\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bcd \u0b85\u0bb1\u0bbf\u0bb5\u0bbf\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8',
            'overlay.no_candidate_data':    '\u0b87\u0ba8\u0bcd\u0ba4 \u0b86\u0ba3\u0bcd\u0b9f\u0bbf\u0bb1\u0bcd\u0b95\u0bc1 \u0bb5\u0bc7\u0b9f\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bcd \u0ba4\u0bb0\u0bb5\u0bc1 \u0b87\u0bb2\u0bcd\u0bb2\u0bc8',
            'overlay.error_loading':        '\u0ba4\u0bb0\u0bb5\u0bc1 \u0b8f\u0bb1\u0bcd\u0bb1\u0bb2\u0bbf\u0bb2\u0bcd \u0baa\u0bbf\u0bb4\u0bc8',
            'badge.general':                '\u0baa\u0bca\u0ba4\u0bc1',
            'badge.sc':                     '\u0ba4\u0bbe\u0bb4\u0bcd\u0ba4\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bcb\u0bb0\u0bcd',
            'modal.tab_alliances':          '\u0b95\u0bc2\u0b9f\u0bcd\u0b9f\u0ba3\u0bbf\u0b95\u0bb3\u0bcd',
            'modal.tab_candidates':         '\u0bb5\u0bc7\u0b9f\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bcd',
            'modal.tab_stars':              '\u0ba8\u0b9f\u0bcd\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0bb0\u0b99\u0bcd\u0b95\u0bb3\u0bcd',
            'modal.polling_day':            '\u0bb5\u0bbe\u0b95\u0bcd\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0ba4\u0bbf\u0bb5\u0bc1 \u0ba8\u0bbe\u0bb3\u0bcd \u2014 \u0b8f\u0baa\u0bcd. 23',
            'countdown.d':                  '\u0ba8\u0bbe',
            'countdown.h':                  '\u0bae',
            'countdown.m':                  '\u0ba8\u0bbf',
            'countdown.s':                  '\u0bb5\u0bbf',
        }
    };

    function t(key) {
        return (TRANSLATIONS[_lang] && TRANSLATIONS[_lang][key]) ||
               (TRANSLATIONS.en && TRANSLATIONS.en[key]) ||
               key;
    }

    function getLang() { return _lang; }

    function _updateToggleState() {
        document.querySelectorAll('#lang-toggle .lang-option').forEach(el => {
            el.classList.toggle('active', el.dataset.lang === _lang);
        });
        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.setAttribute('aria-label', _lang === 'en' ? 'Switch to Tamil' : 'Switch to English');
        }
    }

    function _applyToDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.getAttribute('data-i18n'));
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
        });
    }

    function setLang(lang) {
        if (lang !== 'en' && lang !== 'ta') return;
        _lang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        _applyToDOM();
        _updateToggleState();
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    }

    function _bindToggle() {
        const btn = document.getElementById('lang-toggle');
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            const opt = e.target.closest('.lang-option');
            setLang(opt ? opt.dataset.lang : (_lang === 'en' ? 'ta' : 'en'));
        });
        _updateToggleState();
    }

    // Init: read saved language and apply
    const saved = localStorage.getItem(STORAGE_KEY);
    _lang = saved === 'ta' ? 'ta' : 'en';
    _applyToDOM();
    // Bind toggle after DOM is ready (scripts load at bottom of body, so DOM is ready)
    _bindToggle();

    return { t, getLang, setLang };
})();
```

- [ ] **Step 2: Verify the file is valid JS by checking syntax**

```bash
node --check js/utils/i18n.js
```
Expected: no output (no syntax errors)

- [ ] **Step 3: Commit**

```bash
git add js/utils/i18n.js
git commit -m "feat: add i18n module with EN/Tamil translations dictionary"
```

---

## Task 2: Add lang toggle CSS to `header.css`

**Files:**
- Modify: `css/components/header.css`

- [ ] **Step 1: Add the pill toggle styles at the end of `css/components/header.css`**

```css
/* ── Language Toggle Pill ── */
.lang-toggle-btn {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border);
    border-radius: 9999px;
    padding: 3px;
    cursor: pointer;
    min-height: 40px;
    transition: border-color var(--transition-fast);
}

.lang-toggle-btn:hover {
    border-color: var(--color-accent-primary);
}

.lang-toggle-btn:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
}

.lang-option {
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
    min-width: 30px;
    text-align: center;
    font-family: var(--font-primary);
    line-height: 1.4;
    user-select: none;
}

.lang-option[data-lang="ta"] {
    font-family: 'Noto Sans Tamil', var(--font-primary);
}

.lang-option.active {
    background: var(--color-accent-primary);
    color: #ffffff;
}
```

- [ ] **Step 2: Commit**

```bash
git add css/components/header.css
git commit -m "feat: add lang toggle pill styles to header.css"
```

---

## Task 3: Update `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add lang toggle button to `header-actions` (after the elections-2026-btn, before theme-toggle)**

Find this in index.html:
```html
                <button id="theme-toggle" aria-label="Switch to Light Mode" title="Switch to Light Mode">
```

Insert before it:
```html
                <button id="lang-toggle" class="lang-toggle-btn" aria-label="Switch to Tamil">
                    <span class="lang-option" data-lang="en">EN</span>
                    <span class="lang-option" data-lang="ta">த</span>
                </button>
```

- [ ] **Step 2: Add `data-i18n` attributes to all static text elements**

Apply these changes one by one:

**Filter labels and placeholders:**
```html
<!-- Year label -->
<label for="year-filter" class="filter-label" data-i18n="filter.year">Year</label>

<!-- Year filter first option -->
<option value="" data-i18n="filter.all_years">All Years</option>

<!-- District label -->
<label for="district-filter" class="filter-label" data-i18n="filter.district">District</label>

<!-- District filter first option -->
<option value="" data-i18n="filter.all_districts">All Districts</option>

<!-- Constituency label -->
<label for="constituency-filter" class="filter-label" data-i18n="filter.constituency">Constituency</label>

<!-- Constituency filter first option -->
<option value="" data-i18n="filter.all_constituencies">All Constituencies</option>

<!-- Candidate name label -->
<label for="candidate-search" class="filter-label" data-i18n="filter.candidate">Candidate Name</label>

<!-- Candidate search input -->
<input type="text" id="candidate-search" class="search-input"
    placeholder="Search candidate..." autocomplete="off"
    data-i18n-placeholder="filter.search_placeholder">
```

**Header buttons:**
```html
<!-- Filters button span -->
<span data-i18n="btn.filters">Filters</span>

<!-- Elections 2026 button span -->
<span data-i18n="btn.elections_2026">Elections 2026</span>

<!-- Back/Overview button span -->
<span data-i18n="btn.overview">Overview</span>
```

**Map overlays:**
```html
<!-- Legend title -->
<h2 class="legend-title" data-i18n="legend.title">Winning Party</h2>

<!-- Loading text -->
<p class="loading-text" data-i18n="loading.text">Loading map data...</p>

<!-- Registered Voters stat label -->
<span class="stat-label" data-i18n="overlay.registered_voters">Registered Voters</span>

<!-- Constituency ID stat label -->
<span class="stat-label" data-i18n="overlay.constituency_id">Constituency ID</span>
```

**Elections modal tabs:**
```html
<button class="epg-tab-btn active" data-tab="alliances" data-i18n="modal.tab_alliances">Alliances</button>
<button class="epg-tab-btn" data-tab="candidates" data-i18n="modal.tab_candidates">Candidates</button>
<button class="epg-tab-btn" data-tab="stars" data-i18n="modal.tab_stars">Stars</button>
```

**Countdown labels:**
```html
<span class="epg-bar-label" data-i18n="modal.polling_day">Polling Day — Apr 23</span>

<span class="epg-lbl" data-i18n="countdown.d">d</span>
<span class="epg-lbl" data-i18n="countdown.h">h</span>
<span class="epg-lbl" data-i18n="countdown.m">m</span>
<span class="epg-lbl" data-i18n="countdown.s">s</span>
```

- [ ] **Step 3: Add `<script src="js/utils/i18n.js">` immediately after `theme.js` in the scripts section**

Find:
```html
    <!-- Theme Manager (must be first to initialise tile layer correctly) -->
    <script src="js/utils/theme.js"></script>

    <!-- Utilities -->
    <script src="js/utils/constants.js"></script>
```

Change to:
```html
    <!-- Theme Manager (must be first to initialise tile layer correctly) -->
    <script src="js/utils/theme.js"></script>

    <!-- i18n: Tamil/English language toggle (load before all other modules) -->
    <script src="js/utils/i18n.js"></script>

    <!-- Utilities -->
    <script src="js/utils/constants.js"></script>
```

- [ ] **Step 4: Open the site in a browser and verify**

Run a local server:
```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Check:
- The `EN | த` pill appears in the header between Elections 2026 button and the theme toggle
- `EN` is highlighted (active) on first load
- Clicking `த` highlights it and changes filter labels, button text, loading text to Tamil
- Clicking `EN` reverts to English
- Refresh the page with Tamil active — it stays Tamil (localStorage persistence)

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add lang toggle button and data-i18n attributes to index.html"
```

---

## Task 4: Enrich `data/constituencies.json` with Tamil names

**Files:**
- Modify: `data/constituencies.json` (via Python script)

- [ ] **Step 1: Create the enrichment script `scripts/enrich_constituencies.py`**

```bash
mkdir -p scripts
```

```python
#!/usr/bin/env python3
"""Add name_ta and district_ta fields to data/constituencies.json"""

import json

DISTRICT_TA = {
    'ARIYALUR':         'அரியலூர்',
    'CHENNAI':          'சென்னை',
    'COIMBATORE':       'கோயம்புத்தூர்',
    'CUDDALORE':        'கடலூர்',
    'DHARMAPURI':       'தர்மபுரி',
    'DINDIGUL':         'திண்டுக்கல்',
    'ERODE':            'ஈரோடு',
    'KANCHIPURAM':      'காஞ்சிபுரம்',
    'KANNIYAKUMARI':    'கன்னியாகுமரி',
    'KARUR':            'கரூர்',
    'KRISHNAGIRI':      'கிருஷ்ணகிரி',
    'MADURAI':          'மதுரை',
    'NAGAPATTINAM':     'நாகப்பட்டினம்',
    'NAMAKKAL':         'நாமக்கல்',
    'NILGIRIS':         'நீலகிரி',
    'PERAMBALUR':       'பெரம்பலூர்',
    'PUDUKKOTTAI':      'புதுக்கோட்டை',
    'RAMANATHAPURAM':   'இராமநாதபுரம்',
    'SALEM':            'சேலம்',
    'SIVAGANGA':        'சிவகங்கை',
    'THANJAVUR':        'தஞ்சாவூர்',
    'THENI':            'தேனி',
    'THOOTHUKUDI':      'தூத்துக்குடி',
    'TIRUCHIRAPPALLI':  'திருச்சிராப்பள்ளி',
    'TIRUNELVELI':      'திருநெல்வேலி',
    'TIRUPUR':          'திருப்பூர்',
    'TIRUVALLUR':       'திருவள்ளூர்',
    'TIRUVANNAMALAI':   'திருவண்ணாமலை',
    'TIRUVARUR':        'திருவாரூர்',
    'VELLORE':          'வேலூர்',
    'VILLUPURAM':       'விழுப்புரம்',
    'VIRUDHUNAGAR':     'விருதுநகர்',
}

CONSTITUENCY_TA = {
    '1':   'கும்மிடிப்பூண்டி',
    '2':   'பொன்னேரி',
    '3':   'திருத்தணி',
    '4':   'திருவள்ளூர்',
    '5':   'பூந்தமல்லி',
    '6':   'ஆவடி',
    '7':   'மாடுவாயல்',
    '8':   'அம்பத்தூர்',
    '9':   'மாடவாரம்',
    '10':  'திருவொற்றியூர்',
    '11':  'டாக்டர் இராதாகிருஷ்ணன் நகர்',
    '12':  'பெரம்பூர்',
    '13':  'கொளத்தூர்',
    '14':  'விலிவாக்கம்',
    '15':  'திரு-வி-க-நகர்',
    '16':  'எழும்பூர்',
    '17':  'ராயபுரம்',
    '18':  'துறைமுகம்',
    '19':  'சேப்பாக்கம்-திருவல்லிக்கேணி',
    '20':  'ஆயிரம் விளக்கு',
    '21':  'அண்ணா நகர்',
    '22':  'விருகம்பாக்கம்',
    '23':  'சைதாப்பேட்டை',
    '24':  'தியாகராய நகர்',
    '25':  'மயிலாப்பூர்',
    '26':  'வேளச்சேரி',
    '27':  'சோழிங்கநல்லூர்',
    '28':  'அலந்தூர்',
    '29':  'ஸ்ரீபெரும்புதூர்',
    '30':  'பல்லாவரம்',
    '31':  'தாம்பரம்',
    '32':  'செங்கல்பட்டு',
    '33':  'திருப்போரூர்',
    '34':  'செய்யூர்',
    '35':  'மதுராந்தகம்',
    '36':  'உத்தரமேரூர்',
    '37':  'காஞ்சிபுரம்',
    '38':  'ஆரக்கோணம்',
    '39':  'சோளிங்கர்',
    '40':  'காட்பாடி',
    '41':  'ராணிப்பேட்டை',
    '42':  'ஆற்காடு',
    '43':  'வேலூர்',
    '44':  'யானைக்கட்டு',
    '45':  'கீழ்வைத்தீனன்குப்பம்',
    '46':  'குடியாத்தம்',
    '47':  'வாணியம்பாடி',
    '48':  'அம்பூர்',
    '49':  'ஜோலார்பேட்டை',
    '50':  'திருப்பத்தூர்',
    '51':  'உத்தங்கரை',
    '52':  'பர்கூர்',
    '53':  'கிருஷ்ணகிரி',
    '54':  'வேப்பனஹள்ளி',
    '55':  'ஓசூர்',
    '56':  'தள்ளி',
    '57':  'பாலக்கோடு',
    '58':  'பென்னாகரம்',
    '59':  'தர்மபுரி',
    '60':  'பாப்பிரெட்டிப்பட்டி',
    '61':  'ஹாரூர்',
    '62':  'செங்கம்',
    '63':  'திருவண்ணாமலை',
    '64':  'கீழ்பெண்ணாத்தூர்',
    '65':  'களசப்பாக்கம்',
    '66':  'போளூர்',
    '67':  'ஆரணி',
    '68':  'செய்யாறு',
    '69':  'வந்தவாசி',
    '70':  'செஞ்சி',
    '71':  'மைலம்',
    '72':  'திண்டிவனம்',
    '73':  'வானூர்',
    '74':  'விழுப்புரம்',
    '75':  'விக்கிரவாண்டி',
    '76':  'திருக்கோவிலூர்',
    '77':  'உளுந்தூர்பேட்டை',
    '78':  'ரிஷிவந்தியம்',
    '79':  'சங்கரபுரம்',
    '80':  'கள்ளக்குறிச்சி',
    '81':  'கங்கவல்லி',
    '82':  'ஆத்தூர்',
    '83':  'ஏற்காடு',
    '84':  'ஓமலூர்',
    '85':  'மேட்டூர்',
    '86':  'ஏடப்பாடி',
    '87':  'சங்ககிரி',
    '88':  'சேலம் (மேற்கு)',
    '89':  'சேலம் (வடக்கு)',
    '90':  'சேலம் (தெற்கு)',
    '91':  'வீரபாண்டி',
    '92':  'இராசிபுரம்',
    '93':  'சேந்தமங்கலம்',
    '94':  'நாமக்கல்',
    '95':  'பரமத்தி-வேலூர்',
    '96':  'திருச்செங்கோடு',
    '97':  'குமாரபாளையம்',
    '98':  'ஈரோடு (கிழக்கு)',
    '99':  'ஈரோடு (மேற்கு)',
    '100': 'மொடக்குறிச்சி',
    '101': 'தாராபுரம்',
    '102': 'கங்கயம்',
    '103': 'பெருந்துறை',
    '104': 'பவானி',
    '105': 'அந்தியூர்',
    '106': 'கோபிச்செட்டிப்பாளையம்',
    '107': 'பவானிசாகர்',
    '108': 'உதகமண்டலம்',
    '109': 'குடலூர்',
    '110': 'கூனூர்',
    '111': 'மேட்டுப்பாளையம்',
    '112': 'அவினாசி',
    '113': 'திருப்பூர் (வடக்கு)',
    '114': 'திருப்பூர் (தெற்கு)',
    '115': 'பல்லடம்',
    '116': 'சூலூர்',
    '117': 'கவுண்டம்பாளையம்',
    '118': 'கோயம்புத்தூர் வடக்கு',
    '119': 'தொண்டாமுத்தூர்',
    '120': 'கோயம்புத்தூர் தெற்கு',
    '121': 'சிங்காநல்லூர்',
    '122': 'கினத்துக்கடவு',
    '123': 'போளாச்சி',
    '124': 'வால்பாறை',
    '125': 'உடுமலை',
    '126': 'மடத்துக்குளம்',
    '127': 'பழனி',
    '128': 'ஒட்டன்சத்திரம்',
    '129': 'ஆத்தூர்',
    '130': 'நிலக்கோட்டை',
    '131': 'நாத்தம்',
    '132': 'திண்டுக்கல்',
    '133': 'வேடசந்தூர்',
    '134': 'அரவக்குறிச்சி',
    '135': 'கரூர்',
    '136': 'கிருஷ்ணராயபுரம்',
    '137': 'குளித்தலை',
    '138': 'மணப்பாறை',
    '139': 'ஸ்ரீரங்கம்',
    '140': 'திருச்சிராப்பள்ளி (மேற்கு)',
    '141': 'திருச்சிராப்பள்ளி (கிழக்கு)',
    '142': 'திருவெரும்பூர்',
    '143': 'லால்குடி',
    '144': 'மணச்சநல்லூர்',
    '145': 'முசிறி',
    '146': 'துறையூர்',
    '147': 'பெரம்பலூர்',
    '148': 'குன்னம்',
    '149': 'அரியலூர்',
    '150': 'ஜெயங்கொண்டம்',
    '151': 'திட்டக்குடி',
    '152': 'விருத்தாசலம்',
    '153': 'நெய்வேலி',
    '154': 'பண்ருட்டி',
    '155': 'கடலூர்',
    '156': 'குரிஞ்சிப்பாடி',
    '157': 'புவனகிரி',
    '158': 'சிதம்பரம்',
    '159': 'காட்டுமன்னார்கோவில்',
    '160': 'சீர்காழி',
    '161': 'மயிலாடுதுறை',
    '162': 'பூம்புகார்',
    '163': 'நாகப்பட்டினம்',
    '164': 'கீழ்வேலூர்',
    '165': 'வேதாரண்யம்',
    '166': 'திருத்துறைப்பூண்டி',
    '167': 'மன்னார்குடி',
    '168': 'திருவாரூர்',
    '169': 'நன்னிலம்',
    '170': 'திருவிடைமருதூர்',
    '171': 'கும்பகோணம்',
    '172': 'பாபநாசம்',
    '173': 'திருவையாறு',
    '174': 'தஞ்சாவூர்',
    '175': 'ஒரத்தநாடு',
    '176': 'பட்டுக்கோட்டை',
    '177': 'பேராவூரணி',
    '178': 'காந்தர்வக்கோட்டை',
    '179': 'விராலிமலை',
    '180': 'புதுக்கோட்டை',
    '181': 'திருமயம்',
    '182': 'ஆலங்குடி',
    '183': 'ஆரந்தாங்கி',
    '184': 'காரைக்குடி',
    '185': 'திருப்பத்தூர்',
    '186': 'சிவகங்கை',
    '187': 'மாநாமதுரை',
    '188': 'மேலூர்',
    '189': 'மதுரை கிழக்கு',
    '190': 'சோளவந்தன்',
    '191': 'மதுரை வடக்கு',
    '192': 'மதுரை தெற்கு',
    '193': 'மதுரை மத்திய',
    '194': 'மதுரை மேற்கு',
    '195': 'திருப்பரங்குன்றம்',
    '196': 'திருமங்கலம்',
    '197': 'உசிலம்பட்டி',
    '198': 'ஆண்டிப்பட்டி',
    '199': 'பெரியகுளம்',
    '200': 'போடிநாயக்கனூர்',
    '201': 'கம்பம்',
    '202': 'இராஜபாளையம்',
    '203': 'ஸ்ரீவில்லிபுத்தூர்',
    '204': 'சாத்தூர்',
    '205': 'சிவகாசி',
    '206': 'விருதுநகர்',
    '207': 'அருப்புக்கோட்டை',
    '208': 'திருச்சுழி',
    '209': 'பரமக்குடி',
    '210': 'திருவாடானை',
    '211': 'இராமநாதபுரம்',
    '212': 'முதுகுளத்தூர்',
    '213': 'விளாத்திகுளம்',
    '214': 'தூத்துக்குடி',
    '215': 'திருச்செந்தூர்',
    '216': 'ஸ்ரீவைகுண்டம்',
    '217': 'ஒட்டப்பிடாரம்',
    '218': 'கோவில்பட்டி',
    '219': 'சங்கரன்கோவில்',
    '220': 'வாசுதேவனல்லூர்',
    '221': 'கடையநல்லூர்',
    '222': 'தென்காசி',
    '223': 'ஆலங்குளம்',
    '224': 'திருநெல்வேலி',
    '225': 'அம்பாசமுத்திரம்',
    '226': 'பாளையங்கோட்டை',
    '227': 'நாங்குநேரி',
    '228': 'இராதாபுரம்',
    '229': 'கன்னியாகுமரி',
    '230': 'நாகர்கோவில்',
    '231': 'கொல்லச்சேல்',
    '232': 'பத்மநாபபுரம்',
    '233': 'விளவங்கோடு',
    '234': 'கிள்ளியூர்',
}

with open('data/constituencies.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for cid, entry in data.items():
    entry['name_ta'] = CONSTITUENCY_TA.get(cid, entry['name'])
    entry['district_ta'] = DISTRICT_TA.get(entry['district'], entry['district'])

with open('data/constituencies.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Enriched {len(data)} constituencies with Tamil names.")
```

- [ ] **Step 2: Run the script**

```bash
cd /path/to/project   # replace with repo root
python3 scripts/enrich_constituencies.py
```

Expected output:
```
Enriched 234 constituencies with Tamil names.
```

- [ ] **Step 3: Verify a sample entry**

```bash
python3 -c "import json; d=json.load(open('data/constituencies.json')); print(d['1'])"
```

Expected to include `"name_ta": "கும்மிடிப்பூண்டி"` and `"district_ta": "திருவள்ளூர்"`.

- [ ] **Step 4: Commit**

```bash
git add data/constituencies.json scripts/enrich_constituencies.py
git commit -m "feat: add Tamil names (name_ta, district_ta) to all 234 constituencies"
```

---

## Task 5: Enrich election JSON files with Tamil candidate names

**Files:**
- Create: `scripts/enrich_candidates.py`
- Modify: `data/elections-2021.json`, `data/elections-2016.json`, `data/elections-2026.json`

- [ ] **Step 1: Create `scripts/enrich_candidates.py`**

```python
#!/usr/bin/env python3
"""
Add name_ta (Tamil script) to every candidate in all election JSON files.
Uses phonetic transliteration for Tamil Nadu names.
"""

import json
import re
import sys

# ── Common Tamil politician name words ──────────────────────────────────
# Maps uppercase English word → Tamil script
WORD_LOOKUP = {
    # Titles / honorifics
    'DR': 'டாக்டர்', 'DR.': 'டாக்டர்', 'ADV': 'வழக்கறிஞர்',
    'THIRU': 'திரு', 'TMT': 'திருமதி', 'SELVI': 'செல்வி',
    # Very common surname/given name components
    'MURUGAN': 'முருகன்', 'MURUGESAN': 'முருகேசன்', 'MURUGANANTHAM': 'முருகானந்தம்',
    'PALANISWAMI': 'பழனிசாமி', 'PALANISAMY': 'பழனிசாமி', 'PALANI': 'பழனி',
    'GOVINDARAJAN': 'கோவிந்தராஜன்', 'GOVINDASAMY': 'கோவிந்தசாமி',
    'EDAPPADI': 'ஏடப்பாடி', 'STALIN': 'ஸ்டாலின்',
    'ANNAMALAI': 'அண்ணாமலை', 'ANNAMALAISAMY': 'அண்ணாமலைசாமி',
    'RAMALINGAM': 'இராமலிங்கம்', 'RAMASAMY': 'இராமசாமி', 'RAMAN': 'இராமன்',
    'RAJA': 'இராஜா', 'RAJENDRAN': 'இராஜேந்திரன்', 'RAJASEKAR': 'இராஜசேகர்',
    'RAJKUMAR': 'இராஜ்குமார்', 'RAJAGOPALAN': 'இராஜகோபாலன்',
    'SHANKAR': 'சங்கர்', 'SHANMUGAM': 'சண்முகம்', 'SHANMUGAVEL': 'சண்முகவேல்',
    'KUMAR': 'குமார்', 'KUMARAN': 'குமரன்', 'KUMARAVEL': 'குமரவேல்',
    'SELVAM': 'செல்வம்', 'SELVAN': 'செல்வன்', 'SELVAKUMAR': 'செல்வகுமார்',
    'KRISHNAN': 'கிருஷ்ணன்', 'KRISHNASAMY': 'கிருஷ்ணசாமி', 'KRISHNA': 'கிருஷ்ணா',
    'VENKATESH': 'வெங்கடேஷ்', 'VENKATARAMAN': 'வெங்கட்ராமன்', 'VENKATESAN': 'வெங்கடேசன்',
    'SURESH': 'சுரேஷ்', 'SURESHKUMAR': 'சுரேஷ்குமார்',
    'SATHYAMURTHY': 'சத்தியமூர்த்தி', 'SATHISH': 'சதீஷ்', 'SATHYANARAYANA': 'சத்தியநாராயணன்',
    'THANGAVEL': 'தங்கவேல்', 'THANGARAJ': 'தங்கராஜ்', 'THANGARAJAN': 'தங்கராஜன்',
    'MANOHARAN': 'மனோகரன்', 'MANOHAR': 'மனோகர்',
    'BABU': 'பாபு', 'BALASUBRAMANIAN': 'பாலசுப்பிரமணியன்', 'BALAMURUGAN': 'பாலமுருகன்',
    'SEKAR': 'சேகர்', 'SEKARAN': 'சேகரன்',
    'KATHIRVEL': 'கதிர்வேல்', 'KATHIRESAN': 'கதிரேசன்',
    'SUNDARAM': 'சுந்தரம்', 'SUNDARRAJAN': 'சுந்தர்ராஜன்', 'SUNDAR': 'சுந்தர்',
    'SIVAKUMAR': 'சிவகுமார்', 'SIVARAJ': 'சிவராஜ்', 'SIVAJI': 'சிவாஜி',
    'ARUMUGAM': 'அருமுகம்', 'ARJUNAN': 'அர்ஜுனன்', 'ARUN': 'அருண்',
    'ANAND': 'ஆனந்த்', 'ANANDAN': 'ஆனந்தன்',
    'PANDIAN': 'பாண்டியன்', 'PANDIYAN': 'பாண்டியன்',
    'MUTHUKUMAR': 'முத்துகுமார்', 'MUTHUVEL': 'முத்துவேல்', 'MUTHU': 'முத்து',
    'NAGENDRA': 'நகேந்திரா', 'NAGARAJAN': 'நாகராஜன்', 'NAGA': 'நாகா',
    'PERIYASAMY': 'பெரியசாமி', 'PERIYARAJ': 'பெரியராஜ்',
    'VIJAY': 'விஜய்', 'VIJAYAKUMAR': 'விஜயகுமார்', 'VIJAYAN': 'விஜயன்',
    'VELAYUTHAM': 'வேலாயுதம்', 'VELUSAMY': 'வேலுசாமி', 'VELU': 'வேலு',
    'KANDASAMY': 'கந்தசாமி', 'KANNAN': 'கண்ணன்', 'KANDAN': 'கந்தன்',
    'DURAI': 'துரை', 'DURAISAMY': 'துரைசாமி', 'DURAIPANDIAN': 'துரைபாண்டியன்',
    'PERUMAL': 'பெருமாள்', 'PERUMALSAMY': 'பெருமாள்சாமி',
    'MARIMUTHU': 'மாரிமுத்து', 'MANIVANNAN': 'மணிவண்ணன்', 'MANI': 'மணி',
    'PALANIVEL': 'பழனிவேல்', 'PALANIKUMAR': 'பழனிகுமார்',
    'ILANGOVAN': 'இளங்கோவன்', 'ILAVARASAN': 'இளவரசன்',
    'GANESAN': 'கணேசன்', 'GANESH': 'கணேஷ்',
    'JAYARAJ': 'ஜெயராஜ்', 'JAYAKUMAR': 'ஜெயகுமார்', 'JAYA': 'ஜெயா',
    'LOGESH': 'லோகேஷ்', 'LOGASAMY': 'லோகசாமி',
    'PRAKASH': 'பிரகாஷ்', 'PRABHU': 'பிரபு', 'PRABU': 'பிரபு',
    'RAMESH': 'ரமேஷ்', 'RAMACHANDRAN': 'இராமச்சந்திரன்',
    'SENTHIL': 'செந்தில்', 'SENTHILKUMAR': 'செந்தில்குமார்',
    'TAMILARASAN': 'தமிழரசன்', 'TAMILSELVAN': 'தமிழ்செல்வன்', 'TAMIL': 'தமிழ்',
    'UDAYAKUMAR': 'உதயகுமார்', 'UDHAYAKUMAR': 'உதயகுமார்',
    'VELMURUGAN': 'வேல்முருகன்', 'VELMURUGADOSS': 'வேல்முருகதாஸ்',
    'XAVIER': 'சேவியர்', 'YADAV': 'யாதவ்',
    'ARUNACHALAM': 'அருணாசலம்', 'ANNADHURAI': 'அண்ணாதுரை',
    'THIRUMAVALAVAN': 'திருமாவளவன்', 'THIRUMURTHY': 'திருமூர்த்தி',
    'JAYALALITHAA': 'ஜெயலலிதா', 'JAYALALITHA': 'ஜெயலலிதா',
    'KARUNANIDHI': 'கருணாநிதி', 'KARUNANIDHI': 'கருணாநிதி',
    'ALAGIRI': 'அழகிரி', 'AZHAGIRI': 'அழகிரி',
    'KANIMOZHI': 'கனிமொழி', 'UDHAYANIDHI': 'உதயநிதி',
    'SEEMAN': 'சீமான்', 'VIJAYAKANTH': 'விஜயகாந்த்',
    'ANBUMANI': 'அன்புமணி', 'RAMADOSS': 'இராமதாஸ்',
    'VAIKO': 'வைகோ',
}

# ── Character-level phonetic fallback ──────────────────────────────────
# Processes digraphs/trigraphs first, then single chars
_PHONEME_PATTERNS = [
    # Common trigraphs
    ('THR', 'த்ர'), ('STH', 'ஸ்த'), ('KSH', 'க்ஷ'),
    # Digraphs
    ('TH', 'த'), ('SH', 'ஷ'), ('CH', 'ச'), ('GH', 'க'),
    ('KH', 'க'), ('DH', 'த'), ('BH', 'ப'), ('PH', 'ப'),
    ('NG', 'ங்'), ('NY', 'ஞ'), ('NH', 'ன'),
    ('AA', 'ஆ'), ('EE', 'ஈ'), ('OO', 'ஊ'),
    ('AI', 'ஐ'), ('AU', 'ஔ'), ('AE', 'ஏ'), ('OA', 'ஒ'),
    # Single consonants
    ('K', 'க'), ('G', 'க'), ('C', 'க'), ('J', 'ஜ'),
    ('T', 'ட'), ('D', 'ட'), ('N', 'ன'), ('P', 'ப'),
    ('B', 'ப'), ('M', 'ம'), ('Y', 'ய'), ('R', 'ர'),
    ('L', 'ல'), ('V', 'வ'), ('W', 'வ'), ('S', 'ஸ'),
    ('H', 'ஹ'), ('Z', 'ழ'), ('F', 'ப'), ('X', 'க்ஸ'),
    # Vowels
    ('A', 'அ'), ('E', 'எ'), ('I', 'இ'),
    ('O', 'ஒ'), ('U', 'உ'),
]

def _transliterate_word(word):
    """Phonetic transliterate a single UPPERCASE word to Tamil script."""
    s = word
    out = []
    i = 0
    while i < len(s):
        matched = False
        for eng, tam in _PHONEME_PATTERNS:
            if s[i:i+len(eng)] == eng:
                out.append(tam)
                i += len(eng)
                matched = True
                break
        if not matched:
            out.append(s[i])
            i += 1
    return ''.join(out)

def transliterate_name(name):
    """
    Convert an English candidate name to Tamil script.
    - Initials (single letters or letters with period) are kept as Latin + period.
    - Known Tamil political name words use the lookup table.
    - Unknown words use phonetic transliteration.
    """
    if not name:
        return name
    tokens = name.upper().split()
    result = []
    for token in tokens:
        # Strip trailing period for lookup
        bare = token.rstrip('.')
        has_period = token.endswith('.')
        # Single letter = initial — keep as-is (e.g. "T." stays "T.")
        if len(bare) == 1:
            result.append(token)
            continue
        if bare in WORD_LOOKUP:
            ta = WORD_LOOKUP[bare]
        else:
            ta = _transliterate_word(bare)
        result.append(ta + ('.' if has_period else ''))
    return ' '.join(result)

def enrich_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    count = 0
    for cid, constituency in data.get('constituencies', {}).items():
        for candidate in constituency.get('candidates', []):
            if 'name_ta' not in candidate:
                candidate['name_ta'] = transliterate_name(candidate.get('name', ''))
                count += 1
        # Also add name_ta to winner shortcut if present
        if 'winner' in constituency and isinstance(constituency['winner'], dict):
            if 'name_ta' not in constituency['winner']:
                constituency['winner']['name_ta'] = transliterate_name(
                    constituency['winner'].get('name', '')
                )
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'{path}: added name_ta to {count} candidates.')

if __name__ == '__main__':
    files = sys.argv[1:] or [
        'data/elections-2021.json',
        'data/elections-2016.json',
        'data/elections-2026.json',
    ]
    for f in files:
        enrich_file(f)
```

- [ ] **Step 2: Run the script**

```bash
python3 scripts/enrich_candidates.py
```

Expected output (approximate counts):
```
data/elections-2021.json: added name_ta to 4232 candidates.
data/elections-2016.json: added name_ta to 3988 candidates.
data/elections-2026.json: added name_ta to 945 candidates.
```

- [ ] **Step 3: Spot-check a known candidate name**

```bash
python3 -c "
import json
d = json.load(open('data/elections-2021.json'))
# Check constituency 1's first candidate
c = d['constituencies']['1']['candidates'][0]
print('Name:', c['name'])
print('Name TA:', c['name_ta'])
"
```

Expected: `name_ta` is a non-empty Tamil string.

- [ ] **Step 4: Commit**

```bash
git add data/elections-2021.json data/elections-2016.json data/elections-2026.json scripts/enrich_candidates.py
git commit -m "feat: add Tamil candidate name (name_ta) to all election data files"
```

---

## Task 6: Update `js/data/dataQueries.js`

**Files:**
- Modify: `js/data/dataQueries.js`

- [ ] **Step 1: Update `getConstituencyList()` to include `name_ta` and `district_ta`**

Find in `dataQueries.js` (lines 33–46):
```javascript
    async function getConstituencyList(district = null) {
        const meta = await DataLoader.loadConstituencyMeta();
        let list = Object.entries(meta).map(([id, data]) => ({
            id,
            name: data.name,
            district: data.district
        }));

        if (district) {
            list = list.filter(c => c.district === district);
        }

        return list.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    }
```

Replace with:
```javascript
    async function getConstituencyList(district = null) {
        const meta = await DataLoader.loadConstituencyMeta();
        let list = Object.entries(meta).map(([id, data]) => ({
            id,
            name: data.name,
            name_ta: data.name_ta || data.name,
            district: data.district,
            district_ta: data.district_ta || data.district
        }));

        if (district) {
            list = list.filter(c => c.district === district);
        }

        return list.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    }
```

- [ ] **Step 2: Commit**

```bash
git add js/data/dataQueries.js
git commit -m "feat: expose name_ta and district_ta in getConstituencyList"
```

---

## Task 7: Update `js/ui.js` for language-aware rendering

**Files:**
- Modify: `js/ui.js`

This task adds language awareness to: district dropdown, constituency dropdown, constituency overlay, election results table, election history section, and wires the `langchange` listener.

- [ ] **Step 1: Update `populateDistrictDropdown()` to use Tamil district names when lang is `ta`**

Find (lines 157–166):
```javascript
    async function populateDistrictDropdown() {
        const districts = await DataModule.getDistrictList();
        districtFilter.innerHTML = '<option value="">All Districts</option>';
        districts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            districtFilter.appendChild(opt);
        });
    }
```

Replace with:
```javascript
    async function populateDistrictDropdown() {
        const lang = (typeof I18n !== 'undefined') ? I18n.getLang() : 'en';
        // Build district → district_ta map from constituency list
        const constituencies = await DataModule.getConstituencyList();
        const districtMap = {};
        constituencies.forEach(c => {
            if (!districtMap[c.district]) districtMap[c.district] = c.district_ta || c.district;
        });
        const districts = await DataModule.getDistrictList();
        const allLabel = (typeof I18n !== 'undefined') ? I18n.t('filter.all_districts') : 'All Districts';
        districtFilter.innerHTML = `<option value="">${allLabel}</option>`;
        districts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = lang === 'ta' ? (districtMap[d] || d) : d;
            districtFilter.appendChild(opt);
        });
    }
```

- [ ] **Step 2: Update `populateConstituencyDropdown()` to use Tamil names when lang is `ta`**

Find (lines 168–177):
```javascript
    async function populateConstituencyDropdown(district = null) {
        const list = await DataModule.getConstituencyList(district);
        constituencyFilter.innerHTML = '<option value="">All Constituencies</option>';
        list.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            constituencyFilter.appendChild(opt);
        });
    }
```

Replace with:
```javascript
    async function populateConstituencyDropdown(district = null) {
        const lang = (typeof I18n !== 'undefined') ? I18n.getLang() : 'en';
        const list = await DataModule.getConstituencyList(district);
        const allLabel = (typeof I18n !== 'undefined') ? I18n.t('filter.all_constituencies') : 'All Constituencies';
        constituencyFilter.innerHTML = `<option value="">${allLabel}</option>`;
        list.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = lang === 'ta' ? (c.name_ta || c.name) : c.name;
            constituencyFilter.appendChild(opt);
        });
    }
```

- [ ] **Step 3: Update `showConstituencyOverlay()` to use Tamil district name and badge labels**

In `showConstituencyOverlay()`, find these two lines (around line 456–460):
```javascript
        document.getElementById('constituency-type').textContent = info.type || 'General';
        document.getElementById('constituency-type').className = `constituency-badge ${info.type === 'SC' ? 'sc' : ''}`;
        document.querySelector('#constituency-name .name-en').textContent = info.name;
        document.querySelector('#constituency-name .name-ta').textContent = info.name_ta || '';
        document.getElementById('constituency-district').textContent = info.district;
```

Replace with:
```javascript
        const lang = (typeof I18n !== 'undefined') ? I18n.getLang() : 'en';
        const badgeKey = info.type === 'SC' ? 'badge.sc' : 'badge.general';
        document.getElementById('constituency-type').textContent =
            (typeof I18n !== 'undefined') ? I18n.t(badgeKey) : (info.type || 'General');
        document.getElementById('constituency-type').className = `constituency-badge ${info.type === 'SC' ? 'sc' : ''}`;
        document.querySelector('#constituency-name .name-en').textContent = info.name;
        document.querySelector('#constituency-name .name-ta').textContent = info.name_ta || '';
        document.getElementById('constituency-district').textContent =
            lang === 'ta' ? (info.district_ta || info.district) : info.district;
```

- [ ] **Step 4: Update election history render to use Tamil winner names**

In `showConstituencyOverlay()`, find the election history section title line (around line 469):
```javascript
            if (historyTitle) {
                historyTitle.innerHTML = `Election History <span class="section-subtitle">Winner's Margin / %</span>`;
            }
```

Replace with:
```javascript
            if (historyTitle) {
                const histLabel = (typeof I18n !== 'undefined') ? I18n.t('overlay.election_history') : 'Election History';
                historyTitle.innerHTML = `${histLabel} <span class="section-subtitle">Winner's Margin / %</span>`;
            }
```

In the same section, find the candidate name render in the history map (around line 485):
```javascript
                        <div class="candidate-name">${h.winner.name}</div>
```

Replace with:
```javascript
                        <div class="candidate-name">${lang === 'ta' ? (h.winner.name_ta || h.winner.name) : h.winner.name}</div>
```

Also find the `'No data'` string in the history section (around line 497):
```javascript
            }).join('') : '<p class="no-data">No data</p>';
```

Replace with:
```javascript
            }).join('') : `<p class="no-data">${(typeof I18n !== 'undefined') ? I18n.t('overlay.no_data') : 'No data'}</p>`;
```

- [ ] **Step 5: Update `updateOverlayElectionResults()` to use Tamil candidate names and translated labels**

In `updateOverlayElectionResults()`, find (around line 715–717):
```javascript
        if (year === 2026) {
            if (resultsTitle) {
                resultsTitle.innerHTML = `Declared Candidates <span class="section-subtitle">2026</span>`;
            }
```

Replace with:
```javascript
        const lang = (typeof I18n !== 'undefined') ? I18n.getLang() : 'en';
        if (year === 2026) {
            if (resultsTitle) {
                const declLabel = (typeof I18n !== 'undefined') ? I18n.t('overlay.declared_candidates') : 'Declared Candidates';
                resultsTitle.innerHTML = `${declLabel} <span class="section-subtitle">2026</span>`;
            }
```

Find the 2026 candidate name render (around line 736):
```javascript
                                <div class="candidate-name">${c.name}${starBadge}</div>
```

Replace with:
```javascript
                                <div class="candidate-name">${lang === 'ta' ? (c.name_ta || c.name) : c.name}${starBadge}</div>
```

Find the no-candidates string (around line 745):
```javascript
                    candidatesEl.innerHTML = '<p class="no-data">No candidates declared</p>';
```

Replace with:
```javascript
                    candidatesEl.innerHTML = `<p class="no-data">${(typeof I18n !== 'undefined') ? I18n.t('overlay.no_candidates') : 'No candidates declared'}</p>`;
```

For post-2026 results, find (around line 753–755):
```javascript
        if (resultsTitle) {
            resultsTitle.innerHTML = `Election Results <span class="section-subtitle">Votes / Share %</span>`;
        }
```

Replace with:
```javascript
        if (resultsTitle) {
            const resLabel = (typeof I18n !== 'undefined') ? I18n.t('overlay.election_results') : 'Election Results';
            resultsTitle.innerHTML = `${resLabel} <span class="section-subtitle">Votes / Share %</span>`;
        }
```

Find the candidate name in the post-2026 results table (around line 794):
```javascript
                            <div class="candidate-name">${c.name}</div>
```

Replace with:
```javascript
                            <div class="candidate-name">${lang === 'ta' ? (c.name_ta || c.name) : c.name}</div>
```

Find the no-data message (around line 809):
```javascript
                candidatesEl.innerHTML = '<p class="no-data">No candidate data available for this year</p>';
```

Replace with:
```javascript
                candidatesEl.innerHTML = `<p class="no-data">${(typeof I18n !== 'undefined') ? I18n.t('overlay.no_candidate_data') : 'No candidate data available for this year'}</p>`;
```

Find the error message (around line 812):
```javascript
            candidatesEl.innerHTML = '<p class="no-data">Error loading data</p>';
```

Replace with:
```javascript
            candidatesEl.innerHTML = `<p class="no-data">${(typeof I18n !== 'undefined') ? I18n.t('overlay.error_loading') : 'Error loading data'}</p>`;
```

- [ ] **Step 6: Add `langchange` event listener inside the `init()` function of UIModule**

In `init()` (around line 48, after `setupOverlayYearControls();`), add:
```javascript
        // Language change: re-render dropdowns and open overlay
        document.addEventListener('langchange', async () => {
            await populateDistrictDropdown();
            const district = districtFilter.value;
            await populateConstituencyDropdown(district || null);
            if (currentConstituencyId) {
                await showConstituencyOverlay(currentConstituencyId);
            }
        });
```

- [ ] **Step 7: Commit**

```bash
git add js/ui.js
git commit -m "feat: make ui.js language-aware for Tamil/English toggle"
```

---

## Task 8: Update `js/elections-2026.js` for language-aware rendering

**Files:**
- Modify: `js/elections-2026.js`

The three tab render functions are: `e2026_renderAlliances()`, `e2026_renderCandidates()`, `e2026_renderStars()`. The init IIFE is at the bottom of the file (line ~801). Add the dispatch helper and langchange listener after the IIFE.

- [ ] **Step 1: Add `e2026_renderTab()` helper and `langchange` listener at the very end of `js/elections-2026.js`**

Append after the closing `})();` of the `e2026_init` IIFE:

```javascript

function e2026_renderTab(tab) {
    if (tab === 'alliances') e2026_renderAlliances();
    else if (tab === 'candidates') e2026_renderCandidates();
    else if (tab === 'stars') e2026_renderStars();
}

document.addEventListener('langchange', () => {
    const modal = document.getElementById('elections-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    e2026_renderStepper();
    const activePanel = modal.querySelector('.epg-tab-panel.active');
    if (activePanel) {
        const tab = activePanel.id.replace('epg-tab-', '');
        e2026_renderTab(tab);
    }
});
```

- [ ] **Step 2: Commit**

```bash
git add js/elections-2026.js
git commit -m "feat: re-render elections-2026 modal on langchange event"
```

---

## Task 9: Verify and final commit

- [ ] **Step 1: Start the dev server and open the site**

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

- [ ] **Step 2: Verify English mode (default)**

- Filter labels show: Year, District, Constituency, Candidate Name
- Back button shows: Overview
- Elections 2026 button label shows: Elections 2026
- `EN` is highlighted in the pill toggle

- [ ] **Step 3: Switch to Tamil and verify**

Click `த` in the pill toggle.

- Filter labels switch to Tamil: ஆண்டு, மாவட்டம், தொகுதி, வேட்பாளர் பெயர்
- Back button: கண்ணோட்டம்
- Elections 2026 button: தேர்தல் 2026
- District dropdown options show Tamil district names
- Constituency dropdown options show Tamil constituency names
- `த` is now highlighted in the pill

- [ ] **Step 4: Click a constituency on the map and verify the overlay**

- Constituency name in `.name-ta` shows Tamil name
- District shows Tamil district name
- In election results table, candidate names show Tamil transliteration
- Section title shows "தேர்தல் முடிவுகள்"
- Registered Voters label: "பதிவு செய்த வாக்காளர்கள்"

- [ ] **Step 5: Open Elections 2026 modal and verify tabs**

- Tab buttons show: கூட்டணிகள், வேட்பாளர்கள், நட்சத்திரங்கள்
- Countdown label shows: வாக்குப்பதிவு நாள் — ஏப். 23
- Countdown units show: நா, ம, நி, வி

- [ ] **Step 6: Verify localStorage persistence**

- Reload page with Tamil active — should stay Tamil
- Open DevTools → Application → localStorage → `tn-map-lang` should be `'ta'`

- [ ] **Step 7: Verify mobile layout**

Open DevTools device emulation at 375px width. Check:
- The pill toggle fits in the header actions row
- No overflow

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "feat: Tamil language toggle — complete implementation"
```
