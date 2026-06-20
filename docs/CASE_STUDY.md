# Diligence Readiness Layer

## V1.2: Operator Module and Multi-Company Evidence Intake

V1.2 reframes the prototype as an internal **operator intelligence module / evidence-intake feature** for an embedded back-office team, and expands it into a multi-company surface. This explores how founder-provided evidence can be transformed into auditable diligence preparation drafts for human review.

The operator portfolio compares five synthetic startups with distinct stages, industries, risks, questions, and actions, and shows each company's **review status**. An operator can intake a new company, enter founder-provided operating records through dashboard forms, upload or paste evidence, run the deterministic engines, and export a report. Every generated output is a draft that defaults to **needs operator review**, and an operator can promote a reviewed company's analysis once checked.

## V1.2: From single demo to persistent company workspace

V1.2 turned the original AtlasAI prototype into a multi-company product surface. The portfolio now compares five synthetic startups with distinct stages, industries, risks, questions, and actions. An operator can also intake a company, enter founder-provided operating records through dashboard forms, upload or paste evidence, run the deterministic engines, and export a report.

## Why this is a feature layer, not a standalone product

Founders should not rely on the system alone. Generated outputs are drafts. Operators review and promote outputs. The system supports an embedded team by reducing evidence fragmentation. The value is trust, source traceability, and cleanup workflow, not automatic judgment.

The key technical change was removing AtlasAI assumptions from Q&A, risk, and action generation. Engines now tolerate missing collections, disclose insufficient inputs, and add lightweight industry context for fintech security, healthcare privacy/security, and DevTools fundraising process readiness.

## A local-first diligence intelligence prototype for Seed-stage founders

### The challenge

Fundraise preparation is spread across finance spreadsheets, cap tables, legal files, HR records, customer pipelines, and investor meeting notes. A founder may have most of the information and still be unprepared for diligence because the evidence is incomplete, inconsistent, or disconnected from likely investor questions.

The product challenge was to create an AI-like workflow with zero paid APIs, no real company data, and no unsupported claims.

### Product hypothesis

If a fundraising platform can turn back-office evidence into an explainable readiness assessment, founders can identify diligence gaps earlier, assign the cleanup, and enter investor conversations with more credible answers.

### The solution

I built a full-stack prototype for a synthetic Seed-stage company called AtlasAI. The product:

- Calculates a strict weighted readiness score
- Assigns a readiness tier
- Shows the exact evidence and penalties behind the result
- Identifies financial, compliance, HR, ownership, and GTM risks
- Explains why each issue matters to investors
- Generates source-backed diligence Q&A
- Converts the risks into a seven-day founder action plan
- Projects the score improvement from completing specific cleanup
- Exports a portable Markdown diligence report

### Why the score is intentionally strict

AtlasAI scores **53.4/100**, or **Not diligence-ready**. The project brief also suggested a desired score in the 70s, but its specified penalty schedule mathematically produces 53.4.

I kept the honest result.

That became a stronger product decision: the score is not a vanity metric. It is a transparent baseline. The product then shows a recovery path to approximately **78–84** by removing only the penalties addressed by signed IP assignments, 409A and BOI evidence, a use-of-funds document, and a modeled SAFE.

The customer concentration memo is clearly labeled as preparedness evidence; it does not change the strict score until the underlying concentration improves.

### Zero-budget intelligence design

The prototype creates useful copilot behavior through deterministic orchestration:

1. Parse CSV, JSON, TXT, PDF, DOCX, and XLSX evidence.
2. Classify documents using visible keyword matches.
3. Calculate financial metrics directly from source data.
4. Apply explicit scoring and risk rules.
5. Populate answer templates only with supported facts.
6. Attach source filenames and missing-evidence fields.
7. Map risks to owned actions and weighted recovery lifts.

This approach is auditable, fast, local, and easy to test. A local language model could later improve prose, but it would not replace the factual layer.

### Architecture

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Recharts
- **Backend:** FastAPI, SQLAlchemy, Pydantic
- **Persistence:** SQLite
- **Extraction:** PyMuPDF, python-docx, openpyxl
- **Testing:** pytest, TypeScript checks, production build, dependency audit

### Key product decisions

#### Separate readiness from optimism

The score reflects current evidence, while the Recovery Path communicates what is achievable next. This avoids inflating the present state while keeping the experience motivating.

#### Explain investor relevance

Risk cards do not stop at “missing document.” They connect evidence to the investor decision: ownership certainty, capital efficiency, revenue durability, or execution runway.

#### Distinguish score lift from preparedness

Some work closes a formal scoring gap. Other work improves the quality of an investor conversation without changing the underlying metric. The UI labels both honestly.

#### Export the work product

The Markdown endpoint makes the analysis portable into founder notes, adviser review, a repository, or another collaboration surface.

### Outcome

The completed demo produces:

- Strict score: **53.4**
- Readiness tier: **Not diligence-ready**
- Recovery point estimate: **79.0**
- Recovery range: **78–84**
- 11 deterministic risk flags
- 10 source-backed investor questions
- 9 seven-day action items
- 5 data-room gaps

All demo data is synthetic, and no paid API key is required.

### Product snapshots

![Strict score and recovery path](screenshots/dashboard.png)

![Investor relevance on every risk](screenshots/risks.png)

![Source-backed investor Q&A](screenshots/investor-qa.png)

### What I would build next

The next iteration would connect to real Flowlie workflows: configurable scoring by company stage, document review status, score history, team assignment, investor-specific diligence packs, runway scenarios, and a dilution simulator. I would validate the rules with founders and fundraising operators before introducing optional local language-model refinement.

### Disclaimer

This is an independent feature prototype, not a standalone company/product and not affiliated with or endorsed by any company. It explores how an embedded operator team could turn founder-provided evidence into draft diligence-preparation artifacts for human review. It does not provide legal, tax, accounting, investment, or fundraising advice.
