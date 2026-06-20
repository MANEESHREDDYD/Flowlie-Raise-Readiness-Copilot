# Flowlie outreach brief

## V1.2: Multi-company and user-entered data

V1.2 makes the concept materially closer to a Flowlie product workflow. A portfolio view lets operators compare several raises, while a founder can create a company and maintain the underlying finance, cap-table, people, pipeline, compliance, and document evidence directly in the product. The resulting analysis is no longer tied to one scripted demo; it runs on arbitrary SQLite-backed company records.

## Why this feature fits Flowlie

Flowlie already sits close to the operational systems founders use to run a raise. Raise Readiness Copilot extends that position from organizing back-office information to interpreting whether the company is prepared for investor diligence.

The feature is useful because it connects work that is usually fragmented:

- Financial reporting explains runway, burn, growth, and margin pressure.
- Cap-table records expose dilution and ownership questions.
- HR and compliance records reveal missing evidence before investor review.
- Data-room files determine whether the fundraising narrative is supportable.
- Investor meeting notes become a reusable preparation queue.

This is a natural bridge between fundraising workflow and back-office execution: the product does not merely say that a file is missing; it explains why the gap matters, what the founder should prepare, and who should own the cleanup.

## What was built

The prototype is a local-first Next.js and FastAPI product using synthetic AtlasAI data. It includes:

- A **Strict Raise Readiness Score** with an explicit tier
- A weighted score breakdown across finance, data room, compliance, cap table, pipeline, and meeting follow-up
- A recovery path from 53.4 to a projected 78–84 after named cleanup actions
- Estimated score lift per action item
- Data-room completeness tracking
- Financial runway, burn, growth, and gross-margin analysis
- Evidence-backed risk flags with investor relevance and suggested fixes
- Ten investor diligence questions with founder answer drafts, sources, and missing evidence
- A seven-day action plan with owners and dates
- An exportable Markdown diligence report

The system uses no paid APIs. Classification, scoring, risk generation, Q&A, retrieval, and projections are deterministic and testable.

## How it extends fundraising and back-office workflows

The strongest product loop is:

1. Flowlie receives or already holds company evidence.
2. The readiness engine identifies specific fundraising gaps.
3. Each gap becomes an assigned back-office action.
4. Completed evidence improves the strict score through visible rules.
5. The updated evidence feeds investor Q&A and diligence exports.
6. Meeting follow-ups create the next round of work.

That loop gives founders a reason to keep operational records current while making Flowlie more valuable during the highest-intensity part of the fundraising journey.

## What I would improve next inside Flowlie

I would first connect the prototype to Flowlie’s existing data model and permission system, then validate the scoring weights with founders and fundraising operators. The next product improvements would be:

- Company-stage-specific readiness policies
- Score history with an explanation of what changed
- Document freshness, versioning, and reviewer approval
- Editable tasks and workflow notifications
- Investor-specific diligence packs
- Scenario planning for raise size, hiring, and runway
- A fully diluted cap-table and SAFE conversion simulator
- Optional grounded language refinement, while keeping deterministic facts as the source of truth

The key design principle would remain unchanged: show the evidence, expose uncertainty, and turn analysis into owned work.
