#!/usr/bin/env python3
"""
Add name_ta (Tamil script) to every candidate in all election JSON files.
Uses phonetic transliteration for Tamil Nadu names.
"""

import json
import re
import sys

# ── Common Tamil politician name words ──────────────────────────────────
# Maps uppercase English word → Tamil script
WORD_LOOKUP = {
    # Titles / honorifics
    'DR': 'டாக்டர்', 'DR.': 'டாக்டர்', 'ADV': 'வழக்கறிஞர்',
    'THIRU': 'திரு', 'TMT': 'திருமதி', 'SELVI': 'செல்வி',
    # Very common surname/given name components
    'MURUGAN': 'முருகன்', 'MURUGESAN': 'முருகேசன்', 'MURUGANANTHAM': 'முருகானந்தம்',
    'PALANISWAMI': 'பழனிசாமி', 'PALANISAMY': 'பழனிசாமி', 'PALANI': 'பழனி',
    'GOVINDARAJAN': 'கோவிந்தராஜன்', 'GOVINDASAMY': 'கோவிந்தசாமி',
    'EDAPPADI': 'ஏடப்பாடி', 'STALIN': 'ஸ்டாலின்',
    'ANNAMALAI': 'அண்ணாமலை', 'ANNAMALAISAMY': 'அண்ணாமலைசாமி',
    'RAMALINGAM': 'இராமலிங்கம்', 'RAMASAMY': 'இராமசாமி', 'RAMAN': 'இராமன்',
    'RAJA': 'இராஜா', 'RAJENDRAN': 'இராஜேந்திரன்', 'RAJASEKAR': 'இராஜசேகர்',
    'RAJKUMAR': 'இராஜ்குமார்', 'RAJAGOPALAN': 'இராஜகோபாலன்',
    'SHANKAR': 'சங்கர்', 'SHANMUGAM': 'சண்முகம்', 'SHANMUGAVEL': 'சண்முகவேல்',
    'KUMAR': 'குமார்', 'KUMARAN': 'குமரன்', 'KUMARAVEL': 'குமரவேல்',
    'SELVAM': 'செல்வம்', 'SELVAN': 'செல்வன்', 'SELVAKUMAR': 'செல்வகுமார்',
    'KRISHNAN': 'கிருஷ்ணன்', 'KRISHNASAMY': 'கிருஷ்ணசாமி', 'KRISHNA': 'கிருஷ்ணா',
    'VENKATESH': 'வெங்கடேஷ்', 'VENKATARAMAN': 'வெங்கட்ராமன்', 'VENKATESAN': 'வெங்கடேசன்',
    'SURESH': 'சுரேஷ்', 'SURESHKUMAR': 'சுரேஷ்குமார்',
    'SATHYAMURTHY': 'சத்தியமூர்த்தி', 'SATHISH': 'சதீஷ்', 'SATHYANARAYANA': 'சத்தியநாராயணன்',
    'THANGAVEL': 'தங்கவேல்', 'THANGARAJ': 'தங்கராஜ்', 'THANGARAJAN': 'தங்கராஜன்',
    'MANOHARAN': 'மனோகரன்', 'MANOHAR': 'மனோகர்',
    'BABU': 'பாபு', 'BALASUBRAMANIAN': 'பாலசுப்பிரமணியன்', 'BALAMURUGAN': 'பாலமுருகன்',
    'SEKAR': 'சேகர்', 'SEKARAN': 'சேகரன்',
    'KATHIRVEL': 'கதிர்வேல்', 'KATHIRESAN': 'கதிரேசன்',
    'SUNDARAM': 'சுந்தரம்', 'SUNDARRAJAN': 'சுந்தர்ராஜன்', 'SUNDAR': 'சுந்தர்',
    'SIVAKUMAR': 'சிவகுமார்', 'SIVARAJ': 'சிவராஜ்', 'SIVAJI': 'சிவாஜி',
    'ARUMUGAM': 'அருமுகம்', 'ARJUNAN': 'அர்ஜுனன்', 'ARUN': 'அருண்',
    'ANAND': 'ஆனந்த்', 'ANANDAN': 'ஆனந்தன்',
    'PANDIAN': 'பாண்டியன்', 'PANDIYAN': 'பாண்டியன்',
    'MUTHUKUMAR': 'முத்துகுமார்', 'MUTHUVEL': 'முத்துவேல்', 'MUTHU': 'முத்து',
    'NAGENDRA': 'நகேந்திரா', 'NAGARAJAN': 'நாகராஜன்', 'NAGA': 'நாகா',
    'PERIYASAMY': 'பெரியசாமி', 'PERIYARAJ': 'பெரியராஜ்',
    'VIJAY': 'விஜய்', 'VIJAYAKUMAR': 'விஜயகுமார்', 'VIJAYAN': 'விஜயன்',
    'VELAYUTHAM': 'வேலாயுதம்', 'VELUSAMY': 'வேலுசாமி', 'VELU': 'வேலு',
    'KANDASAMY': 'கந்தசாமி', 'KANNAN': 'கண்ணன்', 'KANDAN': 'கந்தன்',
    'DURAI': 'துரை', 'DURAISAMY': 'துரைசாமி', 'DURAIPANDIAN': 'துரைபாண்டியன்',
    'PERUMAL': 'பெருமாள்', 'PERUMALSAMY': 'பெருமாள்சாமி',
    'MARIMUTHU': 'மாரிமுத்து', 'MANIVANNAN': 'மணிவண்ணன்', 'MANI': 'மணி',
    'PALANIVEL': 'பழனிவேல்', 'PALANIKUMAR': 'பழனிகுமார்',
    'ILANGOVAN': 'இளங்கோவன்', 'ILAVARASAN': 'இளவரசன்',
    'GANESAN': 'கணேசன்', 'GANESH': 'கணேஷ்',
    'JAYARAJ': 'ஜெயராஜ்', 'JAYAKUMAR': 'ஜெயகுமார்', 'JAYA': 'ஜெயா',
    'LOGESH': 'லோகேஷ்', 'LOGASAMY': 'லோகசாமி',
    'PRAKASH': 'பிரகாஷ்', 'PRABHU': 'பிரபு', 'PRABU': 'பிரபு',
    'RAMESH': 'ரமேஷ்', 'RAMACHANDRAN': 'இராமச்சந்திரன்',
    'SENTHIL': 'செந்தில்', 'SENTHILKUMAR': 'செந்தில்குமார்',
    'TAMILARASAN': 'தமிழரசன்', 'TAMILSELVAN': 'தமிழ்செல்வன்', 'TAMIL': 'தமிழ்',
    'UDAYAKUMAR': 'உதயகுமார்', 'UDHAYAKUMAR': 'உதயகுமார்',
    'VELMURUGAN': 'வேல்முருகன்', 'VELMURUGADOSS': 'வேல்முருகதாஸ்',
    'XAVIER': 'சேவியர்', 'YADAV': 'யாதவ்',
    'ARUNACHALAM': 'அருணாசலம்', 'ANNADHURAI': 'அண்ணாதுரை',
    'THIRUMAVALAVAN': 'திருமாவளவன்', 'THIRUMURTHY': 'திருமூர்த்தி',
    'JAYALALITHAA': 'ஜெயலலிதா', 'JAYALALITHA': 'ஜெயலலிதா',
    'KARUNANIDHI': 'கருணாநிதி',
    'ALAGIRI': 'அழகிரி', 'AZHAGIRI': 'அழகிரி',
    'KANIMOZHI': 'கனிமொழி', 'UDHAYANIDHI': 'உதயநிதி',
    'SEEMAN': 'சீமான்', 'VIJAYAKANTH': 'விஜயகாந்த்',
    'ANBUMANI': 'அன்புமணி', 'RAMADOSS': 'இராமதாஸ்',
    'VAIKO': 'வைகோ',
}

# ── Character-level phonetic fallback ──────────────────────────────────
# Processes digraphs/trigraphs first, then single chars
_PHONEME_PATTERNS = [
    # Common trigraphs
    ('THR', 'த்ர'), ('STH', 'ஸ்த'), ('KSH', 'க்ஷ'),
    # Digraphs
    ('TH', 'த'), ('SH', 'ஷ'), ('CH', 'ச'), ('GH', 'க'),
    ('KH', 'க'), ('DH', 'த'), ('BH', 'ப'), ('PH', 'ப'),
    ('NG', 'ங்'), ('NY', 'ஞ'), ('NH', 'ன'),
    ('AA', 'ஆ'), ('EE', 'ஈ'), ('OO', 'ஊ'),
    ('AI', 'ஐ'), ('AU', 'ஔ'), ('AE', 'ஏ'), ('OA', 'ஒ'),
    # Single consonants
    ('K', 'க'), ('G', 'க'), ('C', 'க'), ('J', 'ஜ'),
    ('T', 'ட'), ('D', 'ட'), ('N', 'ன'), ('P', 'ப'),
    ('B', 'ப'), ('M', 'ம'), ('Y', 'ய'), ('R', 'ர'),
    ('L', 'ல'), ('V', 'வ'), ('W', 'வ'), ('S', 'ஸ'),
    ('H', 'ஹ'), ('Z', 'ழ'), ('F', 'ப'), ('X', 'க்ஸ'),
    # Vowels
    ('A', 'அ'), ('E', 'எ'), ('I', 'இ'),
    ('O', 'ஒ'), ('U', 'உ'),
]

def _transliterate_word(word):
    """Phonetic transliterate a single UPPERCASE word to Tamil script."""
    s = word
    out = []
    i = 0
    while i < len(s):
        matched = False
        for eng, tam in _PHONEME_PATTERNS:
            if s[i:i+len(eng)] == eng:
                out.append(tam)
                i += len(eng)
                matched = True
                break
        if not matched:
            out.append(s[i])
            i += 1
    return ''.join(out)

def transliterate_name(name):
    """
    Convert an English candidate name to Tamil script.
    - Initials (single letters or letters with period) are kept as Latin + period.
    - Known Tamil political name words use the lookup table.
    - Unknown words use phonetic transliteration.
    """
    if not name:
        return name
    tokens = name.upper().split()
    result = []
    for token in tokens:
        # Strip trailing period for lookup
        bare = token.rstrip('.')
        has_period = token.endswith('.')
        # Single letter = initial — keep as-is (e.g. "T." stays "T.")
        if len(bare) == 1:
            result.append(token)
            continue
        if bare in WORD_LOOKUP:
            ta = WORD_LOOKUP[bare]
        else:
            ta = _transliterate_word(bare)
        result.append(ta + ('.' if has_period else ''))
    return ' '.join(result)

def enrich_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    count = 0
    for cid, constituency in data.get('constituencies', {}).items():
        for candidate in constituency.get('candidates', []):
            if 'name_ta' not in candidate:
                candidate['name_ta'] = transliterate_name(candidate.get('name', ''))
                count += 1
        # Also add name_ta to winner shortcut if present
        if 'winner' in constituency and isinstance(constituency['winner'], dict):
            if 'name_ta' not in constituency['winner']:
                constituency['winner']['name_ta'] = transliterate_name(
                    constituency['winner'].get('name', '')
                )
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'{path}: added name_ta to {count} candidates.')

if __name__ == '__main__':
    files = sys.argv[1:] or [
        'data/elections-2021.json',
        'data/elections-2016.json',
        'data/elections-2026.json',
    ]
    for f in files:
        enrich_file(f)
