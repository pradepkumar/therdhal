# Tamil Nadu Election Companion

An interactive web application for exploring Tamil Nadu's assembly constituencies with historical election data from 2011, 2016, and 2021.

## Features

- **Interactive Map**: Explore 234 assembly constituencies across Tamil Nadu
- **Election Data**: View detailed election results from multiple years
- **Candidate Search**: Search for candidates by name with type-ahead suggestions
- **Constituency Details**: Comprehensive overlay with election history, candidates, and statistics
- **Dynamic Legend**: Color-coded map showing winning parties and alliances
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Project Structure

```
therdhal/
├── css/
│   ├── base/                  # Base styles
│   │   ├── reset.css          # CSS reset
│   │   ├── variables.css      # CSS custom properties
│   │   └── typography.css     # Typography styles
│   ├── components/            # Component-specific styles
│   │   ├── header.css         # Header and branding
│   │   ├── filters.css        # Filter controls
│   │   ├── map.css            # Map container
│   │   ├── legend.css         # Map legend
│   │   ├── overlay.css        # Constituency overlay
│   │   ├── buttons.css        # Button styles
│   │   └── loading.css        # Loading indicators
│   ├── utilities/             # Utility classes
│   │   └── helpers.css        # Helper classes
│   └── styles.css             # Main CSS entry point
├── js/
│   ├── core/                  # Core application
│   │   └── app.js             # Main initialization
│   ├── data/                  # Data management
│   │   ├── dataLoader.js      # Data loading and caching
│   │   ├── partyConfig.js     # Party colors and logos
│   │   └── dataQueries.js     # Data query functions
│   ├── map/                   # Map functionality
│   │   ├── mapCore.js         # Map initialization
│   │   ├── mapLayers.js       # Layer management
│   │   ├── mapStyles.js       # Styling functions
│   │   └── mapInteractions.js # Event handlers
│   ├── ui/                    # UI components
│   │   ├── uiCore.js          # UI initialization
│   │   ├── filters.js         # Filter controls
│   │   ├── overlay.js         # Constituency overlay
│   │   ├── legend.js          # Legend component
│   │   └── navigation.js      # Navigation controls
│   ├── utils/                 # Utilities
│   │   ├── constants.js       # Application constants
│   │   ├── formatters.js      # Formatting utilities
│   │   └── helpers.js         # Helper functions
│   ├── data.js                # Legacy data module (for compatibility)
│   ├── map.js                 # Legacy map module (for compatibility)
│   ├── ui.js                  # Legacy UI module (for compatibility)
│   ├── app.js                 # Legacy app module (for compatibility)
│   └── main.js                # New entry point (optional)
├── data/                      # Data files
│   ├── tn-districts.geojson   # District boundaries
│   ├── tn-constituencies.geojson # Constituency boundaries
│   ├── constituencies.json    # Constituency metadata
│   ├── elections-2021.json    # 2021 election results
│   └── elections-2016.json    # 2016 election results
├── assets/                    # Static assets
│   └── logos/                 # Party logos
├── docs/                      # Documentation
└── index.html                 # Main HTML file
```

## Technology Stack

- **Mapping**: [Leaflet.js](https://leafletjs.com/) - Interactive map library
- **Styling**: Vanilla CSS with CSS Custom Properties
- **JavaScript**: ES6+ with module pattern
- **Fonts**: Inter (Latin), Noto Sans Tamil (Tamil script)
- **Tiles**: CartoDB Dark (no labels)

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for development)

### Running Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd therdhal
   ```

2. Start a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (http-server)
   npx http-server -p 8000

   # Using PHP
   php -S localhost:8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Usage

### Exploring the Map

1. **View Districts**: At lower zoom levels, see district boundaries
2. **View Constituencies**: Zoom in to see individual constituencies
3. **Select Year**: Choose an election year to color the map by winning party
4. **Click Constituencies**: Click any constituency to view detailed information

### Using Filters

- **Year**: Select an election year (2021, 2016, or All Years)
- **District**: Filter constituencies by district
- **Constituency**: Jump directly to a specific constituency
- **Candidate Search**: Search for candidates by name (appears when year is selected)

### Constituency Overlay

The overlay shows:
- Constituency name (English and Tamil)
- District and constituency type (General/SC)
- Registered voters and constituency ID
- Election history timeline
- Detailed candidate results with vote shares
- Previous winners across all years

## Data Sources

- **Boundaries**: Election Commission of India
- **Election Results**: Official EC data and news sources
- **Party Information**: Official party websites and public sources

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized GeoJSON files
- Efficient data caching
- Lazy loading of election data
- Responsive images and assets

## Future Enhancements

- [ ] Add graphs and charts to constituency overlay
- [ ] Include 2011 election data
- [ ] Add demographic information
- [ ] Export constituency reports
- [ ] Share functionality
- [ ] Multi-language support
- [ ] Accessibility improvements

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is for educational and informational purposes.

## Acknowledgments

- Election Commission of India for official data
- CartoDB for map tiles
- Leaflet.js community
- All contributors and data sources

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Note**: This is an independent project and is not affiliated with any political party or the Election Commission of India.
