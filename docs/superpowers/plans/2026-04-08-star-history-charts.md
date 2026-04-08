# Star History Charts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add collapsible Chart.js line charts to each star candidate card showing win/loss margins across the past 5 Tamil Nadu assembly elections (2001–2021).

**Architecture:** Chart.js loaded via CDN. History data embedded directly in `STAR_CANDIDATES_2026`. Cards gain a click-to-toggle chart panel rendered as a sibling element inside a wrapper div. One card open at a time; M.K. Stalin's card opens by default. Chart instances destroyed on close to keep memory low.

**Tech Stack:** Chart.js 4.x (CDN), vanilla JS (IIFE pattern), vanilla CSS custom properties

---

## File Map

| File | Change |
|------|--------|
| `index.html` | Add Chart.js `<script>` tag before `elections-2026.js` |
| `js/elections-2026-data.js` | Add `history: [...]` to every object in `STAR_CANDIDATES_2026` |
| `js/elections-2026.js` | Rewrite `e2026_renderStars()`; add `e2026_toggleStarCard()` and `e2026_renderStarChart()` helpers; add 4 module-level tracking variables |
| `css/components/elections-2026.css` | Add styles for `.epg-star-card-wrap`, `.epg-star-chevron`, `.epg-star-chart-panel`, `.epg-star-canvas`, `.epg-star-no-history` |

---

## Task 1: Add Chart.js CDN

**Files:**
- Modify: `index.html:387` (before the elections-2026-data.js script tag)

- [ ] **Step 1: Add the Chart.js script tag**

In `index.html`, find the `<!-- Elections 2026 Modal -->` comment block and add Chart.js before the data file:

```html
    <!-- Elections 2026 Modal -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js"></script>
    <script src="js/elections-2026-data.js"></script>
    <script src="js/elections-2026.js"></script>
```

- [ ] **Step 2: Verify Chart.js loads**

Open `http://localhost:8000` in a browser, open DevTools Console, and run:

```js
typeof Chart
```

Expected: `"function"`

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Chart.js 4.4.8 CDN for star history charts"
```

---

## Task 2: Embed history data in STAR_CANDIDATES_2026

**Files:**
- Modify: `js/elections-2026-data.js:1046-1086`

**Rules:**
- `history` array is ordered most-recent first: `[2021, 2016, 2011, 2006, 2001]`
- `null` = did not contest that year
- `history: []` = no data for any of the 5 elections

- [ ] **Step 1: Replace the STAR_CANDIDATES_2026 array with the version below**

Find `const STAR_CANDIDATES_2026 = [` in `js/elections-2026-data.js` and replace the entire array (lines 1045–1086) with:

```js
const STAR_CANDIDATES_2026 = [
    // DMK
    {
        name: 'M.K. Stalin', party: 'DMK', partyColor: '#e53935', constituency: 'Kolathur',
        note: 'Chief Minister', status: 'confirmed', photo: 'assets/photos/stalin.jpg',
        history: [
            { year: 2021, margin: 34.2 },
            { year: 2016, margin: 21.4 },
            { year: 2011, margin: 1.6  },
            { year: 2006, margin: 2.2  },
            { year: 2001, margin: 5.3  },
        ]
    },
    {
        name: 'Udhayanidhi Stalin', party: 'DMK', partyColor: '#e53935', constituency: 'Chepauk-Thiruvallikeni',
        note: 'Deputy Chief Minister', status: 'confirmed', photo: 'assets/photos/udhayanidhi.jpg',
        history: [
            { year: 2021, margin: 44.1 },
            { year: 2016, margin: null },
            { year: 2011, margin: null },
            { year: 2006, margin: null },
            { year: 2001, margin: null },
        ]
    },
    {
        name: 'V. Senthil Balaji', party: 'DMK', partyColor: '#e53935', constituency: 'Coimbatore South',
        note: 'Ex-minister, moved from Karur', status: 'confirmed', photo: 'assets/photos/senthil-balaji.jpg',
        history: [
            { year: 2021, margin: 6.2  },
            { year: 2016, margin: 14.6 },
            { year: 2011, margin: 28.1 },
            { year: 2006, margin: 3.5  },
            { year: 2001, margin: -3.8 },
        ]
    },
    {
        name: 'Dr. P.T.R. Palanivel Thiagarajan', party: 'DMK', partyColor: '#e53935', constituency: 'Madurai Central',
        note: 'Finance Minister', status: 'confirmed', photo: 'assets/photos/ptr.jpg',
        history: [
            { year: 2021, margin: 25.4 },
            { year: 2016, margin: 3.5  },
            { year: 2011, margin: null },
            { year: 2006, margin: null },
            { year: 2001, margin: null },
        ]
    },
    {
        name: 'Thangam Thennarasu', party: 'DMK', partyColor: '#e53935', constituency: 'Tiruchuli',
        note: 'Industries & Commerce Minister', status: 'confirmed', photo: 'assets/photos/thennarasu.jpg',
        history: [
            { year: 2021, margin: 30.9 },
            { year: 2016, margin: 16.0 },
            { year: 2011, margin: 11.1 },
            { year: 2006, margin: 2.8  },
            { year: 2001, margin: -3.1 },
        ]
    },
    {
        name: 'K.N. Nehru', party: 'DMK', partyColor: '#e53935', constituency: 'Tiruchirappalli West',
        note: 'Senior cabinet minister', status: 'confirmed', photo: 'assets/photos/kn-nehru.jpg',
        history: [
            { year: 2021, margin: 33.9 },
            { year: 2016, margin: 15.1 },
            { year: 2011, margin: -3.9 },
            { year: 2006, margin: 8.7  },
            { year: 2001, margin: 8.1  },
        ]
    },
    {
        name: 'O. Panneerselvam', party: 'DMK', partyColor: '#e53935', constituency: 'Bodinayakkanur',
        note: 'Former AIADMK CM, switched to DMK', status: 'confirmed', photo: 'assets/photos/ops.jpg',
        history: [
            { year: 2021, margin: 5.5  },
            { year: 2016, margin: 8.9  },
            { year: 2011, margin: 16.2 },
            { year: 2006, margin: 14.6 },
            { year: 2001, margin: 16.4 },
        ]
    },
    {
        name: 'Duraimurugan', party: 'DMK', partyColor: '#e53935', constituency: 'Katpadi',
        note: 'Senior DMK leader & former MP', status: 'confirmed', photo: 'assets/photos/duraimurugan.jpg',
        history: [
            { year: 2021, margin: 0.4  },
            { year: 2016, margin: 13.5 },
            { year: 2011, margin: 2.0  },
            { year: 2006, margin: 23.3 },
            { year: 2001, margin: 6.2  },
        ]
    },
    {
        name: 'Anbil Mahesh Poyyamozhi', party: 'DMK', partyColor: '#e53935', constituency: 'Thiruverambur',
        note: 'Minister for School Education', status: 'confirmed', photo: 'assets/photos/anbil-mahesh.jpg',
        history: [
            { year: 2021, margin: 25.2 },
            { year: 2016, margin: 9.1  },
            { year: 2011, margin: null },
            { year: 2006, margin: null },
            { year: 2001, margin: null },
        ]
    },
    // AIADMK
    {
        name: 'Edapadi K. Palanisami', party: 'AIADMK', partyColor: '#4caf50', constituency: 'Edapadi',
        note: 'AIADMK General Secretary, former CM', status: 'confirmed', photo: 'assets/photos/edapadi.jpg',
        history: [
            { year: 2021, margin: 38.6  },
            { year: 2016, margin: 20.3  },
            { year: 2011, margin: 17.2  },
            { year: 2006, margin: -10.1 },
            { year: 2001, margin: -12.4 },
        ]
    },
    {
        name: 'D. Jayakumar', party: 'AIADMK', partyColor: '#4caf50', constituency: 'Royapuram',
        note: 'Senior AIADMK leader, ex-minister', status: 'confirmed', photo: 'assets/photos/jayakumar.jpg',
        history: [
            { year: 2021, margin: -23.1 },
            { year: 2016, margin: 5.2   },
            { year: 2011, margin: 15.5  },
            { year: 2006, margin: 11.8  },
            { year: 2001, margin: 12.8  },
        ]
    },
    {
        name: 'S.P. Velumani', party: 'AIADMK', partyColor: '#4caf50', constituency: 'Thondamuthur',
        note: 'Ex-minister for Municipal Administration', status: 'confirmed', photo: 'assets/photos/velumani.jpg',
        history: [
            { year: 2021, margin: 11.3 },
            { year: 2016, margin: 34.0 },
            { year: 2011, margin: 31.4 },
            { year: 2006, margin: 7.2  },
            { year: 2001, margin: null },
        ]
    },
    {
        name: 'M.R. Vijayabaskar', party: 'AIADMK', partyColor: '#4caf50', constituency: 'Karur',
        note: 'Ex-Health & Finance Minister', status: 'confirmed', photo: 'assets/photos/mr-vijayabaskar.jpg',
        history: [
            { year: 2021, margin: -6.2 },
            { year: 2016, margin: 0.2  },
            { year: 2011, margin: null },
            { year: 2006, margin: null },
            { year: 2001, margin: null },
        ]
    },
    {
        name: 'Dr. C. Vijayabaskar', party: 'AIADMK', partyColor: '#4caf50', constituency: 'Viralimalai',
        note: 'Ex-Health Minister', status: 'confirmed', photo: 'assets/photos/c-vijayabaskar.jpg',
        history: [
            { year: 2021, margin: 12.2 },
            { year: 2016, margin: 5.0  },
            { year: 2011, margin: 28.5 },
            { year: 2006, margin: null },
            { year: 2001, margin: 5.7  },
        ]
    },
    {
        name: 'Kadambur C. Rajoo', party: 'AIADMK', partyColor: '#4caf50', constituency: 'Kovilpatti',
        note: 'Senior AIADMK leader', status: 'confirmed', photo: 'assets/photos/kadambur.jpg',
        history: [
            { year: 2021, margin: 6.7  },
            { year: 2016, margin: 0.3  },
            { year: 2011, margin: 15.2 },
            { year: 2006, margin: null },
            { year: 2001, margin: null },
        ]
    },
    // INC
    {
        name: 'K. Selvaperunthagai', party: 'INC', partyColor: '#2196f3', constituency: 'Sriperumbudur',
        note: 'TNCC President, prominent state assembly voice', status: 'confirmed', photo: 'assets/photos/selvaperunthagai.jpg',
        history: [
            { year: 2021, margin: 4.1  },
            { year: 2016, margin: -4.5 },
            { year: 2011, margin: -5.1 },
            { year: 2006, margin: 4.8  },
            { year: 2001, margin: null },
        ]
    },
    {
        name: 'JMH Aassan Maulaana', party: 'INC', partyColor: '#2196f3', constituency: 'Velachery',
        note: 'Sitting MLA, TN Youth Congress President', status: 'confirmed', photo: 'assets/photos/aassan.jpg',
        history: [
            { year: 2021, margin: 2.5  },
            { year: 2016, margin: null },
            { year: 2011, margin: null },
            { year: 2006, margin: null },
            { year: 2001, margin: null },
        ]
    },
    {
        name: 'Dr. A. Chella Kumar', party: 'INC', partyColor: '#2196f3', constituency: 'Krishnagiri',
        note: 'Veteran politician & former MP', status: 'confirmed', photo: 'assets/photos/chella-kumar.jpg',
        history: [
            { year: 2021, margin: null  },
            { year: 2016, margin: null  },
            { year: 2011, margin: -24.8 },
            { year: 2006, margin: null  },
            { year: 2001, margin: -16.8 },
        ]
    },
    // PMK
    {
        name: 'Sowmiya Anbumani', party: 'PMK', partyColor: '#ffeb3b', constituency: 'Dharmapuri',
        note: 'Wife of PMK president Anbumani Ramadoss', status: 'confirmed', photo: 'assets/photos/sowmiya.jpg',
        history: []
    },
    {
        name: 'M Thilagabama', party: 'PMK', partyColor: '#ffeb3b', constituency: 'Perambur',
        note: 'PMK Party Treasurer', status: 'confirmed', photo: 'assets/photos/thilagabama.jpg',
        history: [
            { year: 2021, margin: -16.4 },
            { year: 2016, margin: null  },
            { year: 2011, margin: null  },
            { year: 2006, margin: null  },
            { year: 2001, margin: null  },
        ]
    },
    // TVK
    {
        name: 'C. Joseph Vijay', party: 'TVK', partyColor: '#ff5722', constituency: 'Perambur',
        note: 'Actor & TVK founder-president', status: 'confirmed', photo: 'assets/photos/vijay.jpg',
        history: []
    },
    {
        name: 'Adhav Arjuna', party: 'TVK', partyColor: '#ff5722', constituency: 'Villivakkam',
        note: 'General Secretary of Election Campaign Management', status: 'confirmed', photo: 'assets/photos/adhav-arjuna.jpg',
        history: []
    },
    {
        name: 'Bussy N Anand', party: 'TVK', partyColor: '#ff5722', constituency: 'Theayagaraya Nagar',
        note: 'General Secretary', status: 'confirmed', photo: 'assets/photos/bussy.jpg',
        history: [
            { year: 2021, margin: null  },
            { year: 2016, margin: null  },
            { year: 2011, margin: null  },
            { year: 2006, margin: 10.5  },
            { year: 2001, margin: -45.1 },
        ]
    },
    {
        name: 'Rajmohan', party: 'TVK', partyColor: '#ff5722', constituency: 'Egmore',
        note: 'Propaganda Secretary', status: 'confirmed', photo: 'assets/photos/rajmohan.jpg',
        history: []
    },
    // NTK
    {
        name: 'Seeman', party: 'NTK', partyColor: '#f44336', constituency: 'Karaikudi',
        note: 'NTK founder & party leader', status: 'confirmed', photo: 'assets/photos/seeman.jpg',
        history: [
            { year: 2021, margin: -15.4 },
            { year: 2016, margin: -9.2  },
            { year: 2011, margin: null  },
            { year: 2006, margin: null  },
            { year: 2001, margin: null  },
        ]
    },
    // DMDK
    {
        name: 'Vijayaprabhakar', party: 'DMDK', partyColor: '#9c27b0', constituency: 'Virudhunagar',
        note: 'DMDK leader', status: 'confirmed', photo: 'assets/photos/vijayaprabhakar.jpg',
        history: []
    },
    {
        name: 'Premalatha Vijaykanth', party: 'DMDK', partyColor: '#9c27b0', constituency: 'Vriddhachalam',
        note: 'DMDK General Secretary', status: 'confirmed', photo: 'assets/photos/premalatha.jpg',
        history: [
            { year: 2021, margin: -14.6 },
            { year: 2016, margin: null  },
            { year: 2011, margin: null  },
            { year: 2006, margin: null  },
            { year: 2001, margin: null  },
        ]
    },
    // BJP
    {
        name: 'Tamilisai Soundararajan', party: 'BJP', partyColor: '#ff9800', constituency: 'Mylapore',
        note: 'Former Governor of Telangana', status: 'confirmed', photo: 'assets/photos/tamilisai.jpg',
        history: [
            { year: 2021, margin: null  },
            { year: 2016, margin: -13.6 },
            { year: 2011, margin: -11.4 },
            { year: 2006, margin: -14.1 },
            { year: 2001, margin: null  },
        ]
    },
    {
        name: 'Vanathi Srinivasan', party: 'BJP', partyColor: '#ff9800', constituency: 'Coimbatore North',
        note: 'Former MP, BJP Tamil Nadu chief', status: 'confirmed', photo: 'assets/photos/vanathi.jpg',
        history: [
            { year: 2021, margin: 0.7   },
            { year: 2016, margin: -10.4 },
            { year: 2011, margin: -8.2  },
            { year: 2006, margin: null  },
            { year: 2001, margin: null  },
        ]
    },
    {
        name: 'L. Murugan', party: 'BJP', partyColor: '#ff9800', constituency: 'Avanashi',
        note: 'Union Minister of State', status: 'confirmed', photo: 'assets/photos/murugan.jpg',
        history: [
            { year: 2021, margin: -0.1  },
            { year: 2016, margin: null  },
            { year: 2011, margin: -24.1 },
            { year: 2006, margin: null  },
            { year: 2001, margin: null  },
        ]
    },
    {
        name: 'Nainar Nagenthran', party: 'BJP', partyColor: '#ff9800', constituency: 'Sattur',
        note: 'BJP Tamil Nadu president', status: 'confirmed', photo: 'assets/photos/nainar.jpg',
        history: [
            { year: 2021, margin: 10.9  },
            { year: 2016, margin: -17.4 },
            { year: 2011, margin: -11.6 },
            { year: 2006, margin: 0.7   },
            { year: 2001, margin: 0.9   },
        ]
    },
];
```

- [ ] **Step 2: Verify the array parses without errors**

Open `http://localhost:8000` in a browser, open DevTools Console. If there are syntax errors they will appear here. Expected: no errors.

Also run in console:
```js
STAR_CANDIDATES_2026.length
```
Expected: `31`

```js
STAR_CANDIDATES_2026[0].history.length
```
Expected: `5`

- [ ] **Step 3: Commit**

```bash
git add js/elections-2026-data.js
git commit -m "feat: add election history data to star candidates"
```

---

## Task 3: Add CSS for chart panel

**Files:**
- Modify: `css/components/elections-2026.css` (append after existing `.epg-star-*` rules, around line 1480)

- [ ] **Step 1: Append the new rules to the end of the stars section**

Find the `.epg-stars-grid` responsive override block (around line 1474) in `css/components/elections-2026.css` and add the following **after** all existing `.epg-star-*` rules:

```css
/* ── Star card wrap (groups card + chart panel) ── */
.epg-star-card-wrap {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

/* Click cursor on cards */
.epg-star-card {
    cursor: pointer;
    position: relative;
}

/* Chevron indicator */
.epg-star-chevron {
    position: absolute;
    bottom: var(--space-2);
    right: var(--space-3);
    font-size: 0.65rem;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
    line-height: 1;
    pointer-events: none;
}

.epg-star-card.is-open .epg-star-chevron {
    transform: rotate(90deg);
}

/* Chart panel */
.epg-star-chart-panel {
    display: none;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border);
    border-top: none;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    padding: var(--space-3) var(--space-4);
}

.epg-star-chart-panel.is-open {
    display: block;
}

/* Canvas height (Chart.js respects this with maintainAspectRatio: false) */
.epg-star-canvas {
    width: 100% !important;
    height: 120px !important;
}

/* No-history message */
.epg-star-no-history {
    margin: 0;
    padding: var(--space-2) 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    font-style: italic;
    text-align: center;
}
```

- [ ] **Step 2: Commit**

```bash
git add css/components/elections-2026.css
git commit -m "feat: add CSS for star card chart panel and chevron"
```

---

## Task 4: Update JS — renderStars, toggle, and chart helper

**Files:**
- Modify: `js/elections-2026.js:717-764` (`e2026_renderStars` function)

- [ ] **Step 1: Add four module-level tracking variables**

Find the line `let e2026_pageInterval = null;` (around line 316) in `js/elections-2026.js` and add the four tracking variables directly after it:

```js
let e2026_openStarIdx   = null;
let e2026_openStarChart = null;
let e2026_openStarCard  = null;
let e2026_openStarPanel = null;
```

- [ ] **Step 2: Replace e2026_renderStars() entirely**

Find `function e2026_renderStars() {` in `js/elections-2026.js` and replace the entire function (lines 717–764) with:

```js
function e2026_renderStars() {
    const container = document.getElementById('epg-tab-stars');
    if (!container || typeof STAR_CANDIDATES_2026 === 'undefined') return;

    container.innerHTML = '';

    // Reset tracking state each time the tab is rendered
    if (e2026_openStarChart) { e2026_openStarChart.destroy(); e2026_openStarChart = null; }
    e2026_openStarIdx   = null;
    e2026_openStarCard  = null;
    e2026_openStarPanel = null;

    if (STAR_CANDIDATES_2026.length === 0) {
        container.innerHTML = '<div class="epg-coming-soon">Star picks coming soon</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'epg-stars-grid';

    STAR_CANDIDATES_2026.forEach((star, idx) => {
        const logo = PartyConfig.getLogo(star.party);
        const logoHtml = logo && !logo.includes('placeholder')
            ? `<img class="epg-star-logo" src="${logo}" alt="${star.party}" />`
            : '';
        const borderGradient = PartyConfig.getBorderGradient(star.party);
        const photoHtml = star.photo
            ? `<div class="epg-star-photo-wrap" style="background: ${borderGradient};">
                   <img class="epg-star-photo" src="${star.photo}" alt="${star.name}" onerror="this.parentElement.style.display='none'" />
               </div>`
            : '';

        const wrap = document.createElement('div');
        wrap.className = 'epg-star-card-wrap';

        const card = document.createElement('div');
        card.className = 'epg-star-card';
        card.innerHTML = `
            ${photoHtml}
            <div class="epg-star-info">
                <div class="epg-star-row epg-star-row-top">
                    <span class="epg-star-name">${star.name}</span>
                    <span class="epg-star-party-wrap">
                        ${logoHtml}
                        <span class="epg-star-party" style="background-color: ${star.partyColor}; color: ${PartyConfig.getTextColorForHex(star.partyColor)};">${star.party}</span>
                    </span>
                </div>
                <div class="epg-star-row epg-star-row-bottom">
                    <span class="epg-star-note">${star.note || ''}</span>
                    <span class="epg-star-constituency">${star.constituency}</span>
                </div>
            </div>
            <span class="epg-star-chevron">▸</span>
        `;

        const panel = document.createElement('div');
        panel.className = 'epg-star-chart-panel';
        panel.setAttribute('data-star-idx', String(idx));

        if (!star.history || star.history.length === 0) {
            panel.innerHTML = `<p class="epg-star-no-history">Did not contest in the past 5 Tamil Nadu assembly elections</p>`;
        } else {
            panel.innerHTML = `<canvas class="epg-star-canvas"></canvas>`;
        }

        card.addEventListener('click', () => e2026_toggleStarCard(idx, card, panel));

        wrap.appendChild(card);
        wrap.appendChild(panel);
        grid.appendChild(wrap);
    });

    container.appendChild(grid);

    // Open Stalin's card (index 0) by default
    const firstCard  = grid.querySelectorAll('.epg-star-card')[0];
    const firstPanel = grid.querySelectorAll('.epg-star-chart-panel')[0];
    if (firstCard && firstPanel) {
        e2026_toggleStarCard(0, firstCard, firstPanel);
    }
}
```

- [ ] **Step 3: Add e2026_toggleStarCard() and e2026_renderStarChart() after e2026_renderStars()**

Immediately after the closing `}` of `e2026_renderStars()`, add:

```js
function e2026_toggleStarCard(idx, card, panel) {
    const isOpen = idx === e2026_openStarIdx;

    // Close the currently open card if it's a different one
    if (e2026_openStarIdx !== null && !isOpen) {
        e2026_openStarCard.classList.remove('is-open');
        e2026_openStarPanel.classList.remove('is-open');
        if (e2026_openStarChart) { e2026_openStarChart.destroy(); e2026_openStarChart = null; }
        e2026_openStarIdx   = null;
        e2026_openStarCard  = null;
        e2026_openStarPanel = null;
    }

    if (isOpen) {
        // Collapse
        card.classList.remove('is-open');
        panel.classList.remove('is-open');
        if (e2026_openStarChart) { e2026_openStarChart.destroy(); e2026_openStarChart = null; }
        e2026_openStarIdx   = null;
        e2026_openStarCard  = null;
        e2026_openStarPanel = null;
    } else {
        // Expand
        card.classList.add('is-open');
        panel.classList.add('is-open');
        e2026_openStarIdx   = idx;
        e2026_openStarCard  = card;
        e2026_openStarPanel = panel;

        const canvas = panel.querySelector('.epg-star-canvas');
        if (canvas) {
            const star = STAR_CANDIDATES_2026[idx];
            e2026_openStarChart = e2026_renderStarChart(canvas, star);
        }
    }
}

function e2026_renderStarChart(canvas, star) {
    const style = getComputedStyle(document.documentElement);
    const mutedColor  = style.getPropertyValue('--color-text-muted').trim()  || '#9ca3af';
    const borderColor = style.getPropertyValue('--color-border').trim()       || 'rgba(255,255,255,0.1)';

    const YEARS  = [2021, 2016, 2011, 2006, 2001];
    const labels = YEARS.map(String);

    const yearMap = {};
    star.history.forEach(h => { yearMap[h.year] = h; });
    const dataPoints = YEARS.map(y => (yearMap[y] ? yearMap[y].margin : null));

    return new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data: dataPoints,
                borderColor: star.partyColor,
                backgroundColor: star.partyColor + '22',
                pointBackgroundColor: star.partyColor,
                pointBorderColor: star.partyColor,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                spanGaps: false,
                tension: 0.3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => {
                            if (item.raw === null) return 'Did not contest';
                            const entry = yearMap[parseInt(item.label, 10)];
                            const sign  = item.raw >= 0 ? '+' : '';
                            const lines = [`Margin: ${sign}${item.raw}%`];
                            if (entry && entry.note) lines.push(entry.note);
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: mutedColor, font: { size: 10 } },
                    grid:  { color: borderColor },
                    border: { color: borderColor }
                },
                y: {
                    ticks: {
                        color: mutedColor,
                        font: { size: 10 },
                        callback: (v) => (v >= 0 ? '+' : '') + v + '%'
                    },
                    grid: {
                        color: (ctx) => ctx.tick.value === 0 ? mutedColor : borderColor,
                        lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1,
                    },
                    border: { color: borderColor }
                }
            }
        }
    });
}
```

- [ ] **Step 4: Commit**

```bash
git add js/elections-2026.js
git commit -m "feat: add collapsible history charts to star candidate cards"
```

---

## Task 5: Manual verification

- [ ] **Step 1: Open the app and navigate to Stars tab**

Start a local server (`python -m http.server 8000`) and open `http://localhost:8000`. Click "Elections 2026" button, then click the "Stars" tab.

Expected:
- M.K. Stalin's card is open by default with a red line chart visible
- Chart x-axis reads `2021 2016 2011 2006 2001`
- The line goes through all 5 points (no nulls for Stalin)
- Chevron on Stalin's card points down (`▾` direction via rotation)
- All other cards are collapsed

- [ ] **Step 2: Test click toggle**

Click M.K. Stalin's card.
Expected: chart collapses, chevron rotates back.

Click it again.
Expected: chart re-appears (fresh Chart.js instance).

- [ ] **Step 3: Test one-at-a-time**

Click M.K. Stalin's card to open it, then click Udhayanidhi Stalin's card.
Expected: Stalin's card closes, Udhayanidhi's opens with a chart showing only 2021 data (4 nulls = 4 broken line segments).

- [ ] **Step 4: Test a no-history candidate**

Click C. Joseph Vijay's card.
Expected: panel opens showing the text "Did not contest in the past 5 Tamil Nadu assembly elections". No canvas rendered.

- [ ] **Step 5: Test dark/light theme**

Toggle dark/light theme using the header button.
Expected: chart axis labels and grid lines update to match the new theme colors. (Chart.js reads CSS variables at render time — switching theme then re-opening a card will show correct colors. A chart already open will retain its render-time colors until closed and reopened — this is acceptable.)

- [ ] **Step 6: Test on mobile viewport**

Open DevTools → device emulation → iPhone 14 (390px wide).
Expected: charts remain readable at 120px height, cards are full-width, no horizontal overflow.

- [ ] **Step 7: Verify no console errors**

Open DevTools Console. Interact with several cards.
Expected: zero errors or warnings.

- [ ] **Step 8: Final commit if any fixes were made during verification**

```bash
git add -p
git commit -m "fix: address issues found during manual verification"
```
