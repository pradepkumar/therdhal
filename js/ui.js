/**
 * UI Module - Handles UI components, filters, and overlays
 */

const UIModule = (function () {
    let yearFilter, districtFilter, constituencyFilter;
    let backButton, legend, loadingOverlay;
    let overlay, overlayClose;

    function init() {
        yearFilter = document.getElementById('year-filter');
        districtFilter = document.getElementById('district-filter');
        constituencyFilter = document.getElementById('constituency-filter');
        backButton = document.getElementById('back-btn');
        legend = document.getElementById('legend');
        loadingOverlay = document.getElementById('loading');
        overlay = document.getElementById('constituency-overlay');
        overlayClose = document.getElementById('overlay-close');
        setupEventListeners();
    }

    function setupEventListeners() {
        yearFilter.addEventListener('change', async (e) => {
            await handleYearChange(e.target.value);
        });
        districtFilter.addEventListener('change', (e) => {
            handleDistrictChange(e.target.value);
        });
        constituencyFilter.addEventListener('change', (e) => {
            if (e.target.value) MapModule.zoomToConstituency(e.target.value);
        });
        backButton.addEventListener('click', () => MapModule.resetToOverview());
        overlayClose.addEventListener('click', () => hideConstituencyOverlay());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hideConstituencyOverlay();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hideConstituencyOverlay();
        });
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
            opt.textContent = `${c.id}. ${c.name}`;
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
        } else {
            MapModule.setElectionYear(null);
            hideLegend();
        }
    }

    async function handleDistrictChange(district) {
        await populateConstituencyDropdown(district);
        if (district) {
            // Zoom to selected district
            MapModule.zoomToDistrict(district);
        }
    }

    function showLoading() { loadingOverlay.classList.remove('hidden'); }
    function hideLoading() { loadingOverlay.classList.add('hidden'); }
    function showBackButton() { backButton.classList.remove('hidden'); }
    function hideBackButton() { backButton.classList.add('hidden'); }

    function showLegend() {
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

    function hideLegend() { legend.classList.add('hidden'); }

    async function showConstituencyOverlay(id) {
        const info = await DataModule.getConstituencyInfo(id);
        const history = await DataModule.getWinnerHistory(id);
        const electionResults = await DataModule.getElectionResults(2021, id);
        if (!info) return;

        document.getElementById('constituency-type').textContent = info.type || 'General';
        document.getElementById('constituency-type').className = `constituency-badge ${info.type === 'SC' ? 'sc' : ''}`;
        document.querySelector('#constituency-name .name-en').textContent = info.name;
        document.querySelector('#constituency-name .name-ta').textContent = info.name_ta || '';
        document.getElementById('constituency-district').textContent = info.district;
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
            candidatesEl.innerHTML = electionResults.candidates.map((c, i) => {
                const partyColor = DataModule.getPartyColor(c.party);
                const votePercent = maxVotes > 0 ? ((c.votes || 0) / maxVotes * 100) : 0;
                const isWinner = i === 0;
                return `<div class="candidate-row ${isWinner ? 'winner' : ''}" style="--candidate-color:${partyColor}">
                    <span class="candidate-rank">${i + 1}</span>
                    <div class="candidate-info">
                        <div class="candidate-name">${c.name}</div>
                        <span class="candidate-party" style="background:${partyColor};color:white">${c.party}</span>
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

    function hideConstituencyOverlay() { overlay.classList.add('hidden'); }

    return {
        init, populateDistrictDropdown, populateConstituencyDropdown,
        handleDistrictChange, handleYearChange, showLoading, hideLoading,
        showBackButton, hideBackButton, showLegend, hideLegend,
        showConstituencyOverlay, hideConstituencyOverlay
    };
})();
