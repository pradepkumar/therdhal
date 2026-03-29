/**
 * Party Configuration Module
 * Contains party colors, flag colors, and logo paths
 */

const PartyConfig = {
    // Party color mapping (primary colors for single-color display)
    colors: {
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
        'CPM': '#b71c1c',
        'DMDK': '#009688',
        'TMC': '#795548',
        'AMMK': '#8bc34a',
        'NTK': '#ffc107',
        'MNM': '#3f51b5',
        'IUML': '#006400',
        'MMK': '#00a65a',
        'IJK': '#ff6600',
        'KMDK': '#99cc33',
        'IND': '#607d8b',
        'OTHERS': '#78909c',
        'MKP': '#e91e63',
        'SDPI': '#1b5e20',
        'MJK': '#f57f17',
        'TDK': '#4a148c',
        'PBK': '#880e4f',
        'PNK': '#01579b',
        'STMK': '#bf360c',
        'TMBSP': '#33691e',
        'TMMK': '#4e342e',
        'SIFC': '#37474f'
    },

    // Party flag colors (array of colors from their official flags)
    flagColors: {
        'DMK': ['#000000', '#e53935'],  // Black and Red
        'AIADMK': ['#000000', '#FFFFFF', '#e53935'],  // Black white and Red
        'ADMK': ['#000000', '#FFFFFF', '#e53935'],
        'BJP': ['#FF9933', '#138808'],  // Saffron and Green
        'INC': ['#FF9933', '#FFFFFF', '#138808'],  // Saffron, White, Green
        'CONGRESS': ['#FF9933', '#FFFFFF', '#138808'],
        'PMK': ['#1976d2', '#ffeb3b', '#ff9800'],  // Blue, Yellow, Orange
        'MDMK': ['#e53935', '#000000', '#e53935'],  // Red-Black-Red
        'VCK': ['#00bcd4', '#e53935'],  // Sky Blue and Red
        'CPI': ['#f44336'],  // Red
        'CPI(M)': ['#b71c1c'],  // Dark Red
        'CPM': ['#b71c1c'],
        'DMDK': ['#009688'],  // Teal
        'TMC': ['#795548'],  // Brown
        'AMMK': ['#8bc34a'],  // Light Green
        'NTK': ['#E93C2D', '#FFC72C'],  // Red and Yellow
        'MNM': ['#FFFFFF', '#D60505', '#FFFFFF'],  // White, Red, White
        'IUML': ['#006400'],  // Dark Green
        'MMK': ['#00a65a'],  // Green
        'IJK': ['#ff6600', '#0000ff'],  // Orange and Blue
        'KMDK': ['#99cc33'],  // Yellow-Green
        'IND': ['#607d8b'],  // Blue Grey
        'OTHERS': ['#78909c'],  // Grey
        'MKP': ['#e91e63'],
        'SDPI': ['#1b5e20'],
        'MJK': ['#f57f17'],
        'TDK': ['#4a148c'],
        'PBK': ['#880e4f'],
        'PNK': ['#01579b'],
        'STMK': ['#bf360c'],
        'TMBSP': ['#33691e'],
        'TMMK': ['#4e342e'],
        'SIFC': ['#37474f']
    },

    // Party logos (using placeholder paths - will be updated with actual logos)
    logos: {
        'DMK': 'assets/logos/DMK.png',
        'AIADMK': 'assets/logos/AIADMK.svg',
        'ADMK': 'assets/logos/AIADMK.svg',
        'BJP': 'assets/logos/BJP.svg',
        'INC': 'assets/logos/INC.svg',
        'CONGRESS': 'assets/logos/INC.svg',
        'PMK': 'assets/logos/PMK.jpg',
        'MDMK': 'assets/logos/MDMK.png',
        'VCK': 'assets/logos/VCK.png',
        'CPI': 'assets/logos/CPI.png',
        'CPI(M)': 'assets/logos/CPIM.png',
        'CPM': 'assets/logos/CPIM.png',
        'DMDK': 'assets/logos/DMDK.png',
        'TMC': 'assets/logos/placeholder.svg',
        'AMMK': 'assets/logos/AMMK.png',
        'NTK': 'assets/logos/NTK.png',
        'MNM': 'assets/logos/MNM.png',
        'IUML': 'assets/logos/IUML.png',
        'TVK': 'assets/logos/TVK.png',
        'MMK': 'assets/logos/placeholder.svg',
        'IJK': 'assets/logos/placeholder.svg',
        'KMDK': 'assets/logos/placeholder.svg',
        'IND': 'assets/logos/placeholder.svg',
        'OTHERS': 'assets/logos/placeholder.svg',
        'MKP': 'assets/logos/placeholder.svg',
        'SDPI': 'assets/logos/placeholder.svg',
        'MJK': 'assets/logos/placeholder.svg',
        'TDK': 'assets/logos/placeholder.svg',
        'PBK': 'assets/logos/placeholder.svg',
        'PNK': 'assets/logos/placeholder.svg',
        'STMK': 'assets/logos/placeholder.svg',
        'TMBSP': 'assets/logos/placeholder.svg',
        'TMMK': 'assets/logos/placeholder.svg',
        'SIFC': 'assets/logos/placeholder.svg'
    },

    /**
     * Get party color
     * @param {string} party - Party name
     * @returns {string} Color hex code
     */
    getColor(party) {
        if (!party) return this.colors['OTHERS'];
        const normalized = party.toUpperCase().trim();
        return this.colors[normalized] || this.colors['OTHERS'];
    },

    /**
     * Get party flag colors (array of colors)
     * @param {string} party - Party name
     * @returns {Array<string>} Array of color hex codes
     */
    getFlagColors(party) {
        if (!party) return this.flagColors['OTHERS'];
        const normalized = party.toUpperCase().trim();
        return this.flagColors[normalized] || this.flagColors['OTHERS'];
    },

    /**
     * Get party logo path
     * @param {string} party - Party name
     * @returns {string} Logo file path
     */
    getLogo(party) {
        if (!party) return this.logos['OTHERS'];
        const normalized = party.toUpperCase().trim();
        return this.logos[normalized] || this.logos['OTHERS'];
    },

    /**
     * Get accessible text color (black or white) for a given party background
     * @param {string} party - Party name
     * @returns {string} '#1a1a1a' or '#ffffff'
     */
    getTextColor(party) {
        const bg = this.getColor(party);
        const r = parseInt(bg.slice(1, 3), 16);
        const g = parseInt(bg.slice(3, 5), 16);
        const b = parseInt(bg.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
    },

    /**
     * Get accessible text color for an arbitrary hex color
     * @param {string} hex - Hex color string
     * @returns {string} '#1a1a1a' or '#ffffff'
     */
    getTextColorForHex(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
    },

    /**
     * Get CSS gradient for party flag colors
     * @param {string} party - Party name
     * @returns {string} CSS gradient string or hex color
     */
    getBorderGradient(party) {
        const flagColors = this.getFlagColors(party);
        if (flagColors.length === 0) return this.getColor(party);
        if (flagColors.length === 1) return flagColors[0];

        if (flagColors.length === 2) {
            return `linear-gradient(to bottom, ${flagColors[0]} 50%, ${flagColors[1]} 50%)`;
        } else if (flagColors.length === 3) {
            return `linear-gradient(to bottom, ${flagColors[0]} 33.33%, ${flagColors[1]} 33.33%, ${flagColors[1]} 66.66%, ${flagColors[2]} 66.66%)`;
        } else {
            // For more than 3 colors, distribute evenly
            const step = 100 / flagColors.length;
            const stops = flagColors.map((color, idx) =>
                `${color} ${idx * step}%, ${color} ${(idx + 1) * step}%`
            ).join(', ');
            return `linear-gradient(to bottom, ${stops})`;
        }
    }
};
