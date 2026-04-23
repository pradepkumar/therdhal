/**
 * overlay-charts.js
 * OverlayCharts — dual-axis Chart.js combo chart (registered voters / turnout %)
 * rendered inside the constituency overlay. Reads CSS variables at render time
 * for dark/light theme support; auto-rerenders on data-theme change.
 */
const OverlayCharts = (function () {
    let _chart = null;
    let _lastElectors = null;
    let _lastTurnout = null;
    const YEARS = ['2016', '2021', '2026'];
    const CANVAS_ID = 'overlay-voter-canvas';
    const _observer = new MutationObserver(() => {
        if (_chart && _lastElectors !== null) {
            render(_lastElectors, _lastTurnout);
        }
    });

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
                        backgroundColor: 'rgba(99,102,241,0.45)', /* indigo-500 — matches --color-accent-primary */
                        borderColor: 'rgba(99,102,241,0.85)',     /* indigo-500 — matches --color-accent-primary */
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
        _observer.disconnect();
    }

    // Re-render automatically when dark/light theme changes
    _observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return { render, destroy };
})();
