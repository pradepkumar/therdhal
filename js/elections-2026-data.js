/* ════════════════════════════════════════════════
   TN 2026 ELECTIONS — DATA
   All evolving content (alliances, candidates, news, stars)
   Update this file when data changes — layout logic remains stable
   ════════════════════════════════════════════════ */

/* ── ALLIANCES & SEAT ALLOCATIONS ── */
const ALLIANCES_2026 = [
    {
        name: 'Secular Progressive Alliance (SPA)',
        shortName: 'SPA',
        color: '#e53935',
        parties: [
            { name: 'DMK',    seats: 175, logo: 'assets/logos/DMK.png', subParties: [
                { name: 'DMK',  seats: 164 },
                { name: 'MDMK', seats: 3 },
                { name: 'MMK',  seats: 2 },
                { name: 'KMDK', seats: 2 },
                { name: 'MKP',  seats: 1 },
                { name: 'SDPI', seats: 1 },
                { name: 'MJK',  seats: 1 },
                { name: 'TDK',  seats: 1 },
            ]},
            { name: 'INC',    seats: 28,  logo: 'assets/logos/INC.svg' },
            { name: 'DMDK',   seats: 10,  logo: 'assets/logos/DMDK.png' },
            { name: 'VCK',    seats: 8,   logo: 'assets/logos/VCK.png' },
            { name: 'CPI(M)', seats: 5,   logo: 'assets/logos/CPIM.png' },
            { name: 'CPI',    seats: 5,   logo: 'assets/logos/CPI.png' },
            { name: 'MDMK',   seats: 1 },
            { name: 'IUML',   seats: 2 },
        ]
    },
    {
        name: 'AIADMK-led Alliance',
        shortName: 'AIADMK',
        color: '#4caf50',
        parties: [
            { name: 'AIADMK', seats: 172, logo: 'assets/logos/AIADMK.svg', subParties: [
                { name: 'AIADMK', seats: 166 },
                { name: 'IJK',    seats: 2 },
                { name: 'PBK',    seats: 1 },
                { name: 'PNK',    seats: 1 },
                { name: 'STMK',   seats: 1 },
                { name: 'TMBSP',  seats: 1 },
            ]},
            { name: 'BJP',    seats: 33,  logo: 'assets/logos/BJP.svg', subParties: [
                { name: 'BJP',  seats: 25 },
                { name: 'TMC',  seats: 5 },
                { name: 'PNK',  seats: 1 },
                { name: 'TMMK', seats: 1 },
                { name: 'SIFC', seats: 1 },
            ]},
            { name: 'PMK',    seats: 18,  logo: 'assets/logos/PMK.jpg' },
            { name: 'AMMK',   seats: 11 },
        ]
    },
    {
        name: 'No Alliance',
        shortName: 'Others',
        color: '#78909c',
        parties: [
            { name: 'NTK', seats: 234, logo: 'assets/logos/NTK.png' },
            { name: 'TVK', seats: 234 },
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
        logoUrl: 'assets/logos/VCK.png',
        date: 'Mar 13, 2026',
        title: 'VCK Demands Key Constituencies from DMK',
        description: 'Alliance partner seeks favorable seat distribution for SC/ST strongholds',
        url: 'https://www.thehindu.com',
        source: 'Dinamalar'
    },
    {
        party: 'CPI(M)',
        logoUrl: 'assets/logos/CPIM.png',
        date: 'Mar 12, 2026',
        title: 'CPI(M) to Contest 8-10 Seats',
        description: 'INDIA bloc ally announces contest strategy for 2026 assembly elections',
        url: 'https://www.thehindu.com',
        source: 'Eenadu'
    }
];
