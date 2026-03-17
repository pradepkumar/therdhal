/**
 * ThemeManager — Dark / Light mode handling
 *
 * Must be loaded BEFORE other scripts so the theme is applied before
 * the map initialises (prevents flicker and ensures the right tile layer).
 */
const ThemeManager = (function () {
    const STORAGE_KEY = 'tn-map-theme';
    const DARK_TILE  = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
    const LIGHT_TILE = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

    let _baseTileLayer = null;   // set by registerTileLayer()
    let _map           = null;   // set by registerMap()
    let _currentTheme  = 'dark';

    /* ─────────────────────────────────────────────── */
    /*  Internal helpers                                */
    /* ─────────────────────────────────────────────── */

    function _resolve() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') return stored;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function _setDocAttr(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    function _updateToggleBtn(theme) {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.querySelector('.theme-sun').style.display  = theme === 'dark'  ? 'flex' : 'none';
        btn.querySelector('.theme-moon').style.display = theme === 'light' ? 'flex' : 'none';
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        btn.title = btn.getAttribute('aria-label');
    }

    function _updateTile(theme) {
        if (!_baseTileLayer) return;
        _baseTileLayer.setUrl(theme === 'dark' ? DARK_TILE : LIGHT_TILE);
    }

    function _updateMapBorders(theme) {
        // Re-render all GeoJSON layers so border colours update.
        // NOTE: `const MapModule` at script top-level is a global NAME but NOT
        // a property of `window`, so `window.MapModule` is always undefined.
        // Use `typeof` to safely check for existence.
        // eslint-disable-next-line no-undef
        if (typeof MapModule !== 'undefined' && typeof MapModule._redrawStyles === 'function') {
            MapModule._redrawStyles();
        }
    }

    function _updateLeafletUI(theme) {
        // Zoom controls background
        document.querySelectorAll('.leaflet-control-zoom a').forEach(el => {
            // CSS vars handle this automatically – just force a repaint
            el.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        });
    }

    /* ─────────────────────────────────────────────── */
    /*  Public API                                      */
    /* ─────────────────────────────────────────────── */

    /** Call once during map init to register the tile layer reference */
    function registerTileLayer(layer) {
        _baseTileLayer = layer;
        // Immediately sync to current theme (map might init after applyTheme was called)
        _updateTile(_currentTheme);
    }

    function registerMap(mapInstance) {
        _map = mapInstance;
    }

    /** Re-render margin-% colors in the currently-open overlay (if any) */
    function _updateOverlayColors() {
        // The overlay election-history section uses inline style="color: hsl(...)"
        // set by Helpers.getMarginColor(). Re-query and update all of them.
        document.querySelectorAll('.candidate-vote-share[data-margin]').forEach(el => {
            const pct = parseFloat(el.dataset.margin);
            if (!isNaN(pct) && typeof Helpers !== 'undefined') {
                el.style.color = Helpers.getMarginColor(pct);
            }
        });

        // Also re-open overlay if UIModule and currentConstituencyId are accessible
        // This is the most reliable approach: just update every .candidate-vote-share
        // in the history section that carries the data-margin attribute.
    }

    /** Apply a theme ('dark' | 'light') and persist */
    function applyTheme(theme, save = true) {
        _currentTheme = theme;
        _setDocAttr(theme);
        _updateToggleBtn(theme);
        _updateTile(theme);
        _updateMapBorders(theme);
        _updateOverlayColors();
        _updateLeafletUI(theme);
        if (save) localStorage.setItem(STORAGE_KEY, theme);
    }

    function toggle() {
        applyTheme(_currentTheme === 'dark' ? 'light' : 'dark');
    }

    function getCurrent() { return _currentTheme; }

    function getTileUrl(theme) {
        return (theme || _currentTheme) === 'dark' ? DARK_TILE : LIGHT_TILE;
    }

    /* ─────────────────────────────────────────────── */
    /*  Initialise                                      */
    /* ─────────────────────────────────────────────── */
    (function init() {
        const theme = _resolve();
        _currentTheme = theme;
        _setDocAttr(theme);    // apply immediately (no flash)

        // Wire toggle button once DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', _bindBtn);
        } else {
            _bindBtn();
        }
    })();

    function _bindBtn() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        _updateToggleBtn(_currentTheme);
        btn.addEventListener('click', toggle);
    }

    return { applyTheme, toggle, getCurrent, getTileUrl, registerTileLayer, registerMap };
})();
