import re
from typing import Protocol, TypedDict


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
    "unknown": "unclassified",
}


class ClassificationResult(TypedDict):
    """Stable output contract every DocumentClassifier implementation must return.

    `confidence` is a 0.0–1.0 float and must be an honest self-assessment: an
    implementation must never report higher confidence than it can justify, because
    downstream review state and evidence-quality tiers depend on it.
    """
    document_type: str
    category: str
    confidence: float
    matched_keywords: list[str]
    review_status: str
    evidence_quality: str


class DocumentClassifier(Protocol):
    """Swappable classification interface.

    The engines and routes that ingest documents depend on this interface, not on a
    concrete class. A future LLM-backed implementation can be dropped in (see
    docs/EXTENSION_POINTS.md) without touching any consumer, as long as it returns a
    ClassificationResult and honors the confidence contract above. The default wiring
    is RuleBasedClassifier and remains deterministic.
    """

    def classify(self, text: str, file_name: str = "") -> ClassificationResult: ...


class RuleBasedClassifier:
    """Deterministic keyword classifier — the only implementation today.

    Behavior is intentionally identical to the historical module-level
    ``classify_document`` function: same keyword matching, same confidence formula,
    same evidence-quality thresholds.
    """

    def classify(self, text: str, file_name: str = "") -> ClassificationResult:
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
        matches = {
            doc_type: [word for word in words if re.search(rf"\b{re.escape(word)}\b", haystack)]
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


_default_classifier: DocumentClassifier = RuleBasedClassifier()


def get_default_classifier() -> DocumentClassifier:
    """Factory for the wired-in classifier. Swap the return value here (or inject a
    classifier explicitly at the call site) to change implementations system-wide."""
    return _default_classifier


def classify_document(text: str, file_name: str = "") -> ClassificationResult:
    """Backwards-compatible convenience wrapper that delegates to the default classifier.

    Kept so existing imports keep working; new code should prefer ``get_default_classifier()``
    or accept an injected ``DocumentClassifier``.
    """
    return get_default_classifier().classify(text, file_name)
