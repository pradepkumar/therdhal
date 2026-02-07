/**
 * Map Core Module
 * Handles Leaflet map initialization and configuration
 */

const MapCore = (function () {
    let map = null;
    let currentYear = null;
    let selectedDistrict = null;
    let selectedConstituency = null;

    // Tamil Nadu bounds
    const TN_CENTER = [11.1271, 78.6569];
    const TN_BOUNDS = [[7.9, 76.0], [13.7, 80.5]];
    const INITIAL_ZOOM = 7;

    /**
     * Initialize the Leaflet map
     * @returns {Object} Leaflet map instance
     */
    function init() {
        map = L.map('map', {
            center: TN_CENTER,
            zoom: INITIAL_ZOOM,
            minZoom: 6,
            maxZoom: 14,
            maxBounds: TN_BOUNDS,
            maxBoundsViscosity: 1.0,
            zoomControl: true,
            attributionControl: false
        });

        // Add dark tile layer (no labels)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Listen for zoom changes
        map.on('zoomend', () => MapLayers.handleZoomChange());

        return map;
    }

    /**
     * Get map instance
     * @returns {Object} Leaflet map instance
     */
    function getMap() {
        return map;
    }

    /**
     * Invalidate map size
     */
    function invalidateSize() {
        if (map) {
            map.invalidateSize();
        }
    }

    /**
     * Reset to overview
     */
    function resetToOverview() {
        selectedDistrict = null;
        selectedConstituency = null;
        map.setView(TN_CENTER, INITIAL_ZOOM);
        UIModule.hideBackButton();
        UIModule.hideConstituencyOverlay();

        // Reset filters
        document.getElementById('district-filter').value = '';
        document.getElementById('constituency-filter').value = '';
    }

    /**
     * Set election year
     * @param {number} year - Election year
     */
    function setElectionYear(year) {
        currentYear = year;
        MapLayers.updateElectionYear(year);
    }

    /**
     * Get current state
     * @returns {Object} Current state
     */
    function getState() {
        return {
            currentYear,
            selectedDistrict,
            selectedConstituency
        };
    }

    /**
     * Set state
     * @param {Object} state - State to set
     */
    function setState(state) {
        if (state.currentYear !== undefined) currentYear = state.currentYear;
        if (state.selectedDistrict !== undefined) selectedDistrict = state.selectedDistrict;
        if (state.selectedConstituency !== undefined) selectedConstituency = state.selectedConstituency;
    }

    // Public API
    return {
        init,
        getMap,
        invalidateSize,
        resetToOverview,
        setElectionYear,
        getState,
        setState
    };
})();
