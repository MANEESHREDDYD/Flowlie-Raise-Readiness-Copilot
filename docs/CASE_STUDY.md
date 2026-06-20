# Case Study: Diligence Readiness Layer

## Summary

I built a local-first full-stack prototype that converts fragmented startup operating evidence into an operator-reviewed fundraising preparation workflow.

## Challenge

Fundraising diligence spans financial history, ownership, people operations, compliance records, customer concentration, and investor follow-up. A useful prototype needed to be transparent and testable without paid AI services or claims of autonomous professional judgment.

## Solution

The system combines:

- Next.js company-scoped workflows;
- FastAPI validation and CRUD endpoints;
- SQLite persistence;
- five synthetic companies;
- deterministic scoring and risk rules;
- template-based, source-backed Q&A;
- keyword document classification;
- a seven-day cleanup queue;
- Markdown report export;
- explicit review and evidence-confidence states.

## Important product decision

AtlasAI remains at an honest strict score of 53.4. The interface presents a separate 78–84 recovery scenario based on specific cleanup evidence, preserving the distinction between current state and potential state.

## Release-candidate hardening

The release sprint fixed company-context routing, structural founder ownership, temporary test databases, safe demo reset, risk-note persistence, complete confidence coverage, and broken screenshot/documentation states.

## Outcome

The result is a working portfolio demo and arbitrary-company evidence workspace that runs locally without paid APIs. It demonstrates full-stack implementation, product judgment, deterministic system design, testing, and honest limitation handling.

## Stack

Next.js, React, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy, Pydantic, SQLite, pytest, Recharts, PyMuPDF, python-docx, and openpyxl.
