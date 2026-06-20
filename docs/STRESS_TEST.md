# Stress Test Report

## Why this exists
The goal of this module is to prove engineering maturity by explicitly testing the system against messy, ambiguous, adversarial, and unsupported real inputs. By pushing the system beyond its happy path, we discover and document uncertainty rather than hiding it.

## Inputs tested
We created adversarial fixtures simulating messy, real-world data:
1. `ambiguous_compliance_note.txt` - Content genuinely ambiguous between compliance, HR, and legal notes.
2. `nonstandard_safe_note.txt` - Prose describing a SAFE-like instrument with unclear conversion terms.
3. `irrelevant_marketing_note.txt` - Unrelated marketing copy.
4. `messy_founder_cap_table_note.txt` - Text describing founder ownership via an actual name instead of a generic "founder" string.

## Results summary

| Case | Input problem | System behavior | Result | Still limited? |
| --- | --- | --- | --- | --- |
| Messy cap table (via docs) | Unstructured note with specific founder names | Stored as partial evidence | Graceful degradation | Needs operator mapping to structured rows |
| Broken financials | Invalid bulk data via API | Validation errors, no score from bad rows | Safe failure | No automated repair |
| Nonstandard SAFE | Ambiguous terms in text | Note stored, SAFE risk remains | Safe behavior | Human review required |
| Irrelevant marketing | Completely unrelated text | Classified as unknown with needs_review | Safe behavior | Ignored in readiness scoring |

## Cases that degraded gracefully
The document classifier effectively caught ambiguous and non-standard documents. Instead of confidently hallucinating classifications, it correctly assigned "partial" or "weak" evidence quality to ambiguous compliance notes, and assigned "unknown" to irrelevant marketing copy.

## Cases that still require operator judgment
Messy cap table and SAFE notes uploaded as unstructured text *do not* automatically resolve related missing data or risk flags. For instance, a text document describing a SAFE does not magically fix the "Unmodeled SAFE" cap table risk. The operator must review the document and manually enter the structural cap table data.

## Known failure modes
* **No CSV bulk-import path exists:** There is no pipeline for uploading messy CSVs and automatically mapping columns. Real-world messy CSVs are a known, named gap, and currently require manual mapping or one-by-one JSON ingestion via the API.
* **No OCR:** The system cannot extract text from scanned PDFs.

## What changed after the stress test
Two specific bugs were found and fixed during stress testing:
1. `evidence_quality` was previously binary ("strong" or "unknown"). We introduced real, deterministic rules mapping confidence (e.g. 0.45-0.65 = weak, 0.65-0.85 = partial, 0.85+ = strong) to `evidence_quality`.
2. The readiness engine used brittle string matching (`entry.holder.lower().startswith("founder")`) to identify founder ownership in the cap table. We replaced this with a structural `is_founder` boolean on the cap table schema.

## What this still does not prove
This stress test does not prove real-world diligence understanding. It proves that the current deterministic pipeline can fail safely, expose uncertainty, preserve human review, and avoid treating unsupported evidence as strong scoring support.

## What production hardening would require
Moving this prototype to production would require:
1. True structured import with validation (e.g. bulk CSV ingestion with intelligent column mapping).
2. Better document parsing capabilities including OCR.
3. Expanded confidence scoring and LLM integrations purely as grounded rewrite/extraction assistants.
4. Robust security, encryption, and audit logs.

## Addressing CTO Skepticism
A skeptical CTO reading this report will correctly point out that the "Confidence Audit" and these "stress tests" are largely deterministic theater. The confidence logic (`confidence_engine.py`) is just a set of hardcoded heuristic thresholds (e.g., "if >1 unknown document, overall confidence = weak"), not a true measure of probabilistic uncertainty or LLM hallucination risk. Furthermore, the stress tests themselves border on tautological—they merely assert that our hardcoded routing logic correctly routes a mocked input to a hardcoded output state. 

We acknowledge this. The purpose of this layer in V1.4 is **not** to build a statistically rigorous uncertainty model, but to prove to operators that the *application architecture* has a designated, safe conceptual bucket for "I don't know" and "This looks messy." In a real production system, these heuristic buckets would be replaced by actual probabilistic confidence intervals from a genuine classification model, but the operator-facing UX and fail-safe routing principles established here would remain exactly the same. The Confidence Audit UI labels coverage percentages as heuristic estimates to avoid implying statistical or probabilistic confidence.
