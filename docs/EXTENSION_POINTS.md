# Extension points

This document is an **architectural commitment**, not just a description of current code.

The system has exactly **two** components that are designed to be swappable behind an
interface, and a **permanently excluded** core that must never become swappable. Today there
is only one implementation of each swappable component, and it is deterministic and
rule-based. No LLM SDK, API key, or network call exists anywhere in the system.

## The two swappable components

### 1. Document classification — `document_classifier.py`

- Interface: `DocumentClassifier` (a `typing.Protocol`) with one method:
  `classify(self, text: str, file_name: str = "") -> ClassificationResult`.
- Current implementation: `RuleBasedClassifier` (keyword matching + a fixed confidence
  formula and evidence-quality thresholds).
- Wiring: callers depend on `get_default_classifier()` (a factory returning the
  `DocumentClassifier` interface) or accept an injected `DocumentClassifier`
  (see `ingest_upload(..., classifier=...)`). No consumer imports the concrete class.

### 2. Investor Q&A generation — `qa_engine.py`

- Interface: `QuestionGenerator` (`Protocol`) with one method:
  `generate(self, company, metrics, cap_table, headcount, pipeline, compliance, documents=None) -> list[dict]`.
- Current implementation: `RuleBasedQuestionGenerator` (deterministic templates populated
  with calculated facts and named source filenames).
- Wiring: callers depend on `get_default_question_generator()`.

A future LLM-backed version of either component can be dropped in by changing the factory's
return value (or injecting an alternate implementation at a call site). **Nothing else in the
system needs to change** — every consumer depends on the interface, not the concrete class.

## What a future LLM-backed implementation MUST guarantee to be a safe drop-in

A replacement is only "safe" if it preserves the contracts the rest of the system — and the
test suite — rely on:

**A replacement `DocumentClassifier` must:**

- Return a `ClassificationResult` with all fields populated: `document_type`, `category`,
  `confidence` (a 0.0–1.0 float), `matched_keywords`, `review_status`, `evidence_quality`.
- Treat `confidence` as an **honest self-assessment** and **never report higher confidence
  than it can justify**. Downstream review state (`needs_review` vs `draft`) and the
  evidence-quality tier depend on it; an over-confident classifier silently weakens the
  human-review safety net.
- Route anything it cannot confidently classify to `document_type = "unknown"` /
  `review_status = "needs_review"` rather than guessing — preserving the "expose uncertainty,
  don't hide it" behavior.

**A replacement `QuestionGenerator` must:**

- Cite **only real sources** — every item's `source` must reference evidence that actually
  exists (an uploaded file name or an explicit "no source available" fallback). It must
  **never fabricate a citation**.
- Keep an explicit `missing_evidence` field and a `confidence` value on every item, and must
  not state a fact that is not supported by the provided evidence.

These are exactly the guarantees `test_qa_engine.py` and `test_stress_adversarial.py` pin, so
a conforming replacement keeps the suite green.

## Deliberately and permanently excluded: the scoring / risk / confidence engines

`readiness_engine.py`, `risk_engine.py`, and `confidence_engine.py` are **the system's trust
boundary**. They are intentionally **not** behind any interface or injection layer and must
remain plain, deterministic functions:

- The readiness score, its component weights/deductions/tiers, and the recovery projection are
  hand-authored, auditable rules — they must produce the same number for the same input,
  forever, regardless of what happens elsewhere in the system.
- Risk flags are generated from explicit conditions, not inference.
- The confidence audit is a deterministic heuristic that labels coverage; it must not become a
  model-driven probability that could quietly drift.

**This is a permanent commitment, not a current-state note.** Even if an LLM is later wired
into classification or Q&A, the scoring/risk/confidence engines will remain deterministic and
free of any swappable-implementation layer. They are excluded from this pattern on purpose so
that no future change to the "soft" edges of the system can move the numbers the system is
trusted to compute.
