/**
 * TN Elections 2026 — Modal Module
 * Self-contained: opens/closes the elections panel in index.html
 */

'use strict';

/* ════════════════════════════════════════════════
   DATA — Official Election Schedule (ECI, 15 Mar 2026)
   ════════════════════════════════════════════════ */
const ELECTION_EVENTS_2026 = [
    {
        id: 'mcc',
        date: '2026-03-15',
        name: 'Model Code of Conduct Begins',
        description: 'MCC came into force with the Election Commission\'s announcement of the schedule.',
        icon: '📋'
    },
    {
        id: 'gazette',
        date: '2026-03-30',
        name: 'Gazette Notification Issued',
        description: 'Official gazette notification commences the election process for all 234 constituencies.',
        icon: '📰'
    },
    {
        id: 'nominations',
        date: '2026-04-06',
        name: 'Last Date for Filing Nominations',
        description: 'Candidates must file nominations with Returning Officers before end of working hours.',
        icon: '📝'
    },
    {
        id: 'scrutiny',
        date: '2026-04-07',
        name: 'Scrutiny of Nominations',
        description: 'Filed nominations are checked and scrutinised by Returning Officers.',
        icon: '🔍'
    },
    {
        id: 'withdrawal',
        date: '2026-04-09',
        name: 'Last Date for Withdrawal',
        description: 'Candidates may withdraw from the contest by 3:00 PM on this date.',
        icon: '🚫'
    },
    {
        id: 'poll',
        date: '2026-04-23',
        name: 'Polling Day — Election Day',
        description: 'Voting for all 234 constituencies. Polls open 7:00 AM – 6:00 PM.',
        icon: '🗳️'
    },
    {
        id: 'counting',
        date: '2026-05-04',
        name: 'Counting of Votes & Results',
        description: 'Votes are counted and winners declared for all 234 constituencies.',
        icon: '🧮'
    },
    {
        id: 'completion',
        date: '2026-05-06',
        name: 'Election Process Completion Deadline',
        description: 'Process must be completed before the Assembly\'s term ends on May 10, 2026.',
        icon: '✅'
    }
];

/* ════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════ */
function e2026_parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function e2026_formatDateShort(date) {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function e2026_pad(n) {
    return String(n).padStart(2, '0');
}

function e2026_todayMidnight() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/* ════════════════════════════════════════════════
   CLASSIFY EVENTS
   ════════════════════════════════════════════════ */
function e2026_classifyEvents() {
    const today = e2026_todayMidnight();
    let nextIdx = -1;

    const classified = ELECTION_EVENTS_2026.map((evt) => {
        const evtDate = e2026_parseDate(evt.date);
        const diff = evtDate - today;
        let status = diff < 0 ? 'past' : diff === 0 ? 'today' : 'upcoming';
        return { ...evt, evtDate, status };
    });

    for (let i = 0; i < classified.length; i++) {
        if (classified[i].status === 'upcoming') { nextIdx = i; break; }
    }

    const todayIdx = classified.findIndex(e => e.status === 'today');
    return { classified, nextIdx, todayIdx };
}

/* ════════════════════════════════════════════════
   RENDER TIMELINE
   ════════════════════════════════════════════════ */
function e2026_renderTimeline() {
    const container = document.getElementById('emodal-timeline');
    if (!container) return;

    const { classified, nextIdx, todayIdx } = e2026_classifyEvents();
    container.innerHTML = '';

    classified.forEach((evt, i) => {
        const isToday  = evt.status === 'today';
        const isNext   = !isToday && i === nextIdx;
        const isPast   = evt.status === 'past';

        const dotClass  = isToday ? 'today' : isNext ? 'next' : isPast ? 'past' : 'upcoming';
        const badgeCls  = isToday ? 'today' : isNext ? 'next' : isPast ? 'past' : 'upcoming';
        const badgeTxt  = e2026_formatDateShort(evt.evtDate);

        let itemCls = 'etl-item';
        if (isToday) itemCls += ' is-today';
        if (isNext)  itemCls += ' is-next';
        if (isPast)  itemCls += ' is-past';

        let statusTag = '';
        if (isToday) statusTag = `<span class="etl-status today-tag">Today</span>`;
        else if (isNext) statusTag = `<span class="etl-status next-tag">Next</span>`;
        else if (isPast) statusTag = `<span class="etl-status past-tag">Done</span>`;

        const el = document.createElement('div');
        el.className = itemCls;
        el.style.animationDelay = `${i * 50}ms`;
        el.innerHTML = `
            <div class="etl-dot-marker ${dotClass}"></div>
            <div class="etl-card">
                <div class="etl-card-top">
                    <h4 class="etl-name">${evt.icon} ${evt.name}</h4>
                    <span class="etl-badge ${badgeCls}">${badgeTxt}</span>
                </div>
                ${statusTag}
                <p class="etl-desc">${evt.description}</p>
            </div>
        `;
        container.appendChild(el);
    });
}

/* ════════════════════════════════════════════════
   RENDER NEWS
   ════════════════════════════════════════════════ */
function e2026_renderNews() {
    const container = document.getElementById('emodal-news');
    if (!container) return;
    container.innerHTML = '';

    NEWS_ITEMS_2026.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'enews-card';
        card.style.animationDelay = `${i * 60}ms`;
        card.innerHTML = `
            <div class="enews-card-header">
                <span class="enews-tag ${item.tag}">${item.tagLabel}</span>
                <span class="enews-date">${item.date}</span>
            </div>
            <h4 class="enews-title">${item.title}</h4>
            <p class="enews-body">${item.body}</p>
        `;
        container.appendChild(card);
    });
}

/* ════════════════════════════════════════════════
   COUNTDOWN TIMER
   ════════════════════════════════════════════════ */
let e2026_interval = null;

function e2026_startCountdown() {
    const { classified, nextIdx, todayIdx } = e2026_classifyEvents();

    const labelEl   = document.getElementById('ecd-label');
    const nameEl    = document.getElementById('ecd-event-name');
    const timerEl   = document.getElementById('ecd-timer');
    const bannerEl  = document.getElementById('ecd-today-banner');
    const sectionEl = document.getElementById('emodal-countdown');

    // Today's event
    if (todayIdx !== -1) {
        const evt = classified[todayIdx];
        if (labelEl)   labelEl.textContent  = '🎯 Today\'s Event';
        if (nameEl)    nameEl.textContent   = evt.name;
        if (timerEl)   timerEl.style.display = 'none';
        if (bannerEl)  bannerEl.classList.remove('hidden');
        if (sectionEl) sectionEl.style.background = 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,150,105,0.06))';
        return;
    }

    if (bannerEl)  bannerEl.classList.add('hidden');
    if (timerEl)   timerEl.style.display = 'flex';

    // All done
    if (nextIdx === -1) {
        if (labelEl)  labelEl.textContent = '✅ Elections concluded';
        if (nameEl)   nameEl.textContent  = 'All TN 2026 events are complete';
        if (timerEl)  timerEl.style.display = 'none';
        return;
    }

    const next = classified[nextIdx];
    if (labelEl) labelEl.textContent = `Next: ${next.icon} ${next.name}`;
    if (nameEl)  nameEl.textContent  = e2026_formatDateShort(next.evtDate);

    const target = next.evtDate.getTime();

    function tick() {
        const diff = target - Date.now();
        if (diff <= 0) {
            e2026_renderTimeline();
            e2026_startCountdown();
            return;
        }
        const s = Math.floor(diff / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sc = s % 60;

        const el = id => document.getElementById(id);
        if (el('ecd-days'))    el('ecd-days').textContent    = e2026_pad(d);
        if (el('ecd-hours'))   el('ecd-hours').textContent   = e2026_pad(h);
        if (el('ecd-minutes')) el('ecd-minutes').textContent = e2026_pad(m);
        if (el('ecd-seconds')) el('ecd-seconds').textContent = e2026_pad(sc);
    }

    if (e2026_interval) clearInterval(e2026_interval);
    tick();
    e2026_interval = setInterval(tick, 1000);
}

function e2026_stopCountdown() {
    if (e2026_interval) {
        clearInterval(e2026_interval);
        e2026_interval = null;
    }
}

/* ════════════════════════════════════════════════
   MODAL OPEN / CLOSE
   ════════════════════════════════════════════════ */
let _e2026_prevFocus = null;

function _e2026_getFocusable(container) {
    return Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
}

function e2026_openModal() {
    const modal = document.getElementById('elections-modal');
    if (!modal) return;
    _e2026_prevFocus = document.activeElement;
    modal.classList.remove('hidden');

    // Initialize new tab-based modal
    e2026_renderStepper();
    e2026_startPageCountdown();
    e2026_initTabs();

    // Focus the close button when modal opens
    const closeBtn = modal.querySelector('#elections-modal-close');
    if (closeBtn) closeBtn.focus();

    document.addEventListener('keydown', e2026_handleKey);
}

function e2026_closeModal() {
    const modal = document.getElementById('elections-modal');
    if (!modal) return;
    // Clean up any open star chart
    if (e2026_openStarChart) { e2026_openStarChart.destroy(); e2026_openStarChart = null; }
    if (e2026_openStarCard)  e2026_openStarCard.classList.remove('is-open');
    if (e2026_openStarPanel) e2026_openStarPanel.classList.remove('is-open');
    e2026_openStarIdx = null; e2026_openStarCard = null; e2026_openStarPanel = null;
    modal.classList.add('hidden');
    e2026_stopCountdown();
    document.removeEventListener('keydown', e2026_handleKey);
    // Restore focus to the trigger element
    if (_e2026_prevFocus && typeof _e2026_prevFocus.focus === 'function') {
        _e2026_prevFocus.focus();
    }
    _e2026_prevFocus = null;
}

function e2026_handleKey(e) {
    if (e.key === 'Escape') { e2026_closeModal(); return; }
    if (e.key !== 'Tab') return;
    const modal = document.getElementById('elections-modal');
    if (!modal) return;
    const focusable = _e2026_getFocusable(modal);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
}

let e2026_pageInterval = null;
let e2026_openStarIdx   = null;
let e2026_openStarChart = null;
let e2026_openStarCard  = null;
let e2026_openStarPanel = null;

function e2026_renderStepper() {
    const container = document.getElementById('epg-stepper');
    if (!container) return;

    const { classified, nextIdx } = e2026_classifyEvents();
    container.innerHTML = '';

    const shortLabels = {
        'mcc': 'MCC',
        'gazette': 'Gazette',
        'nominations': 'Nominations',
        'scrutiny': 'Scrutiny',
        'withdrawal': 'Withdrawal',
        'poll': 'Poll Day',
        'counting': 'Results',
        'completion': 'Final'
    };

    classified.forEach((evt, i) => {
        const isNext = i === nextIdx;
        const isToday = evt.status === 'today';
        const isPast = evt.status === 'past';
        const stepState = isToday ? 'today' : isNext ? 'next' : isPast ? 'past' : 'upcoming';

        const shortDate = evt.evtDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const shortLabel = shortLabels[evt.id] || evt.name;

        const el = document.createElement('div');
        el.className = `epg-step epg-step--${stepState}`;
        el.innerHTML = `
            <div class="epg-step-dot">${evt.icon}</div>
            <div class="epg-step-label">${shortLabel}</div>
            <div class="epg-step-date">${shortDate}</div>
        `;
        container.appendChild(el);

        if (i < classified.length - 1) {
            const connectorState = isPast ? 'past' : 'upcoming';
            const connector = document.createElement('div');
            connector.className = `epg-step-connector epg-step-connector--${connectorState}`;
            container.appendChild(connector);
        }
    });
}

function e2026_startPageCountdown() {
    const POLL_DATE = new Date(2026, 3, 23, 7, 0, 0); // April 23, 7:00 AM
    const stateEl = document.getElementById('epg-bar-state');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pollDay = new Date(POLL_DATE.getFullYear(), POLL_DATE.getMonth(), POLL_DATE.getDate());

    // Check if today is polling day
    if (today.getTime() === pollDay.getTime()) {
        if (stateEl) {
            stateEl.textContent = '🗳️ Vote Now!';
            stateEl.classList.add('epg-bar-today');
        }
        // Hide timer on polling day
        const timerEl = document.getElementById('epg-timer');
        if (timerEl) timerEl.style.display = 'none';
        return;
    }

    // Check if polling is over
    if (now > POLL_DATE) {
        if (stateEl) {
            stateEl.textContent = '✅ Polling Complete';
        }
        const timerEl = document.getElementById('epg-timer');
        if (timerEl) timerEl.style.display = 'none';
        return;
    }

    // Show countdown
    const timerEl = document.getElementById('epg-timer');
    if (timerEl) timerEl.style.display = 'flex';

    function tick() {
        const diff = POLL_DATE - Date.now();
        if (diff <= 0) {
            e2026_startPageCountdown();
            return;
        }

        const s = Math.floor(diff / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sc = s % 60;

        const el = id => document.getElementById(id);
        if (el('epg-days')) el('epg-days').textContent = e2026_pad(d);
        if (el('epg-hours')) el('epg-hours').textContent = e2026_pad(h);
        if (el('epg-mins')) el('epg-mins').textContent = e2026_pad(m);
        if (el('epg-secs')) el('epg-secs').textContent = e2026_pad(sc);
    }

    if (e2026_pageInterval) clearInterval(e2026_pageInterval);
    tick();
    e2026_pageInterval = setInterval(tick, 1000);
}


function e2026_makeLogoHtml(partyName, extraClass) {
    const logoPath = typeof PartyConfig !== 'undefined'
        ? PartyConfig.getLogo(partyName)
        : '';
    const cls = extraClass ? `epg-party-logo ${extraClass}` : 'epg-party-logo';
    const phCls = extraClass ? `epg-party-logo-placeholder ${extraClass}` : 'epg-party-logo-placeholder';
    return logoPath && !logoPath.includes('placeholder')
        ? `<img src="${logoPath}" alt="${partyName}" class="${cls}" onerror="this.style.display='none'" />`
        : `<div class="${phCls}"></div>`;
}

function e2026_renderAlliances() {
    const container = document.getElementById('epg-tab-alliances');
    if (!container || typeof ALLIANCES_2026 === 'undefined') return;

    container.innerHTML = '';

    const alliancesDiv = document.createElement('div');
    alliancesDiv.className = 'epg-alliances';

    const col1 = document.createElement('div');
    col1.className = 'epg-alliances-col';
    const col2 = document.createElement('div');
    col2.className = 'epg-alliances-col';

    ALLIANCES_2026.forEach(alliance => {
        const card = document.createElement('div');
        card.className = 'epg-alliance-card';

        // Header
        const header = document.createElement('div');
        header.className = 'epg-alliance-header';
        header.style.borderBottomColor = alliance.color;
        header.innerHTML = `
            <div class="epg-alliance-color" style="background-color: ${alliance.color};"></div>
            <div class="epg-alliance-name">${alliance.name}</div>
        `;
        card.appendChild(header);

        // Seat table
        const table = document.createElement('div');
        table.className = 'epg-seat-table';

        alliance.parties.forEach(party => {
            const seatNum = party.seats != null ? party.seats : '—';

            if (party.subParties && party.subParties.length > 0) {
                // Expandable row wrapper
                const wrapper = document.createElement('div');
                wrapper.className = 'epg-seat-row-wrapper';

                const row = document.createElement('div');
                row.className = 'epg-seat-row epg-seat-row--expandable';
                row.setAttribute('role', 'button');
                row.setAttribute('aria-expanded', 'false');
                row.innerHTML = `
                    <div class="epg-party-info">
                        ${e2026_makeLogoHtml(party.name)}
                        <div class="epg-party-name">${party.name}</div>
                    </div>
                    <div class="epg-seat-count">
                        <span class="epg-seat-num">${seatNum}</span>
                        <span class="epg-expand-arrow" aria-hidden="true">▾</span>
                    </div>
                `;

                // Sub-parties list
                const subList = document.createElement('div');
                subList.className = 'epg-sub-parties';

                party.subParties.forEach(sub => {
                    const subRow = document.createElement('div');
                    subRow.className = 'epg-sub-row';
                    subRow.innerHTML = `
                        <div class="epg-party-info">
                            ${e2026_makeLogoHtml(sub.name, 'epg-party-logo--sm')}
                            <div class="epg-party-name">${sub.name}</div>
                        </div>
                        <div class="epg-seat-count">
                            <span class="epg-seat-num epg-seat-num--sm">${sub.seats}</span>
                        </div>
                    `;
                    subList.appendChild(subRow);
                });

                row.addEventListener('click', () => {
                    const expanded = wrapper.classList.toggle('is-expanded');
                    row.setAttribute('aria-expanded', String(expanded));
                    row.querySelector('.epg-expand-arrow').textContent = expanded ? '▴' : '▾';
                });

                wrapper.appendChild(row);
                wrapper.appendChild(subList);
                table.appendChild(wrapper);
            } else {
                const row = document.createElement('div');
                row.className = 'epg-seat-row';
                row.innerHTML = `
                    <div class="epg-party-info">
                        ${e2026_makeLogoHtml(party.name)}
                        <div class="epg-party-name">${party.name}</div>
                    </div>
                    <div class="epg-seat-count">
                        <span class="epg-seat-num">${seatNum}</span>
                    </div>
                `;
                table.appendChild(row);
            }
        });

        card.appendChild(table);

        // Total
        const totalSeats = alliance.parties.reduce((sum, p) => sum + (p.seats || 0), 0);
        const showTotal = alliance.shortName !== 'Others';
        if (showTotal) {
            const total = document.createElement('div');
            total.className = 'epg-seat-total';
            total.innerHTML = `
                <span>Total Seats</span>
                <span style="color: ${alliance.color};">${totalSeats > 0 ? totalSeats : '—'}</span>
            `;
            card.appendChild(total);
        }

        (alliance.shortName === 'SPA' ? col1 : col2).appendChild(card);
    });

    alliancesDiv.appendChild(col1);
    alliancesDiv.appendChild(col2);
    container.appendChild(alliancesDiv);
}

function e2026_renderCandidates() {
    const container = document.getElementById('epg-tab-candidates');
    if (!container || typeof CANDIDATES_2026 === 'undefined') return;

    if (CANDIDATES_2026.length === 0) {
        container.innerHTML = '<div class="epg-coming-soon">Candidate list coming soon</div>';
        return;
    }

    // Build party → alliance lookup from ALLIANCES_2026
    const partyToAlliance = {};
    if (typeof ALLIANCES_2026 !== 'undefined') {
        ALLIANCES_2026.forEach(alliance => {
            alliance.parties.forEach(p => {
                partyToAlliance[p.name] = alliance;
                if (p.subParties) {
                    p.subParties.forEach(sp => {
                        if (!partyToAlliance[sp.name]) partyToAlliance[sp.name] = alliance;
                    });
                }
            });
        });
    }

    // Build star candidate name lookup (case-insensitive)
    const starNames = new Set();
    if (typeof STAR_CANDIDATES_2026 !== 'undefined') {
        STAR_CANDIDATES_2026.forEach(s => starNames.add(s.name.toLowerCase()));
    }

    // Group candidates: alliance → party → list
    const allianceOrder = [];
    const allianceMap = {};

    CANDIDATES_2026.forEach(c => {
        const alliance = partyToAlliance[c.party];
        const allianceName = alliance ? alliance.name : 'Others';

        if (!allianceMap[allianceName]) {
            allianceMap[allianceName] = {
                meta: alliance || { name: 'Others', shortName: 'Others', color: '#78909c' },
                parties: {}
            };
            allianceOrder.push(allianceName);
        }
        const parties = allianceMap[allianceName].parties;
        if (!parties[c.party]) parties[c.party] = [];
        parties[c.party].push(c);
    });

    const listHtml = allianceOrder.map(allianceName => {
        const { meta, parties } = allianceMap[allianceName];

        const partyAccordions = Object.entries(parties).map(([party, members]) => {
            const logo = typeof PartyConfig !== 'undefined' ? PartyConfig.getLogo(party) : null;
            const color = typeof PartyConfig !== 'undefined' ? PartyConfig.getColor(party) : '#78909c';
            const logoHtml = logo && !logo.includes('placeholder')
                ? `<img class="epg-accordion-logo" src="${logo}" alt="${party}" />`
                : `<span class="epg-accordion-logo-dot" style="background:${color};"></span>`;

            const rows = members.map(c => {
                const isStar = starNames.has(c.name.toLowerCase());
                return `
                <div class="epg-candidate-row" data-name="${c.name.toLowerCase()}" data-constituency="${c.constituency.toLowerCase()}">
                    ${isStar ? '<span class="epg-candidate-star" title="Star candidate">★</span>' : ''}
                    <span class="epg-candidate-name">${c.name}</span>
                    <span class="epg-candidate-constituency">${c.constituency}</span>
                </div>`;
            }).join('');

            return `
                <div class="epg-party-accordion">
                    <button class="epg-accordion-header" onclick="e2026_toggleAccordion(this)" aria-expanded="false">
                        ${logoHtml}
                        <span class="epg-accordion-party-name">${party}</span>
                        <span class="epg-accordion-count">${members.length}</span>
                        <span class="epg-accordion-chevron">▸</span>
                    </button>
                    <div class="epg-accordion-body" hidden>
                        <div class="epg-candidate-list">${rows}</div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="epg-alliance-section">
                <div class="epg-alliance-header" style="border-left-color:${meta.color};">
                    <span class="epg-alliance-name">${meta.name}</span>
                </div>
                <div class="epg-alliance-parties">${partyAccordions}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="epg-candidate-search-wrap">
            <input
                class="epg-candidate-search"
                type="search"
                placeholder="Search candidate or constituency…"
                oninput="e2026_searchCandidates(this.value)"
                autocomplete="off"
                spellcheck="false"
            />
        </div>
        <div class="epg-accordion-list">${listHtml}</div>
    `;
}

function e2026_searchCandidates(raw) {
    const query = raw.trim().toLowerCase();
    const container = document.getElementById('epg-tab-candidates');
    if (!container) return;

    const isSearching = query.length > 0;

    // 1. Filter individual rows
    container.querySelectorAll('.epg-candidate-row').forEach(row => {
        if (!isSearching) {
            row.classList.remove('epg-filtered-out');
        } else {
            const name = row.dataset.name || '';
            const constituency = row.dataset.constituency || '';
            row.classList.toggle('epg-filtered-out', !name.includes(query) && !constituency.includes(query));
        }
    });

    // 2. Show/hide party accordions; expand ones with matches
    container.querySelectorAll('.epg-party-accordion').forEach(accordion => {
        const btn = accordion.querySelector('.epg-accordion-header');
        const body = accordion.querySelector('.epg-accordion-body');
        if (!isSearching) {
            accordion.classList.remove('epg-filtered-out');
            if (btn && body) body.hidden = btn.getAttribute('aria-expanded') !== 'true';
        } else {
            const hasMatch = accordion.querySelectorAll('.epg-candidate-row:not(.epg-filtered-out)').length > 0;
            accordion.classList.toggle('epg-filtered-out', !hasMatch);
            if (body) body.hidden = !hasMatch;
            if (btn) btn.setAttribute('aria-expanded', hasMatch ? 'true' : 'false');
        }
    });

    // 3. Hide alliance sections with no visible parties
    container.querySelectorAll('.epg-alliance-section').forEach(section => {
        if (!isSearching) {
            section.classList.remove('epg-filtered-out');
        } else {
            const anyVisible = section.querySelectorAll('.epg-party-accordion:not(.epg-filtered-out)').length > 0;
            section.classList.toggle('epg-filtered-out', !anyVisible);
        }
    });
}

function e2026_toggleAccordion(btn) {
    const body = btn.nextElementSibling;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    body.hidden = expanded;
}

function e2026_renderStars() {
    const container = document.getElementById('epg-tab-stars');
    if (!container || typeof STAR_CANDIDATES_2026 === 'undefined') return;
    if (container.children.length > 0) return; // already rendered

    container.innerHTML = '';

    if (STAR_CANDIDATES_2026.length === 0) {
        container.innerHTML = '<div class="epg-coming-soon">Star picks coming soon</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'epg-stars-grid';

    STAR_CANDIDATES_2026.forEach((star, idx) => {
        const logo = PartyConfig.getLogo(star.party);
        const logoHtml = logo && !logo.includes('placeholder')
            ? `<img class="epg-star-logo" src="${logo}" alt="${star.party}" />`
            : '';
        const borderGradient = PartyConfig.getBorderGradient(star.party);
        const photoHtml = star.photo
            ? `<div class="epg-star-photo-wrap" style="background: ${borderGradient};">
                   <img class="epg-star-photo" src="${star.photo}" alt="${star.name}" onerror="this.parentElement.style.display='none'" />
               </div>`
            : '';

        const wrap = document.createElement('div');
        wrap.className = 'epg-star-card-wrap';

        const card = document.createElement('div');
        card.className = 'epg-star-card';
        card.innerHTML = `
            ${photoHtml}
            <div class="epg-star-info">
                <div class="epg-star-row epg-star-row-top">
                    <span class="epg-star-name">${star.name}</span>
                    <span class="epg-star-party-wrap">
                        ${logoHtml}
                        <span class="epg-star-party" style="background-color: ${star.partyColor}; color: ${PartyConfig.getTextColorForHex(star.partyColor)};">${star.party}</span>
                    </span>
                </div>
                <div class="epg-star-row epg-star-row-bottom">
                    <span class="epg-star-note">${star.note || ''}</span>
                    <span class="epg-star-constituency">${star.constituency}</span>
                </div>
            </div>
        `;

        const panel = document.createElement('div');
        panel.className = 'epg-star-chart-panel';

        if (!star.history || star.history.length === 0) {
            panel.innerHTML = `<p class="epg-star-no-history">Did not contest in the past 5 Tamil Nadu assembly elections</p>`;
        } else {
            panel.innerHTML = `<p class="epg-star-chart-label">Win/Loss margin % — Past elections</p><canvas class="epg-star-canvas"></canvas>`;
        }

        card.addEventListener('click', () => e2026_toggleStarCard(idx, card, panel));

        wrap.appendChild(card);
        wrap.appendChild(panel);
        grid.appendChild(wrap);
    });

    container.appendChild(grid);

    // Open Stalin's card (index 0) by default
    const firstCard  = grid.querySelectorAll('.epg-star-card')[0];
    const firstPanel = grid.querySelectorAll('.epg-star-chart-panel')[0];
    if (firstCard && firstPanel) {
        e2026_toggleStarCard(0, firstCard, firstPanel);
    }
}

function e2026_toggleStarCard(idx, card, panel) {
    const isOpen = idx === e2026_openStarIdx;

    // Close the currently open card if it's a different one
    if (e2026_openStarIdx !== null && !isOpen) {
        e2026_openStarCard.classList.remove('is-open');
        e2026_openStarPanel.classList.remove('is-open');
        if (e2026_openStarChart) { e2026_openStarChart.destroy(); e2026_openStarChart = null; }
        e2026_openStarIdx   = null;
        e2026_openStarCard  = null;
        e2026_openStarPanel = null;
    }

    if (isOpen) {
        // Collapse
        card.classList.remove('is-open');
        panel.classList.remove('is-open');
        if (e2026_openStarChart) { e2026_openStarChart.destroy(); e2026_openStarChart = null; }
        e2026_openStarIdx   = null;
        e2026_openStarCard  = null;
        e2026_openStarPanel = null;
    } else {
        // Expand
        card.classList.add('is-open');
        panel.classList.add('is-open');
        e2026_openStarIdx   = idx;
        e2026_openStarCard  = card;
        e2026_openStarPanel = panel;

        const canvas = panel.querySelector('.epg-star-canvas');
        if (canvas) {
            const star = STAR_CANDIDATES_2026[idx];
            e2026_openStarChart = e2026_renderStarChart(canvas, star);
        }
    }
}

function e2026_renderStarChart(canvas, star) {
    const style = getComputedStyle(document.documentElement);
    const mutedColor  = style.getPropertyValue('--color-text-muted').trim()  || '#9ca3af';
    const borderColor = style.getPropertyValue('--color-border').trim()       || 'rgba(255,255,255,0.1)';

    const YEARS  = [2021, 2016, 2011, 2006, 2001];
    const labels = YEARS.map(String);

    const yearMap = {};
    star.history.forEach(h => { yearMap[h.year] = h; });
    const dataPoints = YEARS.map(y => (yearMap[y] ? yearMap[y].margin : null));

    const WIN_COLOR  = '#4caf50';
    const LOSS_COLOR = '#e53935';
    const barColors = dataPoints.map(v => v === null ? 'transparent' : v >= 0 ? WIN_COLOR + 'cc' : LOSS_COLOR + 'cc');
    const barBorders = dataPoints.map(v => v === null ? 'transparent' : v >= 0 ? WIN_COLOR : LOSS_COLOR);

    // Inline plugin: draw margin % labels inside bars when there's room, outside otherwise
    const dataLabelsPlugin = {
        id: 'dataLabels',
        afterDatasetsDraw(chart) {
            const { ctx: c, scales: { y: yScale } } = chart;
            const meta  = chart.getDatasetMeta(0);
            const zeroY = yScale.getPixelForValue(0);
            const MIN_INSIDE = 22; // px — minimum bar height to fit label inside
            const PAD = 4;

            c.save();
            c.font = 'bold 9px system-ui, sans-serif';
            c.textAlign = 'center';

            meta.data.forEach((bar, i) => {
                const val = dataPoints[i];
                if (val === null) return;

                const isWin  = val >= 0;
                const barH   = Math.abs(bar.y - zeroY);
                const label  = (isWin ? '+' : '') + val + '%';
                const inside = barH >= MIN_INSIDE;

                c.fillStyle    = inside ? '#ffffff' : (isWin ? WIN_COLOR : LOSS_COLOR);
                c.textBaseline = (inside && isWin) ? 'top' : 'bottom';
                const rawTextY = inside ? (isWin ? bar.y + PAD : bar.y - PAD)
                                        : (isWin ? bar.y - PAD : zeroY - PAD);
                // Clamp so label never renders above the chart area (e.g. all-loss charts)
                const textY    = Math.max(chart.chartArea.top + 10, rawTextY);
                c.fillText(label, bar.x, textY);
            });

            c.restore();
        }
    };

    // Inline plugin: always draw a solid zero line regardless of tick positions
    const zeroLinePlugin = {
        id: 'zeroLine',
        afterDraw(chart) {
            const yScale = chart.scales.y;
            const xScale = chart.scales.x;
            if (yScale.min > 0 || yScale.max < 0) return;
            const zeroY = yScale.getPixelForValue(0);
            const ctx2  = chart.ctx;
            ctx2.save();
            ctx2.beginPath();
            ctx2.strokeStyle = mutedColor;
            ctx2.lineWidth   = 2;
            ctx2.moveTo(xScale.left, zeroY);
            ctx2.lineTo(xScale.right, zeroY);
            ctx2.stroke();
            ctx2.restore();
        }
    };

    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: dataPoints,
                backgroundColor: barColors,
                borderColor: barBorders,
                borderWidth: 1,
                borderRadius: 3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => {
                            if (item.raw === null) return 'Did not contest';
                            const entry = yearMap[parseInt(item.label, 10)];
                            const sign  = item.raw >= 0 ? '+' : '';
                            const lines = [`Margin: ${sign}${item.raw}%`];
                            if (entry && entry.note) lines.push(entry.note);
                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: mutedColor, font: { size: 10 } },
                    grid:  { color: borderColor },
                    border: { color: borderColor }
                },
                y: {
                    ticks: {
                        color: mutedColor,
                        font: { size: 10 },
                        callback: (v) => (v >= 0 ? '+' : '') + v + '%'
                    },
                    grid:  { color: borderColor },
                    border: { color: borderColor }
                }
            }
        },
        plugins: [dataLabelsPlugin, zeroLinePlugin]
    });
}

function e2026_initTabs() {
    const tabs = document.querySelectorAll('.epg-tab-btn');
    const panels = document.querySelectorAll('.epg-tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');

            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            const panel = document.getElementById(`epg-tab-${tabId}`);
            if (panel) {
                panel.classList.add('active');
                // Render on first activation
                if (tabId === 'alliances') e2026_renderAlliances();
                else if (tabId === 'candidates') e2026_renderCandidates();
                else if (tabId === 'stars') e2026_renderStars();
            }
        });
    });

    // Activate first tab
    if (tabs.length > 0) {
        tabs[0].click();
    }
}


/* ════════════════════════════════════════════════
   INIT — wire up after DOM ready
   ════════════════════════════════════════════════ */
(function e2026_init() {
    function setup() {
        const openBtn  = document.getElementById('elections-2026-btn');
        const closeBtn = document.getElementById('elections-modal-close');
        const modal    = document.getElementById('elections-modal');

        if (openBtn)  openBtn.addEventListener('click', e2026_openModal);
        if (closeBtn) closeBtn.addEventListener('click', e2026_closeModal);

        // Click backdrop to close
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) e2026_closeModal();
            });
        }


    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();
