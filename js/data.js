/**
 * Data Module - Handles loading and caching of all map and election data
 */

const DataModule = (function () {
    // Data cache
    const cache = {
        districts: null,
        constituencies: null,
        constituencyMeta: null,
        elections: {}
    };

    // Party color mapping
    const partyColors = {
        'DMK': '#e53935',
        'AIADMK': '#4caf50',
        'ADMK': '#4caf50',  // Alias for AIADMK
        'BJP': '#ff9800',
        'INC': '#2196f3',
        'CONGRESS': '#2196f3',
        'PMK': '#ffeb3b',
        'MDMK': '#9c27b0',
        'VCK': '#00bcd4',
        'CPI': '#f44336',
        'CPI(M)': '#b71c1c',
        'DMDK': '#009688',
        'TMC': '#795548',
        'AMMK': '#8bc34a',
        'NTK': '#ffc107',
        'MNM': '#3f51b5',
        'IND': '#607d8b',
        'OTHERS': '#78909c'
    };

    /**
     * Get party color
     */
    function getPartyColor(party) {
        if (!party) return partyColors['OTHERS'];
        const normalized = party.toUpperCase().trim();
        return partyColors[normalized] || partyColors['OTHERS'];
    }

    /**
     * Load GeoJSON data
     */
    async function loadGeoJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading GeoJSON: ${path}`, error);
            throw error;
        }
    }

    /**
     * Load JSON data
     */
    async function loadJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading JSON: ${path}`, error);
            throw error;
        }
    }

    /**
     * Load district boundaries
     */
    async function loadDistricts() {
        if (cache.districts) return cache.districts;
        cache.districts = await loadGeoJSON('data/tn-districts.geojson');
        return cache.districts;
    }

    /**
     * Load constituency boundaries
     */
    async function loadConstituencies() {
        if (cache.constituencies) return cache.constituencies;
        cache.constituencies = await loadGeoJSON('data/tn-constituencies.geojson');
        return cache.constituencies;
    }

    /**
     * Load constituency metadata
     */
    async function loadConstituencyMeta() {
        if (cache.constituencyMeta) return cache.constituencyMeta;
        cache.constituencyMeta = await loadJSON('data/constituencies.json');
        return cache.constituencyMeta;
    }

    /**
     * Load election data for a specific year
     */
    async function loadElectionData(year) {
        if (cache.elections[year]) return cache.elections[year];

        const rawData = await loadJSON(`data/elections-${year}.json`);

        // Transform data to extract winner and runner_up for each constituency
        const transformedData = {
            year: rawData.year,
            constituencies: {}
        };

        for (const [id, constituency] of Object.entries(rawData.constituencies)) {
            const candidates = constituency.candidates || [];
            const winner = candidates.find(c => c.winner === true) || candidates[0];
            const runner_up = candidates[1];

            transformedData.constituencies[id] = {
                ...constituency,
                winner: winner,
                runner_up: runner_up
            };
        }

        cache.elections[year] = transformedData;
        return transformedData;
    }

    /**
     * Get all available years
     */
    function getAvailableYears() {
        return [2021, 2016, 2011];
    }

    /**
     * Get list of all districts (from constituency meta)
     */
    async function getDistrictList() {
        const meta = await loadConstituencyMeta();
        const districts = new Set();
        Object.values(meta).forEach(c => {
            if (c.district) districts.add(c.district);
        });
        return Array.from(districts).sort();
    }

    /**
     * Get list of constituencies, optionally filtered by district
     */
    async function getConstituencyList(district = null) {
        const meta = await loadConstituencyMeta();
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

    /**
     * Get constituency info by ID
     */
    async function getConstituencyInfo(id) {
        const meta = await loadConstituencyMeta();
        return meta[id] || null;
    }

    /**
     * Get election results for a constituency
     */
    async function getElectionResults(year, constituencyId) {
        const data = await loadElectionData(year);
        return data.constituencies[constituencyId] || null;
    }

    /**
     * Get winner history for a constituency across all years
     */
    async function getWinnerHistory(constituencyId) {
        const years = getAvailableYears();
        const history = [];

        for (const year of years) {
            try {
                const data = await loadElectionData(year);
                const result = data.constituencies[constituencyId];
                if (result && result.winner) {
                    history.push({
                        year,
                        winner: result.winner,
                        margin: result.winner.votes - (result.runner_up?.votes || 0),
                        turnout: result.turnout_percent
                    });
                }
            } catch (e) {
                console.warn(`No data for ${year}`);
            }
        }

        return history;
    }

    /**
     * Load all initial data
     */
    async function loadInitialData() {
        const [districts, constituencies, meta] = await Promise.all([
            loadDistricts(),
            loadConstituencies(),
            loadConstituencyMeta()
        ]);

        return { districts, constituencies, meta };
    }

    // Public API
    return {
        loadInitialData,
        loadDistricts,
        loadConstituencies,
        loadConstituencyMeta,
        loadElectionData,
        getAvailableYears,
        getDistrictList,
        getConstituencyList,
        getConstituencyInfo,
        getElectionResults,
        getWinnerHistory,
        getPartyColor
    };
})();
