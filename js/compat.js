/**
 * Backward Compatibility Layer
 * This file provides aliases for the refactored modules to maintain compatibility
 * with the existing codebase while allowing gradual migration to new structure.
 */

// Create DataModule alias that uses the new modular structure
const DataModule = {
    // Data loading
    loadInitialData: () => DataLoader.loadInitialData(),
    loadDistricts: () => DataLoader.loadDistricts(),
    loadConstituencies: () => DataLoader.loadConstituencies(),
    loadConstituencyMeta: () => DataLoader.loadConstituencyMeta(),
    loadElectionData: (year) => DataLoader.loadElectionData(year),

    // Data queries
    getAvailableYears: () => DataQueries.getAvailableYears(),
    getDistrictList: () => DataQueries.getDistrictList(),
    getConstituencyList: (district) => DataQueries.getConstituencyList(district),
    getConstituencyInfo: (id) => DataQueries.getConstituencyInfo(id),
    getElectionResults: (year, id) => DataQueries.getElectionResults(year, id),
    getWinnerHistory: (id) => DataQueries.getWinnerHistory(id),
    searchCandidates: (year, query) => DataQueries.searchCandidates(year, query),

    // Party configuration
    getPartyColor: (party) => PartyConfig.getColor(party),
    getPartyFlagColors: (party) => PartyConfig.getFlagColors(party),
    getPartyLogo: (party) => PartyConfig.getLogo(party)
};

// Note: MapModule and UIModule remain as-is in their original files
// They already use the module pattern and work well
