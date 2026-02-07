/**
 * Data Query Module
 * Provides query functions for districts, constituencies, and elections
 */

const DataQueries = (function () {
    /**
     * Get all available years
     * @returns {Array<number>} Array of available years
     */
    function getAvailableYears() {
        return [2021, 2016, 2011];
    }

    /**
     * Get list of all districts (from constituency meta)
     * @returns {Promise<Array<string>>} Sorted array of district names
     */
    async function getDistrictList() {
        const meta = await DataLoader.loadConstituencyMeta();
        const districts = new Set();
        Object.values(meta).forEach(c => {
            if (c.district) districts.add(c.district);
        });
        return Array.from(districts).sort();
    }

    /**
     * Get list of constituencies, optionally filtered by district
     * @param {string|null} district - District name to filter by
     * @returns {Promise<Array<Object>>} Array of constituency objects
     */
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

    /**
     * Get constituency info by ID
     * @param {string} id - Constituency ID
     * @returns {Promise<Object|null>} Constituency info or null
     */
    async function getConstituencyInfo(id) {
        const meta = await DataLoader.loadConstituencyMeta();
        return meta[id] || null;
    }

    /**
     * Get election results for a constituency
     * @param {number} year - Election year
     * @param {string} constituencyId - Constituency ID
     * @returns {Promise<Object|null>} Election results or null
     */
    async function getElectionResults(year, constituencyId) {
        const data = await DataLoader.loadElectionData(year);
        return data.constituencies[constituencyId] || null;
    }

    /**
     * Get winner history for a constituency across all years
     * @param {string} constituencyId - Constituency ID
     * @returns {Promise<Array<Object>>} Array of winner history objects
     */
    async function getWinnerHistory(constituencyId) {
        const years = getAvailableYears();
        const history = [];

        for (const year of years) {
            try {
                const data = await DataLoader.loadElectionData(year);
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
     * Search for candidates in a specific year
     * @param {number} year - Election year
     * @param {string} query - Search query
     * @returns {Promise<Array<Object>>} Array of matching candidates
     */
    async function searchCandidates(year, query) {
        if (!year || !query || query.length < 2) return [];

        const data = await DataLoader.loadElectionData(year);
        const results = [];
        const normalizedQuery = query.toLowerCase();

        for (const [constituencyId, constituency] of Object.entries(data.constituencies)) {
            const candidates = constituency.candidates || [];

            for (const candidate of candidates) {
                if (candidate.name && candidate.name.toLowerCase().includes(normalizedQuery)) {
                    results.push({
                        ...candidate,
                        constituencyName: constituency.name,
                        constituencyId: constituencyId,
                        district: constituency.district
                    });
                }
            }
        }

        return results.sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 50);
    }

    // Public API
    return {
        getAvailableYears,
        getDistrictList,
        getConstituencyList,
        getConstituencyInfo,
        getElectionResults,
        getWinnerHistory,
        searchCandidates
    };
})();
