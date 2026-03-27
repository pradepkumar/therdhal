# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Running the Project

This is a vanilla HTML/CSS/JavaScript application with no build step. Start a local web server to run it:

```bash
# Python 3
python -m http.server 8000

# Node.js http-server
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Testing After Changes

1. **Module Test**: Open `http://localhost:8000/test-refactoring.html` to verify all modules load correctly
2. **Main App**: Open `http://localhost:8000/` and test specific features using the checklist in `TESTING_GUIDE.md`

## Architecture Overview

This is a **modular vanilla JavaScript** application for exploring Tamil Nadu's 234 assembly constituencies with election data visualization.

### Core Tech Stack
- **Mapping**: Leaflet.js with GeoJSON boundaries (districts + constituencies)
- **Styling**: Vanilla CSS organized into component-based files with CSS custom properties
- **JavaScript**: ES6+ module pattern (IIFE) with no build tool
- **Data**: Static JSON/GeoJSON files (no database)
- **Fonts**: Inter (English), Noto Sans Tamil (Tamil script)

### Module Organization

After Feb 2026 refactoring, the JavaScript is organized as follows:

```
js/
├── app.js                  # Application initialization (entry point)
├── map.js                  # Leaflet map logic (well-structured, not split further)
├── ui.js                   # UI components & interactions (well-structured, not split further)
├── compat.js               # Compatibility layer exposing DataModule via new modules
├── elections-2026.js       # Standalone 2026 elections page: schedule, countdown, modal logic
├── elections-2026-data.js  # Evolving 2026 data: alliances, candidates, news (update this file for content changes)
├── data/
│   ├── partyConfig.js      # Party colors, flags, logos
│   ├── dataLoader.js       # Data loading and caching
│   └── dataQueries.js      # Query functions for districts, constituencies
├── map/
│   └── mapCore.js          # Leaflet map init, state, zoom/bounds configuration
└── utils/
    ├── constants.js        # Application constants (zoom levels, paths, colors)
    ├── formatters.js       # Number/text formatting utilities
    ├── helpers.js          # General helper functions
    └── theme.js            # ThemeManager — dark/light mode; MUST load before all other scripts
```

**Important**: The refactoring preserved full backward compatibility. `map.js` and `ui.js` were left as-is (already well-structured), and the original monolithic `data.js` was split into smaller modules with a compatibility layer (`compat.js`) exposing the original `DataModule` interface.

### CSS Organization

Modular structure for easier component maintenance:

```
css/
├── base/
│   ├── variables.css       # CSS custom properties (colors, spacing, typography)
│   ├── reset.css           # CSS reset and base HTML styles
│   └── typography.css      # Font and text styling
├── components/
│   ├── header.css          # Header, branding, filter toggle
│   ├── filters.css         # Filter controls and candidate search
│   ├── map.css             # Map container, Leaflet overrides
│   ├── legend.css          # Party/alliance legend
│   ├── overlay.css         # Constituency overlay (600+ lines, largest component)
│   ├── buttons.css         # Button styles
│   └── loading.css         # Loading spinner animations
├── utilities/
│   └── helpers.css         # Utility classes (.hidden, etc.)
└── styles.css              # Main entry point (imports all above in order)
```

## Key Implementation Details

### Data Flow

1. **Initial Load** (`app.js`): Initializes DataModule, MapModule, UIModule in sequence
2. **Data Loading** (`dataLoader.js`): Loads GeoJSON (districts, constituencies) and metadata, caches election data on-demand
3. **Map Rendering** (`map.js`): Renders districts at zoom < 9, constituencies at zoom >= 9
4. **Styling** (`mapStyles.js` logic in `map.js`): Colors constituencies by winning party when election year selected
5. **UI Interaction** (`ui.js`): Filter changes trigger map updates, overlay displays constituency details

### Important Patterns

#### Module Pattern (IIFE)
All JavaScript modules use the Immediately Invoked Function Expression pattern for encapsulation:

```javascript
const ModuleName = (function() {
    // Private variables and functions
    const privateVar = ...;
    const privateFunc = () => { ... };

    // Public API
    return {
        init() { ... },
        publicFunc() { ... }
    };
})();
```

This applies to `map.js`, `ui.js`, and the data modules. Always maintain this pattern for consistency.

#### Party Color Mapping
Party colors are centralized in `js/data/partyConfig.js`:
- DMK: `#e53935` (red)
- AIADMK: `#4caf50` (green)
- BJP: `#ff9800` (orange)
- INC: `#2196f3` (blue)
- Others: `#78909c` (gray)

Use `DataModule.getPartyColor(party)` to retrieve colors programmatically.

#### ID Mismatch Awareness
**Critical**: GeoJSON features have numeric `id` properties, but election data JSON uses string keys. When matching these, always convert or coerce types appropriately:
- GeoJSON: `feature.properties.id` (number, e.g., `1`)
- Election data: `electionData[year].constituencies["1"]` (string key)

### Key Files to Understand Before Changes

1. **`index.html`**: Script loading order is critical. `theme.js` must be first; new utilities must load before data modules, which must load before compatibility layer.
2. **`js/compat.js`**: Exposes `DataModule` global (required by `map.js` and `ui.js`). Changes here affect backward compatibility.
3. **`css/styles.css`**: Main CSS entry point—all modular CSS must be imported in correct order here.
4. **`js/elections-2026-data.js`**: All content for the 2026 elections page (alliances, candidates, news). Edit this for data updates without touching layout logic in `elections-2026.js`.
5. **`REFACTOR_SUMMARY.md`**: Documents the Feb 2026 refactoring in detail; reference when making structural changes.

### Common Tasks

#### Adding a New Data Query Function
1. Add function to `js/data/dataQueries.js` following existing patterns
2. Expose via DataModule in `js/compat.js` if needed by external modules
3. Document in the module's JSDoc

#### Adding a New Utility
1. Create file in `js/utils/` following naming convention
2. Add to `index.html` script loading (must load before data modules)
3. Update this CLAUDE.md if it's a significant new utility

#### Styling a New Component
1. Create file in `css/components/` with semantic filename
2. Add `@import` statement to `css/styles.css` in appropriate order
3. Follow CSS variable conventions from `css/base/variables.css`

#### Adding Election Data for a New Year
1. Place JSON file in `data/` following format of existing election files (see `docs/PROJECT_CONTEXT.md` for data structure)
2. Update `js/utils/constants.js` if adding new year constants
3. Update `index.html` year filter options
4. Test color-coding and overlay data display

## Dark/Light Theme Support

Managed by `ThemeManager` in `js/utils/theme.js` (must be the **first** script loaded — prevents tile/color flash on page load):
- Default theme determined by `prefers-color-scheme`; saved to `localStorage` under key `tn-map-theme`
- CSS variables adapt to `data-theme` attribute on `<html>` element
- On theme toggle, also swaps the Leaflet base tile URL (dark/light CartoDB tiles) and calls `MapModule._redrawStyles()` to update GeoJSON border colors

The `elections-2026.html` page uses an inline `<script>` in `<head>` to apply the saved theme before first paint (bypassing the module since it's a standalone page).

When modifying colors or the design system, ensure both light and dark theme variants work.

## Performance Considerations

1. **Data Caching**: Election data is loaded on-demand and cached in memory to avoid re-fetching
2. **GeoJSON Efficiency**: Files are optimized (not minified, but simplified where possible)
3. **Layer Management**: Districts and constituencies are mutually exclusive layers based on zoom level to reduce rendering
4. **Responsive Images**: Party logos use reasonable dimensions; add new assets with performance in mind

## Known Limitations & Technical Debt

1. **No TypeScript**: Vanilla JavaScript; rely on JSDoc comments for type hints
2. **No Build Tool**: All assets must be hand-optimized; consider build tooling if adding complex dependencies
3. **map.js and ui.js Not Refactored**: These remain monolithic but well-structured; further split would require careful testing
4. **Candidate Search**: Type-ahead filtering happens on-demand; may be slow with very large datasets

## File Structure Reference

For navigating files:
- **Interactive Features**: See `js/ui.js` (filters, overlay, legend logic)
- **Map Behavior**: See `js/map.js` (zoom, styling, interactions)
- **Data Access**: See `js/data/` modules or use `DataModule` exposed in `js/compat.js`
- **Styling Components**: Find in `css/components/` by component name
- **Responsive Design**: Mobile-first approach; breakpoints at 768px (tablet), 1024px (desktop) in `css/base/variables.css`

## Testing & Validation

- Use `test-refactoring.html` to verify module loading after major changes
- Check `TESTING_GUIDE.md` for comprehensive manual test checklist
- Browser DevTools Console: Ensure no errors or warnings
- Browser DevTools Network: Verify all files load (check for 404s)
- Responsive testing: Use Chrome DevTools device emulation to test mobile, tablet, desktop

## Future Enhancement Readiness

The current refactored structure prepares for:
- **Charts in Overlay**: Can add Chart.js or D3 in new `overlay-charts.js`
- **Advanced Filters**: New filter types can extend existing filter UI module
- **Theming**: All colors in `css/base/variables.css`; easy to implement switcher
- **Internationalization**: Formatters module ready for language variants
- **Additional Elections**: New data files follow established JSON format

## Related Documentation

- `README.md`: User-facing project overview
- `REFACTOR_SUMMARY.md`: Detailed Feb 2026 refactoring notes
- `TESTING_GUIDE.md`: Manual testing checklist and common issues
- `docs/PROJECT_CONTEXT.md`: Complete project state, data formats, and known issues
- `docs/OVERLAY_FEATURES.md`: Constituency overlay UI details

## Design Context

### Users
**Primary**: Casual Tamil Nadu voters — mobile-first, checking their constituency, candidates, and historical results during election season. Quick lookups dominate; not doing deep research. The product must be scannable and immediately legible to someone mildly curious, possibly on a slow mobile connection.

### Brand Personality
**Bold, Political, Energetic** — civic tool with attitude. Feels like good political journalism: authoritative but accessible, data-driven but not cold. Interface should feel *alive*, especially during election season.

### Aesthetic Direction
**Reference**: NYT / Washington Post election maps — editorial clarity, authoritative cartographic style, readable under pressure.

**Anti-references**: Generic SaaS dark mode (cyan + purple glow, glassmorphism), cluttered government portals, sterile data dashboards.

**Key constraint**: The map is the hero. UI elements should feel like editorial annotations, not software panels. Party colors (DMK red, AIADMK green, BJP orange, INC blue) ARE the palette; brand accents (indigo/purple) support chrome only.

### Design Principles
1. **Map First** — Every design decision defers to the map.
2. **Party Colors as Identity** — Political colors carry meaning; don't let UI accents compete.
3. **Mobile-First Legibility** — Primary users are on phones; 375px screen at arm's length.
4. **Bold Typography over Decoration** — Weight/size contrast creates energy; data speaks for itself.
5. **Energetic but Trustworthy** — Bold, credible, exciting — think BBC/Al Jazeera infographics, not entertainment.
