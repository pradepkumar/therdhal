# Overlay Voter Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dual-axis Chart.js combo chart (bars = registered voters, line = turnout %) to the constituency popup overlay, below the stats card, covering years 2016, 2021, and 2026.

**Architecture:** A new self-contained IIFE module `js/overlay-charts.js` owns all chart logic (create, destroy, theme-change re-render). `ui.js` calls `OverlayCharts.render()` on overlay open and `OverlayCharts.destroy()` on overlay close. The chart reads CSS variables at render time so dark/light themes are always correct.

**Tech Stack:** Chart.js 4.4.8 (already loaded), vanilla JS IIFE module pattern, CSS custom properties.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `js/overlay-charts.js` | **Create** | Chart module: render, destroy, theme observer |
| `index.html` | **Modify** | Add canvas element + script tag |
| `css/components/overlay.css` | **Modify** | Chart container sizing |
| `js/ui.js` | **Modify** | Call render/destroy at overlay open/close |

---

### Task 1: Create `js/overlay-charts.js`

**Files:**
- Create: `js/overlay-charts.js`

- [ ] **Step 1: Create the file**

```javascript
const OverlayCharts = (function () {
    let _chart = null;
    let _lastElectors = null;
    let _lastTurnout = null;
    const YEARS = ['2016', '2021', '2026'];
    const CANVAS_ID = 'overlay-voter-canvas';

    function _fmtK(v) {
        if (v == null) return '';
        return v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v);
    }

    function render(electors, turnoutByYear) {
        _lastElectors = electors;
        _lastTurnout = turnoutByYear;

        const canvas = document.getElementById(CANVAS_ID);
        if (!canvas) return;

        if (_chart) {
            _chart.destroy();
            _chart = null;
        }

        const style = getComputedStyle(document.documentElement);
        const mutedColor  = style.getPropertyValue('--color-text-muted').trim() || '#9ca3af';
        const borderColor = style.getPropertyValue('--color-border').trim()      || 'rgba(255,255,255,0.1)';

        const voterData   = YEARS.map(y => (electors?.[y] != null)     ? electors[y]     : null);
        const turnoutData = YEARS.map(y => (turnoutByYear?.[y] != null) ? turnoutByYear[y] : null);

        _chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: YEARS,
                datasets: [
                    {
                        label: 'Registered Voters',
                        data: voterData,
                        backgroundColor: 'rgba(99,102,241,0.45)',
                        borderColor: 'rgba(99,102,241,0.85)',
                        borderWidth: 1,
                        borderRadius: 3,
                        yAxisID: 'yVoters',
                        order: 2,
                    },
                    {
                        label: 'Turnout %',
                        data: turnoutData,
                        type: 'line',
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,0.12)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#f59e0b',
                        tension: 0.1,
                        fill: false,
                        yAxisID: 'yTurnout',
                        order: 1,
                        spanGaps: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: mutedColor,
                            font: { size: 10 },
                            boxWidth: 12,
                        }
                    },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        ticks: { color: mutedColor, font: { size: 11 } },
                        grid:  { color: borderColor }
                    },
                    yVoters: {
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            color: mutedColor,
                            font: { size: 10 },
                            callback: v => _fmtK(v),
                        },
                        grid: { color: borderColor }
                    },
                    yTurnout: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 100,
                        ticks: {
                            color: mutedColor,
                            font: { size: 10 },
                            callback: v => v + '%',
                        },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    function destroy() {
        if (_chart) {
            _chart.destroy();
            _chart = null;
        }
        _lastElectors = null;
        _lastTurnout  = null;
    }

    // Re-render automatically when dark/light theme changes
    new MutationObserver(() => {
        if (_chart && _lastElectors !== null) {
            render(_lastElectors, _lastTurnout);
        }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return { render, destroy };
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/overlay-charts.js
git commit -m "feat: add OverlayCharts module with dual-axis voter/turnout chart"
```

---

### Task 2: Add canvas to `index.html` and load the script

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add canvas element below the stats card**

In `index.html`, find the closing `</div>` of the `.stats-card` block (around line 232):

```html
                </div>
            </div>
```

Replace with:

```html
                </div>
                <!-- Voter History Chart -->
                <div class="overlay-voter-chart">
                    <canvas id="overlay-voter-canvas"></canvas>
                </div>
            </div>
```

The full context to locate it — it sits between `.stats-card` closing tag and the `<!-- Election History -->` comment:

```html
                </div>
                </div>  <!-- closes .stats-card -->

                <!-- Election History -->
```

- [ ] **Step 2: Add script tag before `ui.js`**

Find the line loading `ui.js` in `index.html`:

```html
    <script src="js/ui.js"></script>
```

Add the new script directly above it:

```html
    <script src="js/overlay-charts.js"></script>
    <script src="js/ui.js"></script>
```

- [ ] **Step 3: Verify in browser**

Start the server (`python -m http.server 8000`), open `http://localhost:8000`, open DevTools console. Confirm no 404 for `overlay-charts.js` and no JS errors. The canvas won't be visible yet (no data wired up).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add overlay voter chart canvas and script tag to index.html"
```

---

### Task 3: Add CSS for the chart container

**Files:**
- Modify: `css/components/overlay.css`

- [ ] **Step 1: Add styles**

At the end of `css/components/overlay.css`, add:

```css
/* Voter history chart */
.overlay-voter-chart {
    margin-top: var(--spacing-md);
    height: 160px;
    position: relative;
}
```

- [ ] **Step 2: Verify no visual breakage**

Open the overlay for any constituency. Confirm:
- The stats card (Registered Voters / Constituency ID) still looks correct above the chart area
- The empty chart canvas takes up its allocated height without layout shift

- [ ] **Step 3: Commit**

```bash
git add css/components/overlay.css
git commit -m "feat: add overlay-voter-chart container CSS"
```

---

### Task 4: Wire `ui.js` to render and destroy the chart

**Files:**
- Modify: `js/ui.js`

- [ ] **Step 1: Add render call in `showConstituencyOverlay`**

In `js/ui.js`, find the line (around line 502):

```javascript
        updateOverlayElectionResults(id, currentOverlayElectionYear);
```

Add the following block directly after it (still inside `showConstituencyOverlay`, before `overlay.classList.remove('hidden')`):

```javascript
        // Render voter/turnout chart
        (async () => {
            const turnoutByYear = {};
            await Promise.all([2016, 2021].map(async y => {
                const result = await DataModule.getElectionResults(y, id);
                if (result && result.turnout_percent != null) {
                    turnoutByYear[String(y)] = result.turnout_percent;
                }
            }));
            OverlayCharts.render(info.electors || {}, turnoutByYear);
        })();
```

Note: `info` is already resolved earlier in `showConstituencyOverlay` via `DataModule.getConstituencyInfo(id)`. The `info.electors` object looks like `{ "2016": 260912, "2021": 284412 }`.

- [ ] **Step 2: Add destroy call in `hideConstituencyOverlay`**

Find `hideConstituencyOverlay` in `js/ui.js` (around line 511):

```javascript
    function hideConstituencyOverlay() {
        overlay.classList.add('hidden');
        document.body.classList.remove('overlay-open');
        currentConstituencyId = null;
```

Add `OverlayCharts.destroy();` as the first line of the function body:

```javascript
    function hideConstituencyOverlay() {
        OverlayCharts.destroy();
        overlay.classList.add('hidden');
        document.body.classList.remove('overlay-open');
        currentConstituencyId = null;
```

- [ ] **Step 3: Test in browser**

1. Open `http://localhost:8000`
2. Click any constituency
3. Confirm the chart renders below the stats card — bars for registered voters (2016, 2021), line for turnout %, 2026 column empty
4. Toggle dark/light theme — chart should re-render with updated colors
5. Close the overlay and reopen a different constituency — chart should reflect the new constituency's data
6. Check DevTools console for errors

- [ ] **Step 4: Commit**

```bash
git add js/ui.js
git commit -m "feat: wire OverlayCharts render/destroy to constituency overlay open/close"
```
