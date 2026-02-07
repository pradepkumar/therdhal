/**
 * Formatting Utilities
 */

const Formatters = {
    /**
     * Format number with Indian number system (lakhs, crores)
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (!num) return '0';
        return num.toLocaleString('en-IN');
    },

    /**
     * Format vote margin
     * @param {number} margin - Vote margin
     * @returns {string} Formatted margin text
     */
    formatMargin(margin) {
        if (!margin) return 'N/A';
        return `Margin: ${this.formatNumber(margin)} votes`;
    },

    /**
     * Format turnout percentage
     * @param {number} turnout - Turnout percentage
     * @returns {string} Formatted turnout text
     */
    formatTurnout(turnout) {
        if (!turnout) return 'N/A';
        return `Turnout: ${turnout.toFixed(2)}%`;
    },

    /**
     * Format vote share percentage
     * @param {number} voteShare - Vote share percentage
     * @returns {string} Formatted vote share
     */
    formatVoteShare(voteShare) {
        if (!voteShare) return '0%';
        return `${voteShare.toFixed(2)}%`;
    },

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Capitalize first letter of each word
     * @param {string} text - Text to capitalize
     * @returns {string} Capitalized text
     */
    capitalizeWords(text) {
        if (!text) return '';
        return text.replace(/\b\w/g, char => char.toUpperCase());
    }
};
