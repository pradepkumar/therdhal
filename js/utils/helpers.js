/**
 * General Helper Utilities
 */

const Helpers = {
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Create a gradient string from array of colors
     * @param {Array<string>} colors - Array of color hex codes
     * @returns {string} CSS gradient string
     */
    createGradient(colors) {
        if (!colors || colors.length === 0) return '';
        if (colors.length === 1) return colors[0];

        const step = 100 / (colors.length - 1);
        const gradientStops = colors.map((color, index) =>
            `${color} ${index * step}%`
        ).join(', ');

        return `linear-gradient(to right, ${gradientStops})`;
    },

    /**
     * Safely get nested object property
     * @param {Object} obj - Object to query
     * @param {string} path - Dot-notation path
     * @param {*} defaultValue - Default value if path not found
     * @returns {*} Value at path or default
     */
    getNestedProperty(obj, path, defaultValue = null) {
        const keys = path.split('.');
        let result = obj;

        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return defaultValue;
            }
        }

        return result;
    },

    /**
     * Sort array of objects by property
     * @param {Array} array - Array to sort
     * @param {string} property - Property to sort by
     * @param {boolean} ascending - Sort order
     * @returns {Array} Sorted array
     */
    sortByProperty(array, property, ascending = true) {
        return [...array].sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];

            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }
};
