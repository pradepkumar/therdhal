/**
 * Data Loader Module
 * Handles loading and caching of all map and election data
 */

const DataLoader = (function () {
    // Data cache
    const cache = {
        districts: null,
        constituencies: null,
        constituencyMeta: null,
        elections: {}
    };

    /**
     * Load GeoJSON data
     * @param {string} path - Path to GeoJSON file
     * @returns {Promise<Object>} GeoJSON data
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
     * @param {string} path - Path to JSON file
     * @returns {Promise<Object>} JSON data
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
     * @returns {Promise<Object>} District GeoJSON
     */
    async function loadDistricts() {
        if (cache.districts) return cache.districts;
        cache.districts = await loadGeoJSON('data/tn-districts.geojson');
        return cache.districts;
    }

    /**
     * Load constituency boundaries
     * @returns {Promise<Object>} Constituency GeoJSON
     */
    async function loadConstituencies() {
        if (cache.constituencies) return cache.constituencies;
        cache.constituencies = await loadGeoJSON('data/tn-constituencies.geojson');
        return cache.constituencies;
    }

    /**
     * Load constituency metadata
     * @returns {Promise<Object>} Constituency metadata
     */
    async function loadConstituencyMeta() {
        if (cache.constituencyMeta) return cache.constituencyMeta;
        cache.constituencyMeta = await loadJSON('data/constituencies.json');
        return cache.constituencyMeta;
    }

    /**
     * Load election data for a specific year
     * @param {number} year - Election year
     * @returns {Promise<Object>} Election data
     */
    async function loadElectionData(year) {
        if (cache.elections[year]) return cache.elections[year];

        const rawData = await loadJSON(`data/elections-${year}.json`);

        // Transform data to extract winner and runner_up for each constituency
        const transformedData = {
            year: rawData.year,
            alliances: rawData.alliances || {},
            constituencies: {}
        };

        for (const [id, constituency] of Object.entries(rawData.constituencies)) {
            const candidates = constituency.candidates || [];
            const winner = candidates.find(c => c.winner === true) || candidates[0];
            const runner_up = candidates[1];

            const electorsForYear = (constituency.electors && typeof constituency.electors === 'object')
                ? constituency.electors[year]
                : constituency.electors;

            transformedData.constituencies[id] = {
                ...constituency,
                electors: electorsForYear,
                winner: winner,
                runner_up: runner_up
            };
        }

        cache.elections[year] = transformedData;
        return transformedData;
    }

    /**
     * Load all initial data
     * @returns {Promise<Object>} All initial data
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
        loadElectionData
    };
})();
