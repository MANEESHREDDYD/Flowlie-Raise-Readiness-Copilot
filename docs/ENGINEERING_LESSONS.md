# Engineering Lessons

## The 53.4 Strict Score Story
In the seed data for `AtlasAI`, the strict readiness score evaluates to exactly `53.4`. This number is preserved intentionally. It represents a baseline where the system rigorously penalizes missing data, unclear documents, and unmitigated risks. We preserve this specific score as an integration test to ensure our deterministic scoring logic and risk penalties don't randomly shift. We separate the recovery path (78-84 range) to show operators the potential uplift from resolving the generated action items, distinguishing current reality from potential readiness.

## Why Generated Outputs Default to Needs Review
Every piece of ingested data that lacks structural certainty, and every generated artifact (action items, Q&A), starts with a `needs_review` status. In a high-stakes fundraising preparation context, automated systems cannot unilaterally declare a cap table accurate or a legal document completely resolved. The system acts as a draft engine to surface gaps; an operator must always provide the final sign-off.

## Deterministic Rules Before LLMs
We chose a strictly deterministic approach for scoring, missing inputs, and baseline classifications. We did this because fundraising metrics (e.g. runway months, founder ownership percentages) require exact logic, not probabilistic inference. LLMs are only applied at the very edges of the system (e.g. drafting context-aware questions from transcripts) where deterministic rules fail to capture nuance.

## Where Deterministic Rules Break
Deterministic rules have clear boundaries:
* **Ambiguous text:** The document keyword classifier struggles with prose that overlaps multiple categories (e.g. a document mentioning both HR compliance and cap table structure). We catch this via confidence scores.
* **No structured-import path:** Messy CSVs cannot be imported without building a robust parsing pipeline.
* **No OCR:** Image-based PDFs are opaque to simple text pipelines.
* **Brittle string matching:** We discovered a bug where founder ownership was calculated using `entry.holder.lower().startswith("founder")`. Real-world cap tables use actual names. We fixed this by introducing a structural `is_founder` boolean, proving that relying on unstructured names is brittle.

## Moving to Production
To use this system in production, several architectural changes would be needed:
1. **Structured import with validation:** We need a robust CSV/Excel ingestion pipeline with column mapping, not just API endpoints for JSON.
2. **Better document parsing:** Integration with OCR services and deeper semantic analysis instead of simple keyword frequency.
3. **Confidence scoring depth:** Expanding the engine to cross-validate claims across different documents.
4. **Reviewer workflows:** Richer UI states for operators to approve, merge, or reject extracted data.
5. **Security & audit logging:** Strict RLS (Row Level Security), audit trails for operator changes, and SOC2-compliant data handling.

## The "Deterministic Theater" Concession
A skeptical engineering leader might push back on our "Trust & Confidence" layer, noting that our confidence scores are just hardcoded rules (e.g. `unknown_evidence_count > 0 == weak confidence`) rather than true model uncertainty. They would be right. We are using deterministic rules to *mock* the shape of probabilistic uncertainty. We do this to validate the UX and operator workflows (forcing humans to review edge cases) without the overhead of deploying an actual LLM pipeline for classification. The lesson here is that building the *rails* for uncertainty (the UI, the "needs_review" database flags, the safe fallback states) is more critical for early product validation than the mathematical purity of the confidence score itself.
