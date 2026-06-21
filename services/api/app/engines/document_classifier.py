import re


KEYWORDS = {
    "financials": ["revenue", "expenses", "burn", "cash", "runway", "gross margin", "arr", "mrr"],
    "cap_table": ["ownership", "shares", "safe", "option pool", "preferred", "common"],
    "headcount": ["employee", "contractor", "role", "ip assignment", "monthly cost"],
    "customer_pipeline": ["customer", "pipeline", "contract value", "probability", "expected close"],
    "compliance": ["boi", "409a", "insurance", "state qualification", "filing"],
    "pitch_deck": ["market", "problem", "solution", "traction", "seed", "raise"],
    "investor_meeting": ["investor asked", "question", "follow up", "diligence"],
    "investor_update": ["investor update", "monthly revenue", "growth", "runway"],
    "use_of_funds": ["use of funds", "budget allocation", "hiring plan", "funding plan"],
    "security": ["soc 2", "security controls", "penetration test", "security audit"],
    "privacy_security": ["hipaa", "privacy", "phi", "security documentation", "data processing"],
    "investor_process": ["investor pipeline", "fundraising process", "meeting cadence", "investor follow-up"],
    "runway_warning": ["runway warning", "cash constraint", "bridge financing", "cost reduction"],
}

# Real-world vocabulary expansion. Each entry maps a CANONICAL keyword (from KEYWORDS above)
# to additional surface forms that count as that same canonical signal. This broadens what the
# classifier recognizes in real documents WITHOUT changing the confidence denominator
# (`possible = len(KEYWORDS[category])`) or any evidence-quality threshold — recognition only.
KEYWORD_SYNONYMS = {
    # financials
    "revenue": ["sales", "topline", "top line", "net revenue", "total revenue", "income"],
    "expenses": ["operating expenses", "opex", "costs", "cost of goods"],
    "burn": ["burn rate", "net burn", "cash burn"],
    "cash": ["cash balance", "cash on hand", "bank balance"],
    "runway": ["months of runway", "cash runway"],
    "gross margin": ["gross profit margin", "gm"],
    "arr": ["annual recurring revenue"],
    "mrr": ["monthly recurring revenue"],
    # cap_table
    "ownership": ["ownership percentage", "equity stake", "ownership stake"],
    "shares": ["share count", "number of shares", "equity shares"],
    "safe": ["simple agreement for future equity", "convertible note", "convertible instrument"],
    "option pool": ["employee option pool", "esop", "stock option pool"],
    "preferred": ["preferred stock", "preferred shares"],
    "common": ["common stock", "common shares"],
    # headcount
    "employee": ["full-time", "fte", "team member"],
    "contractor": ["consultant", "freelancer", "1099"],
    "role": ["title", "position", "job title"],
    "ip assignment": ["ip assignment agreement", "invention assignment", "pia"],
    "monthly cost": ["monthly salary", "monthly comp", "monthly compensation"],
    # customer_pipeline
    "customer": ["account", "client"],
    "pipeline": ["sales pipeline", "deal pipeline"],
    "contract value": ["acv", "annual contract value", "deal value", "tcv"],
    "probability": ["win probability", "close probability", "likelihood to close"],
    "expected close": ["expected close date", "close date", "projected close"],
    # compliance (avoid surface forms that collide with adversarial fixtures)
    "boi": ["beneficial ownership", "boi report"],
    "409a": ["section 409a", "409-a valuation"],
    "insurance": ["liability insurance", "general liability", "d&o insurance"],
    "state qualification": ["foreign qualification", "state registration", "good standing"],
    "filing": ["annual report filing", "statement of information", "secretary of state filing"],
    # pitch_deck
    "market": ["market size", "tam", "addressable market"],
    "problem": ["pain point", "problem statement"],
    "solution": ["value proposition", "our approach"],
    "traction": ["customer traction", "early traction", "growth metrics"],
    "seed": ["seed round", "seed stage"],
    "raise": ["fundraise", "capital raise", "financing round"],
    # investor_meeting
    "investor asked": ["investor question", "investors asked"],
    "question": ["q&a", "questions"],
    "follow up": ["follow-up", "followup"],
    "diligence": ["due diligence", "dd"],
    # investor_update
    "investor update": ["monthly update", "quarterly update", "investor letter"],
    "monthly revenue": ["monthly sales"],
    "growth": ["growth rate", "mom growth"],
    # use_of_funds
    "use of funds": ["use of proceeds", "uses of funds"],
    "budget allocation": ["spend plan", "capital allocation"],
    "hiring plan": ["headcount plan", "hiring roadmap"],
    "funding plan": ["spending plan", "deployment plan"],
    # security
    "soc 2": ["soc2", "soc ii", "soc 2 type ii"],
    "security controls": ["security control", "control environment"],
    "penetration test": ["pen test", "pentest"],
    "security audit": ["security assessment", "security review"],
    # privacy_security
    "hipaa": ["hipaa compliance"],
    "privacy": ["data privacy", "privacy policy"],
    "phi": ["protected health information"],
    "security documentation": ["security docs", "security posture"],
    "data processing": ["data processing agreement", "dpa"],
    # investor_process
    "investor pipeline": ["investor crm", "investor tracker"],
    "fundraising process": ["raise process", "fundraise process"],
    "meeting cadence": ["meeting schedule", "weekly cadence"],
    "investor follow-up": ["investor follow up", "follow-up cadence"],
    # runway_warning
    "runway warning": ["short runway", "runway alert"],
    "cash constraint": ["cash crunch", "low cash"],
    "bridge financing": ["bridge round", "bridge loan"],
    "cost reduction": ["cost cutting", "layoffs", "rif", "reduction in force"],
}

CATEGORIES = {
    "financials": "Finance",
    "cap_table": "Ownership",
    "headcount": "People",
    "customer_pipeline": "Commercial",
    "compliance": "Legal & compliance",
    "pitch_deck": "Fundraising",
    "investor_meeting": "Fundraising",
    "investor_update": "Fundraising",
    "use_of_funds": "Fundraising",
    "security": "Security",
    "privacy_security": "Privacy & security",
    "investor_process": "Fundraising",
    "runway_warning": "Finance",
    "unknown": "unclassified",
}


def classify_document(text: str, file_name: str = "") -> dict:
    haystack = f"{file_name.replace('_', ' ')} {text}".lower()
    # Missing-document indexes mention absent files; they are evidence indexes, not those files.
    if "data_room_index" in file_name.lower() or "data room index" in haystack[:80]:
        return {
            "document_type": "data_room_index",
            "category": "Operations",
            "confidence": 1.0,
            "matched_keywords": ["data room index"],
            "review_status": "reviewed",
            "evidence_quality": "strong",
        }
    def _present(keyword: str) -> bool:
        if re.search(rf"\b{re.escape(keyword)}\b", haystack):
            return True
        return any(re.search(rf"\b{re.escape(syn)}\b", haystack) for syn in KEYWORD_SYNONYMS.get(keyword, []))

    matches = {
        doc_type: [word for word in words if _present(word)]
        for doc_type, words in KEYWORDS.items()
    }
    best_type, best_matches = max(matches.items(), key=lambda item: len(item[1]))
    if not best_matches:
        best_type = "unknown"
    possible = max(1, len(KEYWORDS.get(best_type, [])))
    confidence = round(min(0.99, 0.35 + len(best_matches) / possible), 2) if best_matches else 0.1
    
    if confidence < 0.45:
        best_type = "unknown"

    if best_type == "unknown":
        evidence_quality = "unknown"
    elif confidence < 0.65:
        evidence_quality = "weak"
    elif confidence < 0.85:
        evidence_quality = "partial"
    else:
        evidence_quality = "strong"

    return {
        "document_type": best_type,
        "category": CATEGORIES.get(best_type, "unclassified"),
        "confidence": confidence,
        "matched_keywords": best_matches if best_type != "unknown" else [],
        "review_status": "needs_review" if best_type == "unknown" else "draft",
        "evidence_quality": evidence_quality,
    }
