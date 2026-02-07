/**
 * Application Constants
 */

const Constants = {
    // Zoom levels
    DISTRICT_MAX_ZOOM: 9,
    CONSTITUENCY_MIN_ZOOM: 9,
    LABEL_MIN_ZOOM: 9,

    // Available election years
    AVAILABLE_YEARS: [2021, 2016],

    // Map configuration
    MAP_CENTER: [11.1271, 78.6569], // Tamil Nadu center
    MAP_INITIAL_ZOOM: 7,
    MAP_MIN_ZOOM: 7,
    MAP_MAX_ZOOM: 12,

    // Data paths
    DATA_PATHS: {
        DISTRICTS: 'data/districts.geojson',
        CONSTITUENCIES: 'data/constituencies.geojson',
        CONSTITUENCY_META: 'data/constituencies.json',
        ELECTION_2021: 'data/election-2021.json',
        ELECTION_2016: 'data/election-2016.json'
    },

    // Alliance configurations
    ALLIANCES: {
        2021: {
            'DMK+': ['DMK', 'INC', 'VCK', 'CPI', 'CPM', 'IUML', 'MMK'],
            'AIADMK+': ['AIADMK', 'BJP', 'PMK', 'TMC'],
            'Others': ['NTK', 'MNM', 'DMDK', 'AMMK', 'IJK', 'KMDK', 'IND', 'OTHERS']
        },
        2016: {
            'AIADMK+': ['AIADMK'],
            'DMK+': ['DMK', 'INC'],
            'Others': ['PMK', 'BJP', 'DMDK', 'VCK', 'MDMK', 'CPI', 'CPM', 'IUML', 'MMK', 'NTK', 'MNM', 'AMMK', 'IJK', 'KMDK', 'IND', 'OTHERS']
        }
    }
};
