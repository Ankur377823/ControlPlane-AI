"""
Bias & Toxic Content Evaluator for ControlPlane AI

Evaluates model inputs and outputs for toxic, discriminatory, or harmful content:
- Hate Speech & Severe Harassment
- Toxic / Violent Content & Self-Harm
- Cyberattack & Exploit Generation Attempts
- System Resource Abuse Instructions
"""

from __future__ import annotations

import re
from typing import Dict, Any, List

_SAFETY_PATTERNS = [
    # 1. Cyberattacks, Malware & Exploitation
    ("cyberattack_malware", re.compile(r"\b(?:create|generate|write|code|develop)\s+(?:a\s+)?(?:ransomware|keylogger|trojan|rootkit|exploit\s+payload|ddos\s+script|reverse\s+shell|zero-day|c2\s+beacon|wiper\s+malware|spyware)\b", re.IGNORECASE)),
    ("vulnerability_exploit", re.compile(r"\b(?:sql\s+injection\s+payload|xss\s+payload|bypass\s+waf|crack\s+password\s+hash|buffer\s+overflow\s+exploit|privilege\s+escalation\s+script|credential\s+stuffing|mitm\s+attack)\b", re.IGNORECASE)),
    
    # 2. Destructive Operations & Database/Record Tampering
    ("destructive_data_tampering", re.compile(r"\b(?:delete|drop|purge|truncate|wipe|erase|destroy|remove)\s+(?:all\s+)?(?:customer|user|patient|employee|financial|loan|dispute|account|billing|audit|database|table|records?|transactions?)\b", re.IGNORECASE)),
    ("unauthorized_system_command", re.compile(r"\b(?:drop\s+table|truncate\s+table|delete\s+from\s+[a-zA-Z0-9_]+|rm\s+-rf\s+[\/\*]|format\s+c:|destroy\s+database|wipe\s+hard\s+drive)\b", re.IGNORECASE)),

    # 3. Weapons, CBRN & Extreme Physical Threats
    ("weapons_cbrn_threats", re.compile(r"\b(?:how\s+to\s+(?:make|build|synthesize|manufacture|assemble)\s+(?:a\s+)?(?:bomb|pipe\s+bomb|ied|molotov|poison|ricin|anthrax|sarin|nerve\s+agent|explosive|dirty\s+bomb|biological\s+weapon))\b", re.IGNORECASE)),

    # 4. Severe Toxicity, Self-Harm & Violence
    ("severe_toxicity", re.compile(r"\b(?:kill\s+yourself|commit\s+suicide|self[\s-]harm|how\s+to\s+hang\s+myself|ways\s+to\s+end\s+my\s+life|assassinate|hire\s+a\s+hitman)\b", re.IGNORECASE)),
    
    # 5. Hate Speech, Religious & Ethnic Intolerance
    ("hate_speech", re.compile(r"\b(?:subhuman\s+race|ethnic\s+cleansing|white\s+supremacy|racial\s+slur|inferior\s+gender|death\s+to\s+(?:all\s+)?(?:jews|muslims|christians|hindus|blacks|whites|asians|immigrants)|caste\s+supremacy)\b", re.IGNORECASE)),

    # 6. Financial Fraud, Market Manipulation & Social Engineering
    ("financial_fraud", re.compile(r"\b(?:(?:how\s+to\s+)?(?:clone\s+credit\s+cards|forge\s+identity\s+documents|create\s+fake\s+kyc|commit\s+wire\s+fraud|launder\s+money|generate\s+stolen\s+bank\s+accounts|spoof\s+caller\s+id\s+for\s+banking|skim\s+atm\s+cards|bypass\s+anti[-\s]?fraud\s+filters|generate\s+fake\s+paystubs\s+for\s+loans))\b", re.IGNORECASE)),
    ("market_manipulation", re.compile(r"\b(?:(?:how\s+to\s+)?(?:execute|coordinate)\s+(?:a\s+)?(?:pump\s+and\s+dump|stock\s+spoofing\s+order|wash\s+trading|market\s+manipulation\s+scheme)|(?:insider\s+trading\s+tips|trade\s+on\s+material\s+non[-\s]?public\s+information|mnpi\s+leak))\b", re.IGNORECASE)),
    ("money_laundering_structuring", re.compile(r"\b(?:(?:structure|structuring)\s+cash\s+deposits?|smurfing\s+cash|avoid\s+ctr\s+reporting|evade\s+fincen\s+reporting|launder\s+illicit\s+crypto|tornado\s+cash\s+layering|structure\s+deposits?\s+to\s+avoid\s+ctr)\b", re.IGNORECASE)),
    # 7. Pediatric Overdose, Toxic Ingestion & Dangerous Home Remedies (Physical Harm Risk)
    ("dangerous_ingestion_poisoning", re.compile(r"\b(?:(?:swallowed|ingested|consumed|drank)\s+(?:a\s+)?(?:handful\s+of\s+)?(?:pills|ibuprofen|tylenol|aspirin|medication|bleach|chemicals|batter(?:y|ies)|detergent|poison)|(?:home\s+remedy|substitute)\s+(?:using|with)\s+(?:bleach|ammonia|chemicals|detergent)|(?:using|give\s+me)\s+(?:a\s+)?(?:home\s+remedy\s+using\s+)?(?:bleach|ammonia|baking\s+soda\s+and\s+bleach)\s+to\s+induce\s+vomiting|(?:instead\s+of\s+calling\s+)?(?:poison\s+control|911|emergency)\b.*?\b(?:home\s+remedy|bleach|induce\s+vomiting))\b", re.IGNORECASE)),
    ("pediatric_narcotic_and_dosage_risk", re.compile(r"\b(?:(?:maximum|safe|recommended|lethal|toxic|prescribe|calculate)\s+(?:amount|dosage|dose)\s+(?:of\s+)?[a-zA-Z0-9_\-\s]{2,30}\s+(?:for|to\s+give)\s+(?:my\s+)?(?:\d+[-\s]?(?:year|month|week|day)[-\s]?old|child|toddler|infant|baby)|(?:combine|combining|mixing)\s+(?:it\s+with\s+)?(?:adult\s+)?(?:codeine|opioids?|narcotics?|sedatives?|cough\s+syrup|sleeping\s+pills?|aspirin)\b.*?\b(?:to\s+(?:help\s+them\s+)?sleep|child|toddler|infant|\d+[-\s]?year[-\s]?old)|(?:give|giving)\s+(?:my\s+)?(?:\d+[-\s]?(?:year|month)[-\s]?old|child|toddler|infant)\s+(?:adult\s+)?(?:codeine|morphine|fentanyl|xanax|sedatives?))\b", re.IGNORECASE)),
    ("unregulated_medical_dosage_advice", re.compile(r"\b(?:(?:what\s+is\s+the\s+)?(?:safe\s+)?(?:pediatric|infant|child|toddler|baby|neonatal)\s+(?:dosage|dose|amount|mg\/kg)\s+for|(?:safe|recommended|lethal|toxic|maximum)\s+(?:dosage|dose)\s+for\s+(?:a\s+)?\d+[-\s]?(?:year|month|week|day)[-\s]?old|(?:calculate|prescribe|recommend|administer)\s+(?:pediatric|infant)\s+(?:dosage|dose|medication|syrup)|(?:combine|combining|mixing)\s+(?:high[-\s]?dose\s+)?aspirin\s+for\s+(?:a\s+)?(?:child|pediatric|infant|\d+[-\s]?year[-\s]?old)|(?:prescribe|calculate\s+dose|safe\s+dose|lethal\s+dose|fatal\s+dose|overdose)\s+(?:of|for)\s+(?:controlled\s+substances?|prescription\s+drugs?|opioids?|narcotics?|pediatric\s+patients?|fentanyl|morphine|oxycodone|adderall|xanax|insulin|potassium\s+chloride))\b", re.IGNORECASE)),
    ("dangerous_drug_interaction", re.compile(r"\b(?:(?:how\s+to\s+fake|forge|counterfeit)\s+(?:a\s+)?(?:doctor(?:'s)?\s+)?(?:prescription|rx\s+pad|medical\s+certificate)|(?:is\s+it\s+safe\s+to\s+mix|dangerous\s+combination\s+of)\s+(?:maois|ssris|sedatives|opioids|alcohol\s+and\s+benzos))\b", re.IGNORECASE)),

    # 8. Unauthorized Healthcare PHI & Patient List Exfiltration (HIPAA)
    ("unauthorized_phi_harvesting", re.compile(r"\b(?:(?:generate|extract|dump|export|list|compile)\s+(?:a\s+)?list\s+(?:of\s+)?(?:all\s+)?(?:patients?|medical\s+records?|health\s+records?|clinical\s+data|hospital\s+patients?|echocardiograms?|medicare\s+numbers?)|(?:patients?\s+in\s+the\s+(?:cardiology|oncology|icu|pediatric|hospital)\s+ward))\b", re.IGNORECASE)),
]

BIAS_KEYWORDS = {
    "hate_speech": ["hate", "racist", "sexist", "bigot", "discriminate", "racial stereotyping", "casteist", "xenophobic"],
    "toxicity": ["violent", "attack", "kill", "harm", "abuse", "terrorist", "harass", "threaten"],
    "bias": ["inferior race", "gender inferior", "racial stereotyping", "unqualified gender", "ageist discrimination", "religious bias"],
    "fraud": ["money laundering", "credit card fraud", "identity theft", "fake passport", "fake kyc", "prescription fraud", "pump and dump", "insider trading", "smurfing", "wallet drainer", "invoice fraud"],
    "medical_dosage_risk": ["pediatric dosage", "infant dose", "aspirin for 4-year-old", "calculate safe dose for child", "unregulated medical advice", "lethal dose of", "overdose threshold", "fake rx pad"],
}


def scan_bias_and_toxicity(text: str, competitors: Optional[List[str]] = None) -> Dict[str, Any]:
    if not text or not isinstance(text, str):
        return {
            "has_bias": False,
            "has_competitor": False,
            "detected_types": [],
            "risk_findings": [],
            "confidence_score": 1.0
        }

    lower_text = text.lower()
    detected_types: List[str] = []
    risk_findings: List[Dict[str, Any]] = []
    has_competitor = False

    # 1. Advanced Regex Threat Scans
    for cat_name, pattern in _SAFETY_PATTERNS:
        match = pattern.search(text)
        if match:
            if cat_name not in detected_types:
                detected_types.append(cat_name)
            risk_findings.append({
                "category": "bias_safety",
                "severity": "CRITICAL" if any(k in cat_name for k in ("malware", "toxicity", "tampering", "command", "cbrn", "threats", "fraud")) else "HIGH",
                "rule": f"Safety Policy Violation ({cat_name.replace('_', ' ').title()})",
                "description": f"Dangerous or malicious pattern matched: '{match.group(0)}'",
                "snippet": match.group(0)
            })

    # 2. Keyword Biases & Moderation Triggers
    for category, keywords in BIAS_KEYWORDS.items():
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", lower_text):
                if category not in detected_types:
                    detected_types.append(category)
                risk_findings.append({
                    "category": "bias_safety",
                    "severity": "HIGH" if category == "hate_speech" else "MEDIUM",
                    "rule": f"Bias / Toxic Content Flagged ({category})",
                    "description": f"Text contains potential {category} term: '{kw}'",
                    "snippet": kw
                })

    # 3. Competitor Brand Mentions
    if competitors:
        for comp in competitors:
            comp_clean = comp.strip()
            if comp_clean and re.search(r"\b" + re.escape(comp_clean.lower()) + r"\b", lower_text):
                has_competitor = True
                if "competitor_mention" not in detected_types:
                    detected_types.append("competitor_mention")
                risk_findings.append({
                    "category": "competitor",
                    "severity": "MEDIUM",
                    "rule": "Competitor Brand Mention",
                    "description": f"Text references competitor brand/product: '{comp_clean}'",
                    "snippet": comp_clean
                })

    return {
        "has_bias": len(detected_types) > 0,
        "has_competitor": has_competitor,
        "detected_types": detected_types,
        "risk_findings": risk_findings,
        "confidence_score": 0.3 if any(f["severity"] == "CRITICAL" for f in risk_findings) else (0.5 if detected_types else 1.0)
    }
