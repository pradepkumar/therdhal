/* ════════════════════════════════════════════════
   TN 2026 ELECTIONS — DATA
   All evolving content (alliances, candidates, news, stars)
   Update this file when data changes — layout logic remains stable
   ════════════════════════════════════════════════ */

/* ── ALLIANCES & SEAT ALLOCATIONS ── */
const ALLIANCES_2026 = [
    {
        name: 'INDIA Bloc (DMK-led)',
        shortName: 'INDIA',
        color: '#e53935',
        parties: [
            { name: 'DMK', seats: null, status: 'tba' },
            { name: 'INC', seats: null, status: 'tba' },
            { name: 'VCK', seats: null, status: 'tba' },
            { name: 'IUML', seats: null, status: 'tba' },
            { name: 'CPI(M)', seats: null, status: 'tba' },
            { name: 'CPI', seats: null, status: 'tba' },
        ]
    },
    {
        name: 'NDA (AIADMK + BJP)',
        shortName: 'NDA',
        color: '#4caf50',
        parties: [
            { name: 'AIADMK', seats: null, status: 'tba' },
            { name: 'BJP', seats: null, status: 'tba' },
            { name: 'PMK', seats: null, status: 'tba' },
        ]
    }
];

/* ── CANDIDATES LIST ── */
const CANDIDATES_2026 = [
    // Format: { party, name, constituency, status: 'confirmed'|'expected'|'tba' }
    // Placeholder — will be populated as candidate lists are announced
    // Example structure:
    // { party: 'DMK', name: 'Name', constituency: 'Chennai Central', status: 'tba' }
];

/* ── STAR CANDIDATES ── */
const STAR_CANDIDATES_2026 = [
    // Format: { name, party, partyColor, constituency, note, status }
    // Placeholder — will be populated as notable candidates are announced
    // Example:
    // { name: 'Candidate', party: 'DMK', partyColor: '#e53935', constituency: 'Chennai Central', note: 'Party leader', status: 'tba' }
];

/* ── NEWS ITEMS ── */
const NEWS_ITEMS_2026 = [
    {
        tag: 'update',
        tagLabel: '🔴 Update',
        date: 'Mar 15, 2026',
        title: 'Election Schedule Announced',
        body: 'EC announces full election schedule for TN 2026 with polling on April 23 and results on May 4.'
    },
    {
        tag: 'mcc',
        tagLabel: '⚖️ MCC',
        date: 'Mar 15, 2026',
        title: 'Model Code of Conduct Active',
        body: 'Model Code of Conduct comes into force. All campaigns and announcements must adhere to EC guidelines.'
    },
    {
        tag: 'alliance',
        tagLabel: '🤝 Alliance',
        date: 'Mar 2026',
        title: 'INDIA Bloc — DMK-Led Front',
        body: 'DMK-led INDIA bloc alliance partners announced, working towards majority coalition in state.'
    },
    {
        tag: 'alliance',
        tagLabel: '🤝 Alliance',
        date: 'Mar 2026',
        title: 'NDA — AIADMK & BJP',
        body: 'AIADMK and BJP form official NDA alliance for the 2026 elections with seat-sharing agreement.'
    },
    {
        tag: 'candidate',
        tagLabel: '🟢 Candidates',
        date: 'Mar 2026',
        title: 'Candidate Lists Pending',
        body: 'Major parties expected to announce their candidate lists in early April ahead of nomination deadline on April 6.'
    }
];

/* ── EXTERNAL NEWS LINKS ── */
/* Party discussions, seat allocations, key political developments */
const NEWS_EXTERNAL_2026 = [
    {
        party: 'DMK',
        logoUrl: 'assets/logos/DMK.png',
        date: 'Mar 16, 2026',
        title: 'DMK-Congress Seat Talks Begin',
        description: 'INDIA bloc partners start seat allocation discussions for 234 constituencies',
        url: 'https://www.thehindu.com',
        source: 'The Hindu'
    },
    {
        party: 'AIADMK',
        logoUrl: 'assets/logos/AIADMK.svg',
        date: 'Mar 15, 2026',
        title: 'AIADMK-BJP Alliance Finalizes Seat Share',
        description: 'NDA partners announce 50-50 arrangement for key constituencies',
        url: 'https://www.thehindu.com',
        source: 'Tamil Nadu Today'
    },
    {
        party: 'PMK',
        logoUrl: 'assets/logos/PMK.jpg',
        date: 'Mar 14, 2026',
        title: 'PMK Eyes More Seats from NDA',
        description: 'Smaller ally pushes for increased constituency allocation',
        url: 'https://www.thehindu.com',
        source: 'Maalai Malar'
    },
    {
        party: 'VCK',
        logoUrl: 'assets/logos/placeholder.svg',
        date: 'Mar 13, 2026',
        title: 'VCK Demands Key Constituencies from DMK',
        description: 'Alliance partner seeks favorable seat distribution for SC/ST strongholds',
        url: 'https://www.thehindu.com',
        source: 'Dinamalar'
    },
    {
        party: 'CPI(M)',
        logoUrl: 'assets/logos/placeholder.svg',
        date: 'Mar 12, 2026',
        title: 'CPI(M) to Contest 8-10 Seats',
        description: 'INDIA bloc ally announces contest strategy for 2026 assembly elections',
        url: 'https://www.thehindu.com',
        source: 'Eenadu'
    }
];
