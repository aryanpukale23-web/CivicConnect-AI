# -*- coding: utf-8 -*-
import re
from typing import Tuple, Optional

INTENTS = [
    'GARBAGE', 'BUS_TRANSPORT', 'WATER', 'ELECTRICITY',
    'EMERGENCY', 'HEALTHCARE', 'ROAD', 'STREET_LIGHT',
    'CIVIC_COMPLAINT', 'PUBLIC_SERVICE', 'ANNOUNCEMENT',
    'DOCUMENT_QUERY', 'PARK', 'EDUCATION', 'TAX', 'GENERAL_QUERY'
]

KNOWN_AREAS = [
    'Shivaji Nagar', 'Kothrud', 'Hadapsar', 'Viman Nagar',
    'Central Ward', 'Camp', 'Aundh', 'Baner', 'Deccan',
    'Kalyani Nagar', 'Wakad', 'Pimpri', 'Chinchwad',
    'Magarpatta', 'Hinjawadi', 'Koregaon Park', 'Pune Station'
]

INTENT_KEYWORDS = {
    'GARBAGE': [
        'garbage', 'trash', 'waste', 'kachra', 'kachara', 'safai', 'dustbin',
        'kooda', 'dry waste', 'wet waste', 'collection', 'pickup', 'swachhata',
        'solid waste', 'sanitation', 'sweeping', 'compactor', 'litter',
        'recycling', 'recycle', 'bin', 'segregate', 'segregation',
        'garbage van', 'garbage truck', 'waste pickup',
        'कचरा', 'उचलला', 'कचराकुंडी', 'स्वच्छता', 'गोळा', 'ओला', 'सुका',
        'कचरागाडी', 'सफाई', 'कूड़ा', 'कचरे', 'झाडलोट'
    ],
    'BUS_TRANSPORT': [
        'bus', 'transport', 'timing', 'route', 'stop', 'depot', 'travel',
        'ticket', 'pmpml', 'buses', 'schedule', 'frequency', 'pass',
        'commute', 'station', 'platform', 'bus timing', 'bus route',
        'bus stop', 'bus number', 'bus pass', 'bus schedule',
        'बस', 'वेळापत्रक', 'गाडी', 'बसस्थानक', 'प्रवास', 'मार्ग',
        'बसचा वेळ', 'बस थांबा', 'बस नंबर', 'पीएमपीएमएल',
        'बस का समय', 'बस कब आती है', 'किराया'
    ],
    'WATER': [
        'water', 'supply', 'leakage', 'pipeline', 'pani', 'paani', 'jal',
        'jalpurvatha', 'watercut', 'tap', 'pressure', 'tanker', 'borewell',
        'sewage', 'drain', 'drainage', 'sewerage', 'overflow', 'shortage',
        'water supply', 'water cut', 'no water', 'water tank',
        'water leak', 'water pipe', 'water bill',
        'जल', 'पाणी', 'पुरवठा', 'गळती', 'पाणीपुरवठा', 'नळ', 'टाकी',
        'नाली', 'गटार', 'पाणी नाही', 'टँकर', 'पाण्याची टंचाई',
        'पानी', 'नल', 'पानी की समस्या', 'पानी कब आएगा'
    ],
    'ELECTRICITY': [
        'electricity', 'power', 'powercut', 'outage', 'bijli', 'light',
        'current', 'feeder', 'voltage', 'load shedding', 'msedcl',
        'transformer', 'meter', 'bill', 'power cut', 'no power',
        'electricity bill', 'power outage', 'power failure',
        'विद्युत', 'वीज', 'महावितरण', 'लाईट', 'भार नियमन',
        'विजेची समस्या', 'वीज गेली', 'मीटर', 'वीज बिल',
        'बिजली', 'बिजली नहीं है', 'पावर कट', 'बिल'
    ],
    'EMERGENCY': [
        'emergency', 'helpline', 'police', 'fire', 'ambulance', 'sos',
        'disaster', 'women helpline', 'childline', 'cyber crime',
        'accident', 'flood', 'earthquake', 'panic', 'attack', 'danger',
        '100', '101', '108', '1091', '1098', '1077', '112',
        'emergency number', 'helpline number', 'fire brigade',
        'police number', 'ambulance number',
        'आपत्कालीन', 'मदत', 'पोलीस', 'रुग्णवाहिका', 'अग्निशामक',
        'संकट', 'धोका', 'आग', 'अपघात',
        'मदद', 'पुलिस', 'आपातकाल', 'खतरा'
    ],
    'HEALTHCARE': [
        'hospital', 'clinic', 'doctor', 'health', 'medical', 'dispensary',
        'dawakhana', 'aarogya', 'opd', 'casualty', 'blood bank',
        'ambulance', 'vaccination', 'immunization', 'medicine', 'pharmacy',
        'maternity', 'pediatric', 'icu', 'nearest hospital',
        'health center', 'blood donation', 'eye clinic',
        'औषध', 'दवाखाना', 'रुग्णालय', 'आरोग्य', 'हॉस्पिटल',
        'डॉक्टर', 'दवाई', 'टीकाकरण', 'रक्तबँक',
        'अस्पताल', 'इलाज', 'स्वास्थ्य'
    ],
    'ROAD': [
        'road', 'pothole', 'khadda', 'asphalt', 'footpath',
        'divider', 'rasta', 'pavement', 'highway', 'speed breaker',
        'zebra crossing', 'signal', 'traffic', 'bridge', 'flyover',
        'road repair', 'road damage', 'bad road', 'road condition',
        'रस्ता', 'खड्डा', 'रस्ते', 'खड्डे', 'पुल', 'फुटपाथ',
        'ट्रॅफिक', 'रस्त्याचे काम', 'डांबरीकरण',
        'सड़क', 'गड्ढा', 'रोड', 'ट्रैफिक'
    ],
    'STREET_LIGHT': [
        'street light', 'streetlight', 'lamp post', 'dark street', 'pole',
        'light not working', 'broken lamp', 'dim light', 'no light',
        'street lamp', 'path light', 'road light',
        'रस्त्यावरील दिवा', 'स्ट्रीट लाइट', 'पथदिवे', 'दिवा',
        'दिवे नाहीत', 'अंधार',
        'बत्ती नहीं है', 'अँधेरा'
    ],
    'CIVIC_COMPLAINT': [
        'complaint', 'report', 'grievance', 'file', 'status', 'track',
        'shikayat', 'takrar', 'complain', 'register', 'application',
        'lodge complaint', 'submit complaint', 'complaint number',
        'complaint status', 'my complaint',
        'तक्रार', 'नोंदवा', 'शिकायात', 'अर्ज', 'तक्रार करा',
        'शिकायत', 'दर्ज', 'आवेदन'
    ],
    'PUBLIC_SERVICE': [
        'service', 'ward office', 'municipality', 'corporation',
        'certificate', 'birth', 'death', 'trade license', 'license',
        'nagar nigam', 'pmc', 'registration', 'noc', 'permission',
        'ward', 'zone office', 'municipal', 'civic service',
        'pmc office', 'ward officer',
        'महानगरपालिका', 'सेवा', 'कार्यालय', 'दाखला', 'जन्म',
        'मृत्यू', 'प्रमाणपत्र', 'परवाना',
        'नगर पालिका', 'प्रमाण पत्र', 'जन्म प्रमाण', 'मृत्यु प्रमाण'
    ],
    'ANNOUNCEMENT': [
        'announcement', 'notice', 'circular', 'news', 'update', 'alert',
        'notification', 'suchna', 'jahirat', 'what is new', 'latest news',
        'latest announcement', 'new notice', 'recent news',
        'new update', 'community notice',
        'जाहिरात', 'सूचना', 'परिपत्रक', 'नवे', 'ताज्या बातम्या',
        'घोषणा', 'अलर्ट', 'खबर'
    ],
    'DOCUMENT_QUERY': [
        'document', 'pdf', 'notice paper', 'guidelines', 'circular pdf',
        'attachment', 'rule', 'regulation', 'bylaw', 'act', 'policy',
        'official document', 'government circular', 'gazette',
        'दस्तावेज', 'कागदपत्रे', 'नियम', 'उपविधी', 'धोरण',
        'दस्तावेज़', 'कागज़', 'नियमावली'
    ],
    'PARK': [
        'park', 'garden', 'udyan', 'playground', 'maidan', 'open space',
        'tree', 'greenery', 'bench', 'fountain', 'recreation',
        'jogging', 'walking', 'children play', 'park timings',
        'public garden', 'municipal garden', 'park near me',
        'बगीचा', 'उद्यान', 'मैदान', 'झाड', 'हिरवाई',
        'पार्क', 'खेल का मैदान', 'हरियाली'
    ],
    'EDUCATION': [
        'school', 'college', 'university', 'education', 'shikshan',
        'scholarship', 'exam', 'admission', 'student', 'fee',
        'shala', 'vidyalaya', 'library', 'tuition', 'study',
        'municipal school', 'zp school', 'free education',
        'शाळा', 'शिक्षण', 'विद्यालय', 'शिष्यवृत्ती', 'परीक्षा',
        'स्कूल', 'पढ़ाई', 'शिक्षा', 'छात्रवृत्ति'
    ],
    'TAX': [
        'tax', 'property tax', 'gst', 'payment', 'dues', 'challan',
        'receipt', 'online payment', 'assessment', 'penalty',
        'pay tax', 'tax payment', 'house tax', 'property bill',
        'tax due', 'outstanding dues', 'tax receipt',
        'कर', 'मालमत्ता कर', 'जुर्माना', 'पावती', 'थकबाकी',
        'संपत्ति कर', 'भुगतान', 'बकाया', 'रसीद'
    ],
}

def detect_intent(query: str) -> Tuple[str, Optional[str]]:
    query_clean = query.strip()
    query_lower = query_clean.lower()

    detected_area = None
    for area in KNOWN_AREAS:
        if area.lower() in query_lower:
            detected_area = area
            break

    if any(k in query_lower for k in [
        'how do i report', 'how can i report', 'how to report', 'how to complain', 'file a complaint',
        'report a problem', 'report issue', 'lodge a complaint',
        'तक्रार कशी करावी', 'शिकायत कैसे करें'
    ]):
        if any(w in query_lower for w in ['pothole', 'road', 'khadda', 'खड्डा', 'रस्ता', 'गड्ढा']):
            return 'ROAD', detected_area
        if any(w in query_lower for w in ['street light', 'streetlight', 'lamp', 'दिवा', 'पथदिवे']):
            return 'STREET_LIGHT', detected_area
        if any(w in query_lower for w in ['water', 'pani', 'leakage', 'पाणी', 'जल', 'पानी']):
            return 'WATER', detected_area
        if any(w in query_lower for w in ['garbage', 'kachra', 'waste', 'कचरा', 'कूड़ा']):
            return 'GARBAGE', detected_area
        return 'CIVIC_COMPLAINT', detected_area

    scores = {}
    for intent, terms in INTENT_KEYWORDS.items():
        score = 0
        for term in terms:
            term_lower = term.lower()
            if not term_lower.isascii() or ' ' in term_lower:
                if term_lower in query_lower:
                    score += 3
            else:
                pattern = r'' + re.escape(term_lower) + r''
                if re.search(pattern, query_lower):
                    score += 2
        if score > 0:
            scores[intent] = score

    if scores:
        best_intent = max(scores, key=scores.get)
        return best_intent, detected_area

    if any(w in query_lower for w in ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'help', 'who are you', 'नमस्कार', 'नमस्ते', 'हेलो']):
        return 'GENERAL_QUERY', detected_area

    return 'GENERAL_QUERY', detected_area

