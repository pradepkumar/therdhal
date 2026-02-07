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

        const parties = [
            { name: 'DMK', color: DataModule.getPartyColor('DMK') },
            { name: 'AIADMK', color: DataModule.getPartyColor('AIADMK') },
            { name: 'BJP', color: DataModule.getPartyColor('BJP') },
            { name: 'INC', color: DataModule.getPartyColor('INC') },
            { name: 'Others', color: DataModule.getPartyColor('OTHERS') }
        ];
        document.querySelector('.legend-items').innerHTML = parties.map(p =>
            `<div class="legend-item"><div class="legend-color" style="background:${p.color}"></div><span>${p.name}</span></div>`
        ).join('');
        legend.classList.remove('hidden');
    }

    function hideLegend() {
        if (legend) {
            legend.classList.add('hidden');
        }
    }

    async function showConstituencyOverlay(id) {
        currentConstituencyId = id;
        const info = await DataModule.getConstituencyInfo(id);
        const history = await DataModule.getWinnerHistory(id);
        const electionResults = await DataModule.getElectionResults(2021, id);
        if (!info) return;

        // Update dropdowns to reflect the selected constituency
        setConstituencyDropdowns(id, info.district);

        document.getElementById('constituency-type').textContent = info.type || 'General';
        document.getElementById('constituency-type').className = `constituency-badge ${info.type === 'SC' ? 'sc' : ''}`;
        document.querySelector('#constituency-name .name-en').textContent = info.name;
        document.querySelector('#constituency-name .name-ta').textContent = info.name_ta || '';
        document.getElementById('constituency-district').textContent = info.district;
        document.getElementById('constituency-description').textContent = info.description || '';
        document.getElementById('registered-voters').textContent = info.registered_voters?.toLocaleString() || 'N/A';
        document.getElementById('constituency-id').textContent = id;

        const histEl = document.getElementById('election-history');
        histEl.innerHTML = history.length ? history.map(h =>
            `<div class="election-card" style="--party-color:${DataModule.getPartyColor(h.winner.party)}">
                <div class="election-year">${h.year}</div>
                <div class="election-details">
                    <span class="winner-name">${h.winner.name}</span>
                    <span class="winner-party" style="background:${DataModule.getPartyColor(h.winner.party)}">${h.winner.party}</span>
                    <span class="election-margin">Margin: ${h.margin?.toLocaleString() || 'N/A'}</span>
                    <span class="election-turnout">Turnout: ${h.turnout || 'N/A'}%</span>
                </div>
            </div>`
        ).join('') : '<p class="no-data">No data</p>';

        // Render all candidates for 2021
        const candidatesEl = document.getElementById('candidates-table');
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
                const partyFlagColors = DataModule.getPartyFlagColors(c.party);
                const partyLogo = DataModule.getPartyLogo(c.party);
                const votePercent = maxVotes > 0 ? ((c.votes || 0) / maxVotes * 100) : 0;
                const isWinner = i === 0;

                // Create gradient for multi-colored border
                let borderGradient;
                if (partyFlagColors.length === 1) {
                    borderGradient = partyFlagColors[0];
                } else if (partyFlagColors.length === 2) {
                    borderGradient = `linear-gradient(to bottom, ${partyFlagColors[0]} 50%, ${partyFlagColors[1]} 50%)`;
                } else if (partyFlagColors.length === 3) {
                    borderGradient = `linear-gradient(to bottom, ${partyFlagColors[0]} 33.33%, ${partyFlagColors[1]} 33.33%, ${partyFlagColors[1]} 66.66%, ${partyFlagColors[2]} 66.66%)`;
                } else {
                    // For more than 3 colors, distribute evenly
                    const step = 100 / partyFlagColors.length;
                    const stops = partyFlagColors.map((color, idx) =>
                        `${color} ${idx * step}%, ${color} ${(idx + 1) * step}%`
                    ).join(', ');
                    borderGradient = `linear-gradient(to bottom, ${stops})`;
                }

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
            candidatesEl.innerHTML = '<p class="no-data">No candidate data available</p>';
        }

        const winEl = document.getElementById('winners-list');
        winEl.innerHTML = history.length ? history.map(h =>
            `<div class="winner-row">
                <span class="winner-year-badge">${h.year}</span>
                <div class="winner-info"><span class="name">${h.winner.name}</span><span class="party">${h.winner.party}</span></div>
            </div>`
        ).join('') : '<p class="no-data">No data</p>';

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

    return {
        init, populateDistrictDropdown, populateConstituencyDropdown,
        handleDistrictChange, handleYearChange, showLoading, hideLoading,
        showBackButton, hideBackButton, showLegend, hideLegend,
        showConstituencyOverlay, hideConstituencyOverlay, setDistrictDropdown,
        setConstituencyDropdowns, navigateToNext, navigateToPrev
    };
})();
