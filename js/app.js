/**
 * App Module - Main application initialization and coordination
 */

const App = (function () {
    // Global election data cache
    window.electionData = {};

    /**
     * Initialize the application
     */
    async function init() {
        console.log('Initializing TN Election Map...');

        try {
            // Initialize UI first
            UIModule.init();
            UIModule.showLoading();

            // Initialize map
            MapModule.init();

            // Load initial data
            const { districts, constituencies } = await DataModule.loadInitialData();

            // Add layers to map
            MapModule.addDistrictLayer(districts);
            MapModule.addConstituencyLayer(constituencies);

            // Populate dropdowns
            await UIModule.populateDistrictDropdown();
            await UIModule.populateConstituencyDropdown();

            // Hide loading
            UIModule.hideLoading();

            console.log('TN Election Map initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            UIModule.hideLoading();
            alert('Failed to load map data. Please refresh the page. Error: ' + error.message);
        }
    }

    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init };
})();
