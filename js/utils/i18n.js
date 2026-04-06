/**
 * i18n Module — Tamil/English language support
 * - I18n.t(key)         → translated string for current language
 * - I18n.getLang()      → 'en' | 'ta'
 * - I18n.setLang(lang)  → switch language, save to localStorage, fire langchange event
 * Fires: document CustomEvent 'langchange' with detail { lang }
 * Persists: localStorage key 'tn-map-lang'
 */
const I18n = (function () {
    const STORAGE_KEY = 'tn-map-lang';
    let _lang = 'en';

    const TRANSLATIONS = {
        en: {
            'filter.year':                  'Year',
            'filter.district':              'District',
            'filter.constituency':          'Constituency',
            'filter.candidate':             'Candidate Name',
            'filter.all_years':             'All Years',
            'filter.all_districts':         'All Districts',
            'filter.all_constituencies':    'All Constituencies',
            'filter.search_placeholder':    'Search candidate...',
            'btn.filters':                  'Filters',
            'btn.elections_2026':           'Elections 2026',
            'btn.overview':                 'Overview',
            'legend.title':                 'Winning Party',
            'loading.text':                 'Loading map data...',
            'overlay.registered_voters':    'Registered Voters',
            'overlay.constituency_id':      'Constituency ID',
            'overlay.election_history':     'Election History',
            'overlay.election_results':     'Election Results',
            'overlay.declared_candidates':  'Declared Candidates',
            'overlay.no_data':              'No data',
            'overlay.no_candidates':        'No candidates declared',
            'overlay.no_candidate_data':    'No candidate data available for this year',
            'overlay.error_loading':        'Error loading data',
            'badge.general':                'General',
            'badge.sc':                     'SC',
            'modal.tab_alliances':          'Alliances',
            'modal.tab_candidates':         'Candidates',
            'modal.tab_stars':              'Stars',
            'modal.polling_day':            'Polling Day \u2014 Apr 23',
            'countdown.d':                  'd',
            'countdown.h':                  'h',
            'countdown.m':                  'm',
            'countdown.s':                  's',
        },
        ta: {
            'filter.year':                  'ஆண்டு',
            'filter.district':              'மாவட்டம்',
            'filter.constituency':          'தொகுதி',
            'filter.candidate':             'வேட்பாளர் பெயர்',
            'filter.all_years':             'அனைத்து ஆண்டுகளும்',
            'filter.all_districts':         'அனைத்து மாவட்டங்களும்',
            'filter.all_constituencies':    'அனைத்து தொகுதிகளும்',
            'filter.search_placeholder':    'வேட்பாளரைத் தேடுக...',
            'btn.filters':                  'வடிகட்டிகள்',
            'btn.elections_2026':           'தேர்தல் 2026',
            'btn.overview':                 'கண்ணோட்டம்',
            'legend.title':                 'வெற்றிபெற்ற கட்சி',
            'loading.text':                 'வரைபட தரவை ஏற்றுகிறது...',
            'overlay.registered_voters':    'பதிவு செய்த வாக்காளர்கள்',
            'overlay.constituency_id':      'தொகுதி எண்',
            'overlay.election_history':     'தேர்தல் வரலாறு',
            'overlay.election_results':     'தேர்தல் முடிவுகள்',
            'overlay.declared_candidates':  'அறிவிக்கப்பட்ட வேட்பாளர்கள்',
            'overlay.no_data':              'தரவு இல்லை',
            'overlay.no_candidates':        'வேட்பாளர்கள் அறிவிக்கப்படவில்லை',
            'overlay.no_candidate_data':    'இந்த ஆண்டிற்கு வேட்பாளர் தரவு இல்லை',
            'overlay.error_loading':        'தரவு ஏற்றலில் பிழை',
            'badge.general':                'பொது',
            'badge.sc':                     'தாழ்த்தப்பட்டோர்',
            'modal.tab_alliances':          'கூட்டணிகள்',
            'modal.tab_candidates':         'வேட்பாளர்கள்',
            'modal.tab_stars':              'நட்சத்திரங்கள்',
            'modal.polling_day':            'வாக்குப்பதிவு நாள் \u2014 ஏப். 23',
            'countdown.d':                  'நா',
            'countdown.h':                  'ம',
            'countdown.m':                  'நி',
            'countdown.s':                  'வி',
        }
    };

    function t(key) {
        return (TRANSLATIONS[_lang] && TRANSLATIONS[_lang][key]) ||
               (TRANSLATIONS.en && TRANSLATIONS.en[key]) ||
               key;
    }

    function getLang() { return _lang; }

    function _updateToggleState() {
        document.querySelectorAll('#lang-toggle .lang-option').forEach(el => {
            el.classList.toggle('active', el.dataset.lang === _lang);
        });
        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.setAttribute('aria-label', _lang === 'en' ? 'Switch to Tamil' : 'Switch to English');
        }
    }

    function _applyToDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.getAttribute('data-i18n'));
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
        });
    }

    function setLang(lang) {
        if (lang !== 'en' && lang !== 'ta') return;
        _lang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        _applyToDOM();
        _updateToggleState();
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    }

    function _bindToggle() {
        const btn = document.getElementById('lang-toggle');
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            const opt = e.target.closest('.lang-option');
            setLang(opt ? opt.dataset.lang : (_lang === 'en' ? 'ta' : 'en'));
        });
        _updateToggleState();
    }

    // Init: read saved language, apply to DOM, bind toggle
    // Scripts load at bottom of <body>, so DOM is fully parsed here
    const saved = localStorage.getItem(STORAGE_KEY);
    _lang = saved === 'ta' ? 'ta' : 'en';
    _applyToDOM();
    _bindToggle();

    return { t, getLang, setLang };
})();
