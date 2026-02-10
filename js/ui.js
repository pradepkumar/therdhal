/**
 * UI Module - Handles UI components, filters, and overlays
 */

const UIModule = (function () {
    let yearFilter, districtFilter, constituencyFilter;
    let candidateFilterGroup, candidateSearchInput, candidateResults;
    let searchTimeout;
    let backButton, legend, loadingOverlay;
    let overlay, overlayClose;
    let currentConstituencyId = null;
    let allConstituencies = [];
    let touchStartX = 0;
    let touchEndX = 0;
    let isUpdatingDistrict = false;  // Flag to prevent recursive updates
    let isUpdatingConstituency = false;  // Flag to prevent recursive updates
    let currentOverlayElectionYear = 2021; // State for overlay year navigation

    function init() {
        yearFilter = document.getElementById('year-filter');
        districtFilter = document.getElementById('district-filter');
        constituencyFilter = document.getElementById('constituency-filter');
        backButton = document.getElementById('back-btn');
        legend = document.getElementById('legend');
        loadingOverlay = document.getElementById('loading');
        overlay = document.getElementById('constituency-overlay');
        overlay = document.getElementById('constituency-overlay');
        overlayClose = document.getElementById('overlay-close');

        candidateFilterGroup = document.getElementById('candidate-filter-group');
        candidateSearchInput = document.getElementById('candidate-search');
        candidateResults = document.getElementById('candidate-results');

        // Load all constituencies once for navigation
        DataModule.getConstituencyList().then(list => {
            allConstituencies = list;
        });

        setupEventListeners();
        setupCandidateSearch();
        setupOverlayYearControls();
    }

    function setupEventListeners() {
        yearFilter.addEventListener('change', async (e) => {
            await handleYearChange(e.target.value);
        });
        districtFilter.addEventListener('change', (e) => {
            handleDistrictChange(e.target.value);
        });
        constituencyFilter.addEventListener('change', (e) => {
            // Prevent handling if we're programmatically updating the dropdown
            if (isUpdatingConstituency) return;
            if (e.target.value) MapModule.zoomToConstituency(e.target.value);
        });
        backButton.addEventListener('click', () => MapModule.resetToOverview());
        overlayClose.addEventListener('click', () => hideConstituencyOverlay());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hideConstituencyOverlay();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hideConstituencyOverlay();
            if (overlay.classList.contains('hidden')) return;
            if (e.key === 'ArrowRight') navigateToNext();
            if (e.key === 'ArrowLeft') navigateToPrev();
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
        }, { passive: true });

        overlay.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
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

    async function populateDistrictDropdown() {
        const districts = await DataModule.getDistrictList();
        districtFilter.innerHTML = '<option value="">All Districts</option>';
        districts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            districtFilter.appendChild(opt);
        });
    }

    async function populateConstituencyDropdown(district = null) {
        const list = await DataModule.getConstituencyList(district);
        constituencyFilter.innerHTML = '<option value="">All Constituencies</option>';
        list.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            constituencyFilter.appendChild(opt);
        });
    }

    async function handleYearChange(year) {
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

    async function handleDistrictChange(district) {
        // Prevent handling if we're programmatically updating the dropdown
        if (isUpdatingDistrict) return;

        await populateConstituencyDropdown(district);
        if (district) {
            // Zoom to selected district
            MapModule.zoomToDistrict(district);
        }
    }

    function setDistrictDropdown(district) {
        isUpdatingDistrict = true;

        // Find the matching option (case-insensitive)
        const districtUpper = district.toUpperCase();
        let matchedValue = null;

        for (let i = 0; i < districtFilter.options.length; i++) {
            const option = districtFilter.options[i];
            if (option.value.toUpperCase() === districtUpper) {
                matchedValue = option.value;
                break;
            }
        }

        if (matchedValue) {
            districtFilter.value = matchedValue;
            populateConstituencyDropdown(matchedValue);
        }

        isUpdatingDistrict = false;
    }

    function setConstituencyDropdowns(constituencyId, district) {
        isUpdatingDistrict = true;
        isUpdatingConstituency = true;

        // Set district dropdown first
        if (district) {
            const districtUpper = district.toUpperCase();
            for (let i = 0; i < districtFilter.options.length; i++) {
                const option = districtFilter.options[i];
                if (option.value.toUpperCase() === districtUpper) {
                    districtFilter.value = option.value;
                    break;
                }
            }
        }

        // Populate constituency dropdown for the district
        populateConstituencyDropdown(district).then(() => {
            // Set constituency dropdown
            constituencyFilter.value = String(constituencyId);

            isUpdatingDistrict = false;
            isUpdatingConstituency = false;
        });
    }

    function showLoading() { loadingOverlay.classList.remove('hidden'); }
    function hideLoading() { loadingOverlay.classList.add('hidden'); }
    function showBackButton() { backButton.classList.remove('hidden'); }
    function hideBackButton() { backButton.classList.add('hidden'); }

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

        const data = window.electionData && window.electionData[year];
        if (!data) return;

        // Update legend title
        const titleEl = legend.querySelector('.legend-title');
        if (titleEl) titleEl.textContent = year;

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

        // Process defined alliances
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

        // Render HTML
        const itemsEl = document.querySelector('.legend-items');
        if (itemsEl) {
            itemsEl.innerHTML = allianceSummary.map(alliance => `
                <div class="legend-alliance">
                    <div class="alliance-header">
                        <span class="alliance-name">${alliance.name}</span>
                        <span class="alliance-seats">${alliance.totalSeats}</span>
                    </div>
                    <div class="alliance-parties">
                        ${alliance.parties.map(p => `
                            <div class="legend-item">
                                <div class="legend-color" style="background:${p.color}"></div>
                                <span class="party-name">${p.name}</span>
                                <span class="party-seats">${p.seats}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        legend.classList.remove('hidden');
    }

    function hideLegend() {
        if (legend) {
            legend.classList.add('hidden');
        }
    }

    async function showConstituencyOverlay(id) {
        currentConstituencyId = id;

        // Initialize overlay year from filter or default to 2021
        currentOverlayElectionYear = parseInt(yearFilter.value) || 2021;

        const info = await DataModule.getConstituencyInfo(id);
        const history = await DataModule.getWinnerHistory(id);
        // Election results will be loaded via updateOverlayElectionResults

        if (!info) return;

        // Update dropdowns to reflect the selected constituency
        setConstituencyDropdowns(id, info.district);

        document.getElementById('constituency-type').textContent = info.type || 'General';
        document.getElementById('constituency-type').className = `constituency-badge ${info.type === 'SC' ? 'sc' : ''}`;
        document.querySelector('#constituency-name .name-en').textContent = info.name;
        document.querySelector('#constituency-name .name-ta').textContent = info.name_ta || '';
        document.getElementById('constituency-district').textContent = info.district;
        document.getElementById('constituency-description').textContent = info.description || '';

        // Update Constituency ID
        document.getElementById('constituency-id').textContent = id;

        // Render Election History (All Years)
        const histEl = document.getElementById('election-history');
        if (histEl) {
            const historyTitle = document.querySelector('.history-section .section-title');
            if (historyTitle) {
                historyTitle.innerHTML = `Election History <span class="section-subtitle">Winner's Margin / %</span>`;
            }
            histEl.innerHTML = history.length ? history.map(h => {
                const partyColor = DataModule.getPartyColor(h.winner.party);
                const borderGradient = DataModule.getPartyBorderGradient(h.winner.party);
                const partyLogo = DataModule.getPartyLogo(h.winner.party);

                return `<div class="candidate-row winner" style="--candidate-color:${partyColor};--border-gradient:${borderGradient}">
                    <span class="candidate-rank">${h.year}</span>
                    <div class="candidate-logo-box">
                        <img src="${partyLogo}" alt="${h.winner.party}" class="candidate-party-logo-large" onerror="this.style.display='none'">
                    </div>
                    <div class="candidate-info">
                        <div class="candidate-name">${h.winner.name}</div>
                        <span class="candidate-party" style="background:${partyColor};color:white">
                            <span class="party-name">${h.winner.party}</span>
                        </span>
                        ${h.winner.incumbent ? '<span class="incumbent-pill">Incumbent</span>' : ''}
                    </div>
                    <div class="candidate-votes">
                        <div class="candidate-vote-count">${h.margin?.toLocaleString() || '0'}</div>
                        <div class="candidate-vote-share" style="color: ${Helpers.getMarginColor(h.margin_percent)}">
                            ${h.margin_percent?.toFixed(1) || '0'}%
                        </div>
                    </div>
                </div>`;
            }).join('') : '<p class="no-data">No data</p>';
        }

        // Handle electors as an object (year-specific) or a single number
        // Initial update of election results and voters for the current year
        updateOverlayElectionResults(id, currentOverlayElectionYear);

        overlay.classList.remove('hidden');
    }

    function hideConstituencyOverlay() {
        overlay.classList.add('hidden');
        document.body.classList.remove('overlay-open');
        currentConstituencyId = null;
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            navigateToNext();
        } else if (touchEndX > touchStartX + swipeThreshold) {
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
                <span class="search-party-tag" style="background:${DataModule.getPartyColor(c.party)}">${c.party}</span>
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

        // Update Registered Voters (depends on year)
        const info = await DataModule.getConstituencyInfo(id);
        if (info) {
            const electorsCount = (info.electors && typeof info.electors === 'object')
                ? info.electors[year]
                : info.electors;
            document.getElementById('registered-voters').textContent = electorsCount?.toLocaleString() || 'N/A';
        }

        // Fetch and display results
        const candidatesEl = document.getElementById('candidates-table');
        const resultsTitle = document.querySelector('.candidates-section .section-title');
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
                    // Only show labels for top 3 candidates and if segment is large enough
                    const showLabel = i < 3 && sharePercent > 7;
                    return sharePercent > 0 ? `<div class="vote-share-segment" style="width:${sharePercent}%;background:${partyColor}" title="${c.party}: ${sharePercent.toFixed(1)}%">${showLabel ? `<span class="segment-label">${sharePercent.toFixed(1)}%</span>` : ''}</div>` : '';
                }).join('');

                // Insert vote share bar before candidates
                const voteShareBarHTML = `<div class="vote-share-bar">${voteShareBar}</div>`;

                candidatesEl.innerHTML = voteShareBarHTML + electionResults.candidates.map((c, i) => {
                    const partyColor = DataModule.getPartyColor(c.party);
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
                            <span class="candidate-party" style="background:${partyColor};color:white">
                                <span class="party-name">${c.party}</span>
                            </span>
                            ${c.incumbent ? '<span class="incumbent-pill">Incumbent</span>' : ''}
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

    return {
        init, populateDistrictDropdown, populateConstituencyDropdown,
        handleDistrictChange, handleYearChange, showLoading, hideLoading,
        showBackButton, hideBackButton, showLegend, hideLegend,
        showConstituencyOverlay, hideConstituencyOverlay, setDistrictDropdown,
        setConstituencyDropdowns, navigateToNext, navigateToPrev
    };
})();
