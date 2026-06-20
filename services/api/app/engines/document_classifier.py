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
    "unknown": "Other",
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
        }
    matches = {
        doc_type: [word for word in words if re.search(rf"\b{re.escape(word)}\b", haystack)]
        for doc_type, words in KEYWORDS.items()
    }
    best_type, best_matches = max(matches.items(), key=lambda item: len(item[1]))
    if not best_matches:
        best_type = "unknown"
    possible = max(1, len(KEYWORDS.get(best_type, [])))
    return {
        "document_type": best_type,
        "category": CATEGORIES[best_type],
        "confidence": round(min(0.99, 0.35 + len(best_matches) / possible), 2) if best_matches else 0.1,
        "matched_keywords": best_matches,
    }
