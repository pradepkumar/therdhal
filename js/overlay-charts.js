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

    // Fixed axis bounds derived from global min/max across all TN constituencies (2016+2021)
    // Voters: 1.63L–7.0L → padded to 1.5L–7.5L; Turnout: 55.4–88.6% → padded to 50–95
    const VOTER_AXIS   = { min: 150000, max: 750000 };
    const TURNOUT_AXIS = { min: 50,     max: 95     };

    function _fmtL(v) {
        if (v == null) return '';
        const l = v / 100000;
        return (l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)) + 'L';
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

        const dataLabelsPlugin = {
            id: 'overlayDataLabels',
            afterDatasetsDraw(chart) {
                const { ctx, chartArea } = chart;
                ctx.save();
                ctx.font = 'bold 9px system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                const PAD = 4;
                const LINE_H = 12; // minimum gap between two labels

                // Collect labels per x-index so we can detect collisions column by column
                const byIndex = {};
                chart.data.datasets.forEach((dataset, di) => {
                    chart.getDatasetMeta(di).data.forEach((el, i) => {
                        const val = dataset.data[i];
                        if (val == null) return;
                        const label = dataset.yAxisID === 'yVoters' ? _fmtL(val) : val.toFixed(1) + '%';
                        const color = dataset.yAxisID === 'yVoters' ? 'rgba(99,102,241,0.9)' : '#f59e0b';
                        (byIndex[i] = byIndex[i] || []).push({ x: el.x, y: el.y, label, color });
                    });
                });

                Object.values(byIndex).forEach(items => {
                    const x = items[0].x;
                    if (items.length === 1) {
                        const { y, label, color } = items[0];
                        ctx.fillStyle = color;
                        ctx.fillText(label, x, Math.max(chartArea.top + LINE_H, y - PAD));
                        return;
                    }
                    // Two labels: sort so the one higher on screen (smaller y) comes first
                    items.sort((a, b) => a.y - b.y);
                    let y0 = Math.max(chartArea.top + LINE_H, items[0].y - PAD);
                    let y1 = Math.max(chartArea.top + LINE_H, items[1].y - PAD);
                    // If they'd overlap, push the lower one down to maintain gap
                    if (y1 - y0 < LINE_H) y1 = y0 + LINE_H;
                    ctx.fillStyle = items[0].color;
                    ctx.fillText(items[0].label, x, y0);
                    ctx.fillStyle = items[1].color;
                    ctx.fillText(items[1].label, x, y1);
                });

                ctx.restore();
            }
        };

        _chart = new Chart(canvas, {
            type: 'bar',
            plugins: [dataLabelsPlugin],
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
                        ...VOTER_AXIS,
                        ticks: {
                            color: mutedColor,
                            font: { size: 10 },
                            callback: v => _fmtL(v),
                        },
                        grid: { color: borderColor }
                    },
                    yTurnout: {
                        type: 'linear',
                        position: 'right',
                        ...TURNOUT_AXIS,
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
    _observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return { render, destroy };
})();
