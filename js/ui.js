/**
 * UI Module - Handles UI components, filters, and overlays
 */

const UIModule = (function () {
    let yearFilter;
    let constituencyTrigger, constituencyTriggerLabel, constituencyDropdown;
    let constituencySearchInput, constituencyResults;
    let allConstituenciesForSearch = []; // full list for client-side filtering
    let constituencySearchTimeout;
    let constituencyIsOpen = false;
    let candidateFilterGroup, candidateSearchInput, candidateResults;
    let searchTimeout;
    let backButton, legend, loadingOverlay;
    let overlay, overlayClose;
    let currentConstituencyId = null;
    let allConstituencies = [];
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    let currentOverlayElectionYear = 2021; // State for overlay year navigation
    let _overlayPrevFocus = null; // Element to restore focus to when overlay closes
    let selectedLegendParty = null;

    function _getFocusable(container) {
        return Array.from(container.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.closest('.hidden'));
    }

    function init() {
        yearFilter = document.getElementById('year-filter');
        backButton = document.getElementById('back-btn');
        legend = document.getElementById('legend');
        loadingOverlay = document.getElementById('loading');
        overlay = document.getElementById('constituency-overlay');
        overlayClose = document.getElementById('overlay-close');

        candidateFilterGroup = document.getElementById('candidate-filter-group');
        candidateSearchInput = document.getElementById('candidate-search');
        candidateResults = document.getElementById('candidate-results');

        constituencyTrigger = document.getElementById('constituency-trigger');
        constituencyTriggerLabel = document.getElementById('constituency-trigger-label');
        constituencyDropdown = document.getElementById('constituency-dropdown');
        constituencySearchInput = document.getElementById('constituency-search');
        constituencyResults = document.getElementById('constituency-results');

        // Load all constituencies once for navigation and for the constituency search
        DataModule.getConstituencyList().then(list => {
            allConstituencies = list;
            allConstituenciesForSearch = list; // seed the constituency search cache
        });

        setupEventListeners();
        setupConstituencySearch();
        setupCandidateSearch();
        setupOverlayYearControls();
    }

    function setupEventListeners() {
        yearFilter.addEventListener('change', async (e) => {
            await handleYearChange(e.target.value);
        });
        backButton.addEventListener('click', () => MapModule.resetToOverview());
        overlayClose.addEventListener('click', () => hideConstituencyOverlay());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hideConstituencyOverlay();
        });
        document.addEventListener('keydown', (e) => {
            if (overlay.classList.contains('hidden')) return;
            if (e.key === 'Escape') { hideConstituencyOverlay(); return; }
            if (e.key === 'ArrowRight') navigateToNext();
            if (e.key === 'ArrowLeft') navigateToPrev();
            if (e.key === 'Tab') {
                const focusable = _getFocusable(overlay);
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            }
        });

        // Navigation buttons
        const prevBtn = document.getElementById('prev-constituency');
        const nextBtn = document.getElementById('next-constituency');
        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateToPrev();
        });
        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateToNext();
        });

        // Swipe support
        overlay.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        overlay.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        // Legend toggle
        const legendToggle = document.getElementById('legend-toggle');
        if (legendToggle) {
            legendToggle.addEventListener('click', () => {
                legend.classList.toggle('collapsed');
            });
        }

        // Filter toggle
        const filterToggle = document.getElementById('filter-toggle');
        const filterContainer = document.getElementById('filter-container');
        if (filterToggle && filterContainer) {
            filterToggle.addEventListener('click', () => {
                const isCollapsed = filterContainer.classList.toggle('collapsed');
                filterToggle.classList.toggle('active', !isCollapsed);

                if (isCollapsed) {
                    filterContainer.style.overflow = 'hidden';
                } else {
                    // Wait for transition to finish before allowing overflow
                    setTimeout(() => {
                        if (!filterContainer.classList.contains('collapsed')) {
                            filterContainer.style.overflow = 'visible';
                        }
                    }, 350);
                }

                // Trigger map resize since container height changed
                setTimeout(() => {
                    MapModule.invalidateSize();
                }, 350); // Matches var(--transition-slow)
            });

            // Initial state based on screen width
            if (window.innerWidth < 768) {
                filterContainer.classList.add('collapsed');
                filterToggle.classList.remove('active');
                filterContainer.style.overflow = 'hidden';
            } else {
                filterToggle.classList.add('active');
                filterContainer.style.overflow = 'visible';
            }
        }
    }

    async function populateConstituencyDropdown(district = null) {
        // Refresh the cached list used by the constituency search
        allConstituenciesForSearch = await DataModule.getConstituencyList(district);
    }

    async function handleYearChange(year) {
        selectedLegendParty = null;
        if (year) {
            const data = await DataModule.loadElectionData(year);
            window.electionData = window.electionData || {};
            window.electionData[year] = data;
            MapModule.setElectionYear(year);
            showLegend();
            if (candidateFilterGroup) candidateFilterGroup.classList.remove('hidden');
        } else {
            MapModule.setElectionYear(null);
            hideLegend();
            if (candidateFilterGroup) candidateFilterGroup.classList.add('hidden');
        }
    }

    function setConstituencyDropdowns(constituencyId) {
        const found = allConstituenciesForSearch.find(c => String(c.id) === String(constituencyId));
        if (found && constituencyTriggerLabel) {
            constituencyTriggerLabel.textContent = found.name;
        }
    }

    function showLoading() { loadingOverlay.classList.remove('hidden'); }
    function hideLoading() { loadingOverlay.classList.add('hidden'); }
    function showBackButton() { backButton.classList.remove('hidden'); }
    function hideBackButton() { backButton.classList.add('hidden'); }

    function _renderLegendItem(p) {
        return `
            <div class="legend-item" data-party="${p.name}" role="button" tabindex="0">
                <div class="legend-color" style="background:${p.color}"></div>
                <span class="party-name">${p.name}</span>
                <span class="party-seats">${p.seats}</span>
            </div>
        `;
    }

    function _applyLegendSelection() {
        const itemsEl = document.querySelector('.legend-items');
        if (!itemsEl) return;
        itemsEl.querySelectorAll('.legend-item[data-party]').forEach(el => {
            const party = el.dataset.party;
            el.classList.toggle('legend-item--active', party === selectedLegendParty);
            el.classList.toggle('legend-item--dimmed', selectedLegendParty !== null && party !== selectedLegendParty);
        });
    }

    function selectLegendParty(partyName) {
        selectedLegendParty = selectedLegendParty === partyName ? null : partyName;
        _applyLegendSelection();
        MapModule.setSelectedParty(selectedLegendParty);
    }

    function showLegend() {
        if (!legend) {
            console.warn('Legend element not found');
            return;
        }

        const year = yearFilter.value;
        if (!year) {
            hideLegend();
            return;
        }

        // Update legend title
        const titleEl = legend.querySelector('.legend-title');
        if (titleEl) titleEl.textContent = year;

        const itemsEl = document.querySelector('.legend-items');

        // 2026: show contesting seats from ALLIANCES_2026 (election hasn't happened yet)
        if (String(year) === '2026' && typeof ALLIANCES_2026 !== 'undefined') {
            if (itemsEl) {
                itemsEl.innerHTML = ALLIANCES_2026.map(alliance => {
                    const allianceTotal = alliance.parties.reduce((sum, p) => sum + (p.seats || 0), 0);
                    return `
                        <div class="legend-alliance">
                            <div class="alliance-header">
                                <span class="alliance-name">${alliance.shortName}</span>
                                <span class="alliance-seats">${allianceTotal} seats</span>
                            </div>
                            <div class="alliance-parties">
                                ${alliance.parties.map(p => _renderLegendItem({
                        name: p.name,
                        seats: p.seats,
                        color: DataModule.getPartyColor(p.name)
                    })).join('')}
                            </div>
                        </div>
                    `;
                }).join('');
            }
            _bindLegendClicks(itemsEl);
            _applyLegendSelection();
            legend.classList.remove('hidden');
            return;
        }

        const data = window.electionData && window.electionData[year];
        if (!data) return;

        // Calculate seat counts
        const partySeats = {};
        Object.values(data.constituencies).forEach(c => {
            if (c.winner && c.winner.party) {
                const party = c.winner.party;
                partySeats[party] = (partySeats[party] || 0) + 1;
            }
        });

        // Group by alliance
        const alliances = data.alliances || {};
        const allianceSummary = [];
        const assignedParties = new Set();

        for (const [key, alliance] of Object.entries(alliances)) {
            const partiesInAlliance = [];
            let allianceTotalSeats = 0;

            if (alliance.parties) {
                alliance.parties.forEach(p => {
                    const normalizedParty = p.trim();
                    const seats = partySeats[normalizedParty] || 0;
                    if (seats > 0) {
                        partiesInAlliance.push({
                            name: normalizedParty,
                            seats: seats,
                            color: DataModule.getPartyColor(normalizedParty)
                        });
                        allianceTotalSeats += seats;
                        assignedParties.add(normalizedParty);
                    }
                });
            }

            if (allianceTotalSeats > 0) {
                allianceSummary.push({
                    name: alliance.name,
                    totalSeats: allianceTotalSeats,
                    parties: partiesInAlliance.sort((a, b) => b.seats - a.seats)
                });
            }
        }

        // Catch remaining parties in "Others"
        const othersParties = [];
        let othersTotalSeats = 0;

        for (const [party, seats] of Object.entries(partySeats)) {
            if (!assignedParties.has(party)) {
                othersParties.push({
                    name: party,
                    seats: seats,
                    color: DataModule.getPartyColor(party)
                });
                othersTotalSeats += seats;
            }
        }

        if (othersTotalSeats > 0) {
            allianceSummary.push({
                name: 'Others',
                totalSeats: othersTotalSeats,
                parties: othersParties.sort((a, b) => b.seats - a.seats)
            });
        }

        if (itemsEl) {
            itemsEl.innerHTML = allianceSummary.map(alliance => `
                <div class="legend-alliance">
                    <div class="alliance-header">
                        <span class="alliance-name">${alliance.name}</span>
                        <span class="alliance-seats">${alliance.totalSeats}</span>
                    </div>
                    <div class="alliance-parties">
                        ${alliance.parties.map(p => _renderLegendItem(p)).join('')}
                    </div>
                </div>
            `).join('');
        }

        _bindLegendClicks(itemsEl);
        _applyLegendSelection();
        legend.classList.remove('hidden');
    }

    function _bindLegendClicks(itemsEl) {
        if (!itemsEl) return;
        // Use event delegation — one listener on the container
        itemsEl.onclick = (e) => {
            const item = e.target.closest('.legend-item[data-party]');
            if (item) selectLegendParty(item.dataset.party);
        };
        itemsEl.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const item = e.target.closest('.legend-item[data-party]');
                if (item) { e.preventDefault(); selectLegendParty(item.dataset.party); }
            }
        };
    }

    function hideLegend() {
        if (legend) {
            legend.classList.add('hidden');
        }
    }

    async function showConstituencyOverlay(id) {
        currentConstituencyId = id;

        // Initialize overlay year from filter or default to 2026
        currentOverlayElectionYear = parseInt(yearFilter.value) || 2026;

        const info = await DataModule.getConstituencyInfo(id);
        const history = await DataModule.getWinnerHistory(id);
        // Election results will be loaded via updateOverlayElectionResults

        if (!info) return;

        // Update dropdowns to reflect the selected constituency
        setConstituencyDropdowns(id);

        document.getElementById('constituency-type').textContent = info.type || 'General';
        document.getElementById('constituency-type').className = `constituency-badge ${info.type === 'SC' ? 'sc' : ''}`;
        document.querySelector('#constituency-name .name-en').textContent = info.name;
        document.querySelector('#constituency-name .name-ta').textContent = info.name_ta || '';
        document.getElementById('constituency-district').textContent = info.district;
        document.getElementById('constituency-description').textContent = info.description || '';

        // Render Election History (All Years)
        const histEl = document.getElementById('election-history');
        if (histEl) {
            const historyTitle = document.querySelector('.history-section .section-title');
            if (historyTitle) {
                historyTitle.innerHTML = `Election History <span class="section-subtitle">Winner's Margin / %</span>`;
            }
            histEl.innerHTML = history.length ? history.map(h => {
                const partyColor = DataModule.getPartyColor(h.winner.party);
                const partyTextColor = DataModule.getPartyTextColor(h.winner.party);
                const borderGradient = DataModule.getPartyBorderGradient(h.winner.party);
                const partyLogo = DataModule.getPartyLogo(h.winner.party);

                return `<div class="candidate-row winner" style="--candidate-color:${partyColor};--border-gradient:${borderGradient}">
                    <span class="candidate-rank">${h.year}</span>
                    <div class="candidate-logo-box">
                        <img src="${partyLogo}" alt="${h.winner.party}" class="candidate-party-logo-large" onerror="this.style.display='none'">
                    </div>
                    <div class="candidate-info">
                        <div class="candidate-name">${h.winner.name}</div>
                        <span class="candidate-party" style="background:${partyColor};color:${partyTextColor}"${h.winner.incumbent ? ' title="Incumbent"' : ''}>
                            <span class="party-name">${h.winner.party}</span>${h.winner.incumbent ? '<span class="incumbent-star" aria-label="Incumbent">★</span>' : ''}
                        </span>
                    </div>
                    <div class="candidate-votes">
                        <div class="candidate-vote-count">${h.margin?.toLocaleString() || '0'}</div>
                        <div class="candidate-vote-share" data-margin="${h.margin_percent ?? ''}" style="color: ${Helpers.getMarginColor(h.margin_percent)}">
                            ${h.margin_percent?.toFixed(1) || '0'}%
                        </div>
                    </div>
                </div>`;
            }).join('') : '<p class="no-data">No data</p>';
        }

        // Handle electors as an object (year-specific) or a single number
        // Initial update of election results and voters for the current year
        updateOverlayElectionResults(id, currentOverlayElectionYear);

        // Render voter/turnout chart
        (async () => {
            const capturedId = id;
            const turnoutByYear = {};
            try {
                await Promise.all([2016, 2021].map(async y => {
                    const result = await DataModule.getElectionResults(y, capturedId);
                    if (result && result.turnout_percent != null) {
                        turnoutByYear[String(y)] = result.turnout_percent;
                    }
                }));
            } catch (e) {
                // Non-critical: chart will render with whatever data resolved
            }
            if (currentConstituencyId !== capturedId) return;
            OverlayCharts.render(info.electors || {}, turnoutByYear);
        })();

        overlay.classList.remove('hidden');
        _overlayPrevFocus = document.activeElement;
        // Move focus into dialog — close button is the first logical target
        const closeBtn = overlay.querySelector('#overlay-close');
        if (closeBtn) closeBtn.focus();
    }

    function hideConstituencyOverlay() {
        OverlayCharts.destroy();
        overlay.classList.add('hidden');
        document.body.classList.remove('overlay-open');
        currentConstituencyId = null;
        // Restore focus to the element that triggered the overlay
        if (_overlayPrevFocus && typeof _overlayPrevFocus.focus === 'function') {
            _overlayPrevFocus.focus();
        }
        _overlayPrevFocus = null;
    }

    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const swipeThreshold = 50;
        if (Math.abs(deltaX) < Math.abs(deltaY)) return; // vertical scroll, ignore
        if (deltaX < -swipeThreshold) {
            navigateToNext();
        } else if (deltaX > swipeThreshold) {
            navigateToPrev();
        }
    }

    function navigateToNext() {
        if (!allConstituencies.length) return;

        const currentIndex = allConstituencies.findIndex(c => c.id == currentConstituencyId);
        if (currentIndex === -1) return;

        const nextIndex = (currentIndex + 1) % allConstituencies.length;
        const nextId = allConstituencies[nextIndex].id;

        MapModule.zoomToConstituency(nextId);
    }

    function navigateToPrev() {
        if (!allConstituencies.length) return;

        const currentIndex = allConstituencies.findIndex(c => c.id == currentConstituencyId);
        if (currentIndex === -1) return;

        const prevIndex = (currentIndex - 1 + allConstituencies.length) % allConstituencies.length;
        const prevId = allConstituencies[prevIndex].id;

        MapModule.zoomToConstituency(prevId);
    }

    function _openConstituencyDropdown() {
        if (constituencyIsOpen) return;
        constituencyIsOpen = true;
        constituencyDropdown.classList.add('open');
        constituencyTrigger.setAttribute('aria-expanded', 'true');
        // Show full unfiltered list on open (no query, no split)
        _renderConstituencyList(allConstituenciesForSearch, [], '');
        // Focus the search input
        setTimeout(() => constituencySearchInput && constituencySearchInput.focus(), 50);
    }

    function _closeConstituencyDropdown() {
        if (!constituencyIsOpen) return;
        constituencyIsOpen = false;
        constituencyDropdown.classList.remove('open');
        constituencyTrigger.setAttribute('aria-expanded', 'false');
        if (constituencySearchInput) constituencySearchInput.value = '';
    }

    function setupConstituencySearch() {
        if (!constituencyTrigger) return;

        // Toggle dropdown on trigger click
        constituencyTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (constituencyIsOpen) {
                _closeConstituencyDropdown();
            } else {
                _openConstituencyDropdown();
            }
        });

        // Filter list as user types in the panel search input
        if (constituencySearchInput) {
            constituencySearchInput.addEventListener('input', (e) => {
                clearTimeout(constituencySearchTimeout);
                constituencySearchTimeout = setTimeout(() => {
                    const query = e.target.value.trim();
                    if (query.length === 0) {
                        // No query — show full list unsplit
                        _renderConstituencyList(allConstituenciesForSearch, [], '');
                        return;
                    }
                    const q = query.toLowerCase();
                    const nameMatches = [];
                    const districtMatches = [];
                    allConstituenciesForSearch.forEach(c => {
                        const nameHit = c.name.toLowerCase().includes(q);
                        const distHit = c.district && c.district.toLowerCase().includes(q);
                        if (nameHit) {
                            nameMatches.push(c);
                        } else if (distHit) {
                            // Name didn't match — show as a district-grouped result
                            districtMatches.push(c);
                        }
                    });
                    _renderConstituencyList(nameMatches, districtMatches, query);
                }, 150);
            });

            // Prevent the trigger's click-outside handler from closing while typing
            constituencySearchInput.addEventListener('click', (e) => e.stopPropagation());
        }

        // Close on click outside the whole wrapper
        document.addEventListener('click', (e) => {
            const wrapper = document.getElementById('constituency-select-wrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                _closeConstituencyDropdown();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && constituencyIsOpen) {
                _closeConstituencyDropdown();
                if (constituencyTrigger) constituencyTrigger.focus();
            }
        });
    }

    function _renderConstituencyList(nameMatches, districtMatches, query) {
        if (!constituencyResults) return;

        // Highlight matching substring in any text
        function highlight(text, q) {
            if (!q) return text;
            const idx = text.toLowerCase().indexOf(q.toLowerCase());
            if (idx === -1) return text;
            return text.slice(0, idx) +
                '<mark class="search-highlight">' + text.slice(idx, idx + q.length) + '</mark>' +
                text.slice(idx + q.length);
        }

        // Build item HTML (districtHighlight: whether to highlight the district label too)
        function itemHTML(c, highlightDistrict) {
            const distLabel = c.district
                ? `<span class="cl-district">${highlightDistrict ? highlight(c.district, query) : c.district}</span>`
                : '';
            return `<div class="constituency-list-item" data-constituency-id="${c.id}" data-constituency-name="${c.name}" role="option">
                        <span class="cl-name">${highlight(c.name, query)}</span>
                        ${distLabel}
                    </div>`;
        }

        // "All Constituencies" reset option — always first
        const resetHTML = `<div class="constituency-list-item reset-item" data-constituency-id="" data-constituency-name="All Constituencies">All Constituencies</div>`;

        const hasNameMatches = nameMatches && nameMatches.length > 0;
        const hasDistMatches = districtMatches && districtMatches.length > 0;

        if (!hasNameMatches && !hasDistMatches) {
            constituencyResults.innerHTML = resetHTML +
                '<div class="constituency-list-item no-results">No constituencies found</div>';
        } else {
            // Group the district matches by district name for a compact header
            let districtSectionHTML = '';
            if (hasDistMatches) {
                // Find unique districts among the matches
                const districtGroups = {};
                districtMatches.forEach(c => {
                    const d = c.district || 'Unknown';
                    if (!districtGroups[d]) districtGroups[d] = [];
                    districtGroups[d].push(c);
                });

                districtSectionHTML = Object.entries(districtGroups).map(([district, items]) =>
                    `<div class="constituency-group-header">
                        <span class="cg-label">in ${highlight(district, query)} district</span>
                    </div>` +
                    items.map(c => itemHTML(c, true)).join('')
                ).join('');
            }

            constituencyResults.innerHTML =
                resetHTML +
                (hasNameMatches ? nameMatches.map(c => itemHTML(c, false)).join('') : '') +
                districtSectionHTML;
        }

        // Bind click on all items
        constituencyResults.querySelectorAll('.constituency-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.dataset.constituencyId;
                const name = item.dataset.constituencyName;
                if (constituencyTriggerLabel) constituencyTriggerLabel.textContent = name;
                _closeConstituencyDropdown();
                if (id) {
                    MapModule.zoomToConstituency(id);
                } else {
                    MapModule.resetToOverview();
                }
            });
        });
    }

    function displayConstituencyResults() { /* unused — kept for compat */ }


    function setupCandidateSearch() {
        if (!candidateSearchInput) return;

        candidateSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;

            if (query.length < 2) {
                candidateResults.innerHTML = '';
                candidateResults.classList.remove('active');
                return;
            }

            searchTimeout = setTimeout(async () => {
                const year = yearFilter.value;
                if (!year) return;

                const results = await DataModule.searchCandidates(year, query);
                displayCandidateResults(results);
            }, 300);
        });

        // Hide results on click outside
        document.addEventListener('click', (e) => {
            if (!candidateSearchInput.contains(e.target) && !candidateResults.contains(e.target)) {
                candidateResults.classList.remove('active');
            }
        });

        // Show results on focus if input has value
        candidateSearchInput.addEventListener('focus', () => {
            if (candidateSearchInput.value.length >= 2 && candidateResults.children.length > 0) {
                candidateResults.classList.add('active');
            }
        });
    }

    function displayCandidateResults(results) {
        if (!results || results.length === 0) {
            candidateResults.innerHTML = '<div class="search-result-item"><span class="search-result-meta">No candidates found</span></div>';
            candidateResults.classList.add('active');
            return;
        }

        candidateResults.innerHTML = results.map(c => `
        <div class="search-result-item" data-constituency-id="${c.constituencyId}">
            <span class="search-result-name">${c.name}</span>
            <div class="search-result-meta">
                <span class="search-party-tag" style="background:${DataModule.getPartyColor(c.party)};color:${DataModule.getPartyTextColor(c.party)}">${c.party}</span>
                <span>${c.constituencyName}</span>
                <span>(${c.district})</span>
            </div>
        </div>
    `).join('');

        candidateResults.classList.add('active');

        // Add click listeners to items
        candidateResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const constituencyId = item.dataset.constituencyId;
                // Check if we clicked on a valid item (not "No candidates found")
                if (constituencyId && constituencyId !== "undefined") {
                    MapModule.zoomToConstituency(constituencyId);
                    candidateResults.classList.remove('active');
                    candidateSearchInput.value = ''; // Clear search after selection
                }
            });
        });
    }

    function setupOverlayYearControls() {
        // Prev Year Button
        document.getElementById('prev-election-year').addEventListener('click', () => {
            const years = DataModule.getAvailableYears().sort((a, b) => a - b);
            const currentIndex = years.indexOf(currentOverlayElectionYear);
            if (currentIndex > 0) {
                currentOverlayElectionYear = years[currentIndex - 1];
                if (currentConstituencyId) {
                    updateOverlayElectionResults(currentConstituencyId, currentOverlayElectionYear);
                }
            }
        });

        // Next Year Button
        document.getElementById('next-election-year').addEventListener('click', () => {
            const years = DataModule.getAvailableYears().sort((a, b) => a - b);
            const currentIndex = years.indexOf(currentOverlayElectionYear);
            if (currentIndex !== -1 && currentIndex < years.length - 1) {
                currentOverlayElectionYear = years[currentIndex + 1];
                if (currentConstituencyId) {
                    updateOverlayElectionResults(currentConstituencyId, currentOverlayElectionYear);
                }
            }
        });

        // Year Display Button (Dropdown)
        const yearBtn = document.getElementById('current-election-year-btn');
        const yearDropdown = document.getElementById('year-dropdown-menu');

        yearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Populate dropdown
            const years = DataModule.getAvailableYears().sort((a, b) => b - a);
            yearDropdown.innerHTML = years.map(y =>
                `<button class="year-option ${y === currentOverlayElectionYear ? 'selected' : ''}" data-year="${y}">${y}</button>`
            ).join('');

            yearDropdown.classList.toggle('hidden');
        });

        // Handle dropdown selection
        yearDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('year-option')) {
                const selectedYear = parseInt(e.target.dataset.year);
                if (selectedYear) {
                    currentOverlayElectionYear = selectedYear;
                    if (currentConstituencyId) {
                        updateOverlayElectionResults(currentConstituencyId, currentOverlayElectionYear);
                    }
                    yearDropdown.classList.add('hidden');
                }
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!yearBtn.contains(e.target) && !yearDropdown.contains(e.target)) {
                yearDropdown.classList.add('hidden');
            }
        });
    }

    async function updateOverlayElectionResults(id, year) {
        // Update display button
        document.getElementById('current-election-year-btn').textContent = year;

        // Update prev/next button states
        const years = DataModule.getAvailableYears().sort((a, b) => a - b);
        const currentIndex = years.indexOf(year);
        document.getElementById('prev-election-year').disabled = (currentIndex <= 0);
        document.getElementById('next-election-year').disabled = (currentIndex === -1 || currentIndex >= years.length - 1);

        // Fetch and display results
        const candidatesEl = document.getElementById('candidates-table');
        const resultsTitle = document.querySelector('.candidates-section .section-title');

        // 2026: No results yet — show declared candidates only
        if (year === 2026) {
            if (resultsTitle) {
                resultsTitle.innerHTML = `Declared Candidates <span class="section-subtitle">2026</span>`;
            }
            candidatesEl.innerHTML = '<div class="loading-spinner" style="margin:20px auto;"></div>';
            try {
                const electionResults = await DataModule.getElectionResults(year, id);
                if (electionResults && electionResults.candidates && electionResults.candidates.length > 0) {
                    candidatesEl.innerHTML = electionResults.candidates.map((c, i) => {
                        const partyColor = DataModule.getPartyColor(c.party);
                        const partyTextColor = DataModule.getPartyTextColor(c.party);
                        const borderGradient = DataModule.getPartyBorderGradient(c.party);
                        const partyLogo = DataModule.getPartyLogo(c.party);
                        const starBadge = c.star_candidate ? `<span class="star-candidate-badge" title="Star Candidate">★</span>` : '';
                        const positionEl = c.position ? `<div class="candidate-position">${c.position}</div>` : '';
                        return `<div class="candidate-row${c.star_candidate ? ' star-candidate' : ''}" style="--candidate-color:${partyColor};--border-gradient:${borderGradient}">
                            <span class="candidate-rank">${i + 1}</span>
                            <div class="candidate-logo-box">
                                <img src="${partyLogo}" alt="${c.party}" class="candidate-party-logo-large" onerror="this.style.display='none'">
                            </div>
                            <div class="candidate-info">
                                <div class="candidate-name">${c.name}${starBadge}</div>
                                ${positionEl}
                                <span class="candidate-party" style="background:${partyColor};color:${partyTextColor}">
                                    <span class="party-name">${c.party}</span>
                                </span>
                            </div>
                        </div>`;
                    }).join('');
                } else {
                    candidatesEl.innerHTML = '<p class="no-data">No candidates declared</p>';
                }
            } catch (e) {
                candidatesEl.innerHTML = '<p class="no-data">No candidates declared</p>';
            }
            return;
        }

        if (resultsTitle) {
            resultsTitle.innerHTML = `Election Results <span class="section-subtitle">Votes / Share %</span>`;
        }
        candidatesEl.innerHTML = '<div class="loading-spinner" style="margin:20px auto;"></div>'; // Inline loading

        try {
            const electionResults = await DataModule.getElectionResults(year, id);

            if (electionResults && electionResults.candidates) {
                const maxVotes = Math.max(...electionResults.candidates.map(c => c.votes || 0));

                // Calculate total votes for vote share bar
                const totalVotes = electionResults.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

                // Create vote share visualization bar HTML
                const voteShareBar = electionResults.candidates.map((c, i) => {
                    const sharePercent = totalVotes > 0 ? ((c.votes || 0) / totalVotes * 100) : 0;
                    const partyColor = DataModule.getPartyColor(c.party);
                    const labelColor = DataModule.getPartyTextColor(c.party);
                    // Only show labels for top 3 candidates and if segment is large enough
                    const showLabel = i < 3 && sharePercent > 7;
                    return sharePercent > 0 ? `<div class="vote-share-segment" style="width:${sharePercent}%;background:${partyColor}" title="${c.party}: ${sharePercent.toFixed(1)}%">${showLabel ? `<span class="segment-label" style="color:${labelColor}">${sharePercent.toFixed(1)}%</span>` : ''}</div>` : '';
                }).join('');

                // Insert vote share bar before candidates
                const voteShareBarHTML = `<div class="vote-share-bar">${voteShareBar}</div>`;

                candidatesEl.innerHTML = voteShareBarHTML + electionResults.candidates.map((c, i) => {
                    const partyColor = DataModule.getPartyColor(c.party);
                    const partyTextColor = DataModule.getPartyTextColor(c.party);
                    const borderGradient = DataModule.getPartyBorderGradient(c.party);
                    const partyLogo = DataModule.getPartyLogo(c.party);
                    const votePercent = maxVotes > 0 ? ((c.votes || 0) / maxVotes * 100) : 0;
                    const isWinner = i === 0;

                    return `<div class="candidate-row ${isWinner ? 'winner' : ''}" style="--candidate-color:${partyColor};--border-gradient:${borderGradient}">
                        <span class="candidate-rank">${i + 1}</span>
                        <div class="candidate-logo-box">
                            <img src="${partyLogo}" alt="${c.party}" class="candidate-party-logo-large" onerror="this.style.display='none'">
                        </div>
                        <div class="candidate-info">
                            <div class="candidate-name">${c.name}</div>
                            <span class="candidate-party" style="background:${partyColor};color:${partyTextColor}"${c.incumbent ? ' title="Incumbent"' : ''}>
                                <span class="party-name">${c.party}</span>${c.incumbent ? '<span class="incumbent-star" aria-label="Incumbent">★</span>' : ''}
                            </span>
                        </div>
                        <div class="candidate-votes">
                            <div class="candidate-vote-count">${(c.votes || 0).toLocaleString()}</div>
                            <div class="candidate-vote-share">${c.vote_share?.toFixed(1) || 0}%</div>
                            <div class="vote-bar-container">
                                <div class="vote-bar" style="width:${votePercent}%;background:${partyColor}"></div>
                            </div>
                        </div>
                    </div>`;
                }).join('');
            } else {
                candidatesEl.innerHTML = '<p class="no-data">No candidate data available for this year</p>';
            }
        } catch (e) {
            console.error('Error fetching election results:', e);
            candidatesEl.innerHTML = '<p class="no-data">Error loading data</p>';
        }
    }

    function resetConstituencyTrigger() {
        if (constituencyTriggerLabel) constituencyTriggerLabel.textContent = 'All Constituencies';
        _closeConstituencyDropdown();
    }

    return {
        init, populateConstituencyDropdown,
        handleYearChange, showLoading, hideLoading,
        showBackButton, hideBackButton, showLegend, hideLegend,
        showConstituencyOverlay, hideConstituencyOverlay,
        setConstituencyDropdowns, navigateToNext, navigateToPrev,
        resetConstituencyTrigger
    };
})();
