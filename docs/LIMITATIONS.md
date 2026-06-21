# Limitations

* Rule-based scoring is not calibrated on real financing outcomes.
* Keyword classification does not deeply understand arbitrary legal, financial, or cap-table documents.
* Real PDFs, scans, OCR errors, unusual cap tables, and ambiguous compliance documents require human review.
* The system produces drafts, not determinations.
* The recovery score is a projection based on explicit rule removal, not a prediction of investor behavior.
* The app does not provide legal, tax, accounting, investment, or fundraising advice.
* Production use would require security, access control, audit logs, encryption, document versioning, reviewer workflows, and expert validation.

## Real-world data readiness update

**What changed (input handling only):**

* Operator CSV bulk import for financials, cap table, headcount, customer pipeline, and compliance — with column-alias header mapping, per-row validation, and a preview that surfaces every invalid row (nothing is imported silently).
* An explicit `is_founder` field in the cap-table form, so founder ownership can be set structurally from the UI rather than inferred from a holder's name.
* A broader document-classifier vocabulary (synonyms mapped to the existing canonical keywords) so more real-world surface forms — e.g. "ACV", "FTE", "SOC2", "beneficial ownership" — are recognized and routed to the correct category.

**What did not change:**

* Scoring weights, deductions, tiers, and thresholds remain the same hand-authored heuristics, uncalibrated against real financing outcomes.
* The document classifier's confidence formula and evidence-quality thresholds are unchanged; the wider vocabulary recognizes more inputs without altering how confidence is computed.
* There is still no OCR (scanned/image PDFs are opaque) and no real natural-language understanding — classification is keyword/synonym matching, not comprehension.

> Improvements in this update expand what data the system can ingest and recognize. They do not change, tune, or validate the scoring logic itself. A score on real data reflects the same hand-authored rules as before — wider input coverage, not higher accuracy.

## What this does not do

* It is not a founder self-serve platform; an operator reviews every draft.
* It does not provide autonomous legal/compliance review.
* It does not deeply understand arbitrary legal/financial documents.
* It does not replace operator judgment.
* It does not make legal, tax, accounting, investment, or fundraising determinations.
* It does not predict investor behavior or prove a company is ready to raise.
* It does not handle production security, permissions, audit, encryption, or document versioning.
