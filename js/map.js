/**
 * Map Module - Handles Leaflet map initialization and interactions
 */

const MapModule = (function () {
    let map = null;
    let districtLayer = null;
    let constituencyLayer = null;
    let districtLabels = [];
    let constituencyLabels = [];

    // Tamil Nadu bounds (tighter to only show TN)
    const TN_CENTER = [11.1271, 78.6569];
    const TN_BOUNDS = [[7.9, 76.0], [13.7, 80.5]];  // Tight bounds around TN
    const INITIAL_ZOOM = 7;

    // Zoom thresholds
    const DISTRICT_MAX_ZOOM = 9;
    const CONSTITUENCY_MIN_ZOOM = 9;   // Constituencies: zoom >= 9
    const LABEL_MIN_ZOOM = 9;

    // Current state
    let currentYear = null;
    let selectedDistrict = null;
    let selectedConstituency = null;

    /**
     * Initialize the map
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

        // Add tile layer (dark theme, NO labels)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Listen for zoom changes
        map.on('zoomend', handleZoomChange);

        return map;
    }

    /**
     * Handle zoom level changes - show/hide appropriate layers
     */
    function handleZoomChange() {
        const zoom = map.getZoom();

        // Toggle district layer visibility
        if (districtLayer) {
            if (zoom < CONSTITUENCY_MIN_ZOOM) {
                districtLayer.setStyle({ opacity: 1, fillOpacity: 0.3 });
                showDistrictLabels();
            } else {
                districtLayer.setStyle({ opacity: 0.3, fillOpacity: 0.1 });
                hideDistrictLabels();
            }
        }

        // Toggle constituency layer visibility
        if (constituencyLayer) {
            if (zoom >= CONSTITUENCY_MIN_ZOOM) {
                constituencyLayer.setStyle(feature => getConstituencyStyle(feature, true));
                if (zoom >= LABEL_MIN_ZOOM) {
                    showConstituencyLabels();
                } else {
                    hideConstituencyLabels();
                }
            } else {
                constituencyLayer.setStyle({ opacity: 0, fillOpacity: 0 });
                hideConstituencyLabels();
            }
        }
    }

    /**
     * Get style for district features
     */
    function getDistrictStyle(feature) {
        return {
            color: '#6366f1',
            weight: 2,
            opacity: 1,
            fillColor: '#6366f1',
            fillOpacity: 0.2
        };
    }

    /**
     * Get style for constituency features
     */
    function getConstituencyStyle(feature, visible = true) {
        const id = String(feature.properties.id || feature.properties.AC_NO);
        let fillColor = '#8b5cf6';
        let fillOpacity = 0.3;

        // If we have election data, color by winning party
        if (currentYear && window.electionData && window.electionData[currentYear]) {
            const result = window.electionData[currentYear].constituencies[id];
            if (result && result.winner) {
                fillColor = DataModule.getPartyColor(result.winner.party);
                fillOpacity = 0.6;
            }
        }

        return {
            color: '#ffffff',
            weight: 1,
            opacity: visible ? 0.6 : 0,
            fillColor: fillColor,
            fillOpacity: visible ? fillOpacity : 0
        };
    }

    /**
     * Highlight style for hover
     */
    function getHighlightStyle() {
        return {
            weight: 3,
            opacity: 1,
            fillOpacity: 0.7
        };
    }

    /**
     * Add district layer to map
     */
    function addDistrictLayer(geojson) {
        districtLayer = L.geoJSON(geojson, {
            style: getDistrictStyle,
            onEachFeature: (feature, layer) => {
                // Use 'district' property from GeoJSON
                const name = feature.properties.district || feature.properties.name || feature.properties.DISTRICT || 'Unknown';

                // Store district name on layer for later reference
                layer._districtName = name;

                // Create label
                const center = layer.getBounds().getCenter();
                const label = L.marker(center, {
                    icon: L.divIcon({
                        className: 'district-label',
                        html: name,
                        iconSize: [100, 20],
                        iconAnchor: [50, 10]
                    })
                });
                label._districtName = name;
                districtLabels.push(label);

                // Hover effects - only at district zoom level (zoom < 9)
                layer.on('mouseover', () => {
                    if (map.getZoom() < DISTRICT_MAX_ZOOM) {
                        layer.setStyle(getHighlightStyle());
                        layer.bringToFront();
                    }
                });

                layer.on('mouseout', () => {
                    if (map.getZoom() < DISTRICT_MAX_ZOOM) {
                        layer.setStyle(getDistrictStyle());
                    }
                });

                // Click handler - only at district zoom level (zoom < 9)
                layer.on('click', () => {
                    if (map.getZoom() < DISTRICT_MAX_ZOOM) {
                        zoomToDistrict(name, layer.getBounds());
                    }
                });

                // Tooltip - only at district zoom level
                layer.bindTooltip(name, {
                    permanent: false,
                    direction: 'center',
                    className: 'district-tooltip'
                });
            }
        }).addTo(map);

        showDistrictLabels();
    }

    /**
     * Add constituency layer to map
     */
    function addConstituencyLayer(geojson) {
        constituencyLayer = L.geoJSON(geojson, {
            style: feature => getConstituencyStyle(feature, map.getZoom() >= CONSTITUENCY_MIN_ZOOM),
            onEachFeature: (feature, layer) => {
                const id = feature.properties.id || feature.properties.AC_NO;
                const name = feature.properties.name || feature.properties.AC_NAME;

                // Store for later reference
                layer._constituencyId = id;
                layer._constituencyName = name;

                // Create label
                const center = layer.getBounds().getCenter();
                const label = L.marker(center, {
                    icon: L.divIcon({
                        className: 'constituency-label',
                        html: name,
                        iconSize: [80, 16],
                        iconAnchor: [40, 8]
                    })
                });
                label._constituencyId = id;
                constituencyLabels.push(label);

                // Hover effects - only at constituency zoom level
                layer.on('mouseover', () => {
                    if (map.getZoom() >= CONSTITUENCY_MIN_ZOOM) {
                        layer.setStyle(getHighlightStyle());
                    }
                });

                layer.on('mouseout', () => {
                    if (map.getZoom() >= CONSTITUENCY_MIN_ZOOM) {
                        // Don't reset if this is the selected constituency
                        if (layer._constituencyId != selectedConstituency) {
                            layer.setStyle(getConstituencyStyle(feature, true));
                        }
                    }
                });

                // Click handler - only at constituency zoom level
                layer.on('click', () => {
                    if (map.getZoom() >= CONSTITUENCY_MIN_ZOOM) {
                        selectConstituency(id, name);
                    }
                });

                // Tooltip - only enabled at constituency zoom level (handled via CSS/opacity)
                const tooltip = layer.bindTooltip(`${id}. ${name}`, {
                    permanent: false,
                    direction: 'center',
                    className: 'constituency-tooltip'
                });
            }
        }).addTo(map);
    }

    /**
     * Show district labels
     */
    function showDistrictLabels() {
        districtLabels.forEach(label => {
            if (!map.hasLayer(label)) {
                label.addTo(map);
            }
        });
    }

    /**
     * Hide district labels
     */
    function hideDistrictLabels() {
        districtLabels.forEach(label => {
            if (map.hasLayer(label)) {
                map.removeLayer(label);
            }
        });
    }

    /**
     * Show constituency labels
     */
    function showConstituencyLabels() {
        constituencyLabels.forEach(label => {
            if (!map.hasLayer(label)) {
                label.addTo(map);
            }
        });
    }

    /**
     * Hide constituency labels
     */
    function hideConstituencyLabels() {
        constituencyLabels.forEach(label => {
            if (map.hasLayer(label)) {
                map.removeLayer(label);
            }
        });
    }

    /**
     * Zoom to a specific district
     */
    function zoomToDistrict(name, bounds) {
        selectedDistrict = name;

        // If bounds not provided, find the district layer (case-insensitive match)
        if (!bounds && districtLayer) {
            const nameUpper = name.toUpperCase();
            districtLayer.eachLayer(layer => {
                if (layer._districtName && layer._districtName.toUpperCase() === nameUpper) {
                    bounds = layer.getBounds();
                }
            });
        }

        console.log('zoomToDistrict:', name, 'bounds:', bounds);

        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }

        // Show back button
        UIModule.showBackButton();

        // Update dropdown (but don't trigger zoom again)
        const districtFilter = document.getElementById('district-filter');
        if (districtFilter.value !== name) {
            districtFilter.value = name;
            // Only populate constituency dropdown, don't zoom again
            UIModule.populateConstituencyDropdown(name);
        }
    }

    /**
     * Zoom to a specific constituency
     */
    function zoomToConstituency(id) {
        if (!constituencyLayer) return;

        constituencyLayer.eachLayer(layer => {
            const layerId = layer._constituencyId || layer.feature.properties.id || layer.feature.properties.AC_NO;
            if (layerId == id) {
                const bounds = layer.getBounds();
                map.fitBounds(bounds, { padding: [100, 100], maxZoom: 12 });
                selectConstituency(id, layer._constituencyName || layer.feature.properties.name || layer.feature.properties.AC_NAME);
            }
        });
    }

    /**
     * Select and show details for a constituency
     */
    function selectConstituency(id, name) {
        // Clear previous selection highlight
        if (selectedConstituency && constituencyLayer) {
            constituencyLayer.eachLayer(layer => {
                if (layer._constituencyId == selectedConstituency) {
                    layer.setStyle(getConstituencyStyle(layer.feature, true));
                }
            });
        }

        selectedConstituency = id;

        // Highlight the selected constituency
        if (constituencyLayer) {
            constituencyLayer.eachLayer(layer => {
                if (layer._constituencyId == id) {
                    layer.setStyle({
                        weight: 4,
                        color: '#ffffff',
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                }
            });
        }

        UIModule.showConstituencyOverlay(id);
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
     * Set election year and update colors
     */
    function setElectionYear(year) {
        currentYear = year;
        if (constituencyLayer) {
            constituencyLayer.setStyle(feature =>
                getConstituencyStyle(feature, map.getZoom() >= CONSTITUENCY_MIN_ZOOM)
            );
        }
    }

    /**
     * Get map instance
     */
    function getMap() {
        return map;
    }

    // Public API
    return {
        init,
        addDistrictLayer,
        addConstituencyLayer,
        zoomToDistrict,
        zoomToConstituency,
        resetToOverview,
        setElectionYear,
        getMap
    };
})();
