# Testing Guide for Refactored Application

## Quick Test

The Python HTTP server is already running on port 8000. Open your browser and test:

### 1. Module Test Page
**URL:** http://localhost:8000/test-refactoring.html

This page tests that all refactored modules load correctly:
- ✅ All utility modules (Constants, Formatters, Helpers)
- ✅ All data modules (PartyConfig, DataLoader, DataQueries)
- ✅ Compatibility layer (DataModule)
- ✅ Individual function tests

**Expected Result:** All tests should pass (green checkmarks)

### 2. Main Application
**URL:** http://localhost:8000/

This is the actual Tamil Nadu Election Companion application.

## Comprehensive Testing Checklist

### Initial Load
- [ ] Page loads without errors
- [ ] No console errors (press F12 to open developer tools)
- [ ] Map displays correctly
- [ ] Header shows "TN Election Map" and "தேர்தல் வரைபடம்"
- [ ] Filter controls are visible
- [ ] Loading spinner disappears after data loads

### CSS Verification
- [ ] Styles are applied correctly
- [ ] Dark theme is active
- [ ] Fonts load correctly (Inter for English, Noto Sans Tamil for Tamil)
- [ ] Gradients and colors display properly
- [ ] Responsive design works (try resizing browser window)

### Filter Functionality
- [ ] **Year Filter:**
  - Select "2021" - map should color by winning party
  - Legend should appear on bottom right
  - Candidate search filter should appear
  - Select "2016" - map colors should update
  - Select "All Years" - map should return to default purple
  - Legend should disappear

- [ ] **District Filter:**
  - Select a district (e.g., "Chennai")
  - Map should zoom to that district
  - Back button should appear
  - Constituency dropdown should filter to that district

- [ ] **Constituency Filter:**
  - Select a constituency
  - Map should zoom to that constituency
  - Constituency overlay should open

- [ ] **Candidate Search** (only when year is selected):
  - Type a candidate name (e.g., "Stalin")
  - Type-ahead suggestions should appear
  - Click a suggestion - should open that constituency's overlay

### Map Interactions
- [ ] **Zoom Levels:**
  - At low zoom: districts visible with labels
  - At high zoom (>= 9): constituencies visible with labels
  - Zoom controls work

- [ ] **Click Interactions:**
  - Click a district (at low zoom) - should zoom to district
  - Click a constituency (at high zoom) - should open overlay

- [ ] **Hover Effects:**
  - Hovering over districts shows highlight
  - Hovering over constituencies shows highlight
  - Tooltips appear on hover

### Legend
- [ ] Legend appears when year is selected
- [ ] Shows alliances (DMK+, AIADMK+, Others)
- [ ] Shows parties within each alliance
- [ ] Shows seat counts
- [ ] Can be collapsed/expanded with toggle button
- [ ] Colors match map colors

### Constituency Overlay
- [ ] **Opens correctly** when clicking constituency
- [ ] **Header shows:**
  - Constituency name (English and Tamil)
  - District name
  - Constituency type badge (General/SC)
  - Close button (X)
  - Navigation arrows (prev/next)

- [ ] **Stats Card shows:**
  - Registered voters count
  - Constituency ID

- [ ] **Election History:**
  - Shows timeline of past elections
  - Each card shows year, winner, party, margin, turnout
  - Party colors display correctly

- [ ] **Election Results Section:**
  - Shows "Election Results" heading
  - Year navigation controls (prev/next/dropdown)
  - Vote share bar displays correctly
  - Candidate table shows all candidates
  - Winner row is highlighted
  - Multi-colored party borders display
  - Party logos display (or placeholders)
  - Vote counts and percentages show

- [ ] **Previous Winners:**
  - Shows list of winners from all years
  - Each row shows year, name, party

- [ ] **Navigation:**
  - Previous button cycles to previous constituency
  - Next button cycles to next constituency
  - Close button closes overlay
  - Clicking outside overlay closes it (on desktop)

- [ ] **Year Controls in Overlay:**
  - Previous year button works
  - Next year button works
  - Year dropdown shows available years
  - Selecting year updates results

### Responsive Design
- [ ] **Desktop (>1024px):**
  - Overlay appears on right side
  - Filters in single row
  - All elements properly sized

- [ ] **Tablet (768-1024px):**
  - Overlay appears on right side (narrower)
  - Filters may wrap
  - Map remains functional

- [ ] **Mobile (<768px):**
  - Overlay slides up from bottom
  - Filters stack vertically
  - Filter toggle button works
  - Touch interactions work

### Browser Console
Open Developer Tools (F12) and check:
- [ ] No JavaScript errors in Console tab
- [ ] No 404 errors in Network tab
- [ ] All CSS files load successfully
- [ ] All JS files load successfully
- [ ] All data files load successfully

### Performance
- [ ] Initial page load is fast (< 3 seconds)
- [ ] Map interactions are smooth
- [ ] Filter changes are responsive
- [ ] Overlay opens/closes smoothly
- [ ] No lag when zooming/panning map

## Common Issues and Solutions

### Issue: Styles not loading
**Check:**
- Browser console for CSS load errors
- Verify `css/styles.css` exists and imports all modules
- Clear browser cache (Ctrl+Shift+R)

### Issue: JavaScript errors
**Check:**
- Browser console for specific error messages
- Verify all JS files load in correct order in `index.html`
- Check that `js/compat.js` loads before `js/map.js` and `js/ui.js`

### Issue: Map not displaying
**Check:**
- Leaflet library loaded correctly
- No console errors
- Data files (`tn-districts.geojson`, `tn-constituencies.geojson`) load successfully

### Issue: Filters not working
**Check:**
- Data files load correctly
- No JavaScript errors
- DataModule compatibility layer working

### Issue: Overlay not opening
**Check:**
- Constituency data loads correctly
- No JavaScript errors in UIModule
- Click events are firing (check console)

## Automated Testing

Run the module test page first:
```
http://localhost:8000/test-refactoring.html
```

All tests should pass. If any fail, check the specific module file.

## Manual Testing Priority

**High Priority (Must Test):**
1. Module test page - all tests pass
2. Main page loads without errors
3. Year filter works and shows legend
4. Constituency overlay opens and displays data
5. No console errors

**Medium Priority (Should Test):**
1. All filter combinations work
2. Map zoom and pan work
3. Overlay navigation works
4. Responsive design works

**Low Priority (Nice to Test):**
1. All hover effects
2. All edge cases
3. Performance on slow connections

## Reporting Issues

If you find any issues:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Note your browser and version
4. Take a screenshot if visual issue
5. Check if issue exists in original (pre-refactor) version

## Success Criteria

The refactoring is successful if:
- ✅ All module tests pass
- ✅ Main application loads without errors
- ✅ All core functionality works (filters, map, overlay)
- ✅ No regression from original version
- ✅ Code is more organized and maintainable

## Next Steps After Testing

Once testing is complete and all issues are resolved:
1. Remove `js/data.js.backup` if no longer needed
2. Update documentation if needed
3. Proceed with planned enhancements (graphs, charts, etc.)
4. Consider further refactoring of `map.js` and `ui.js` if beneficial
