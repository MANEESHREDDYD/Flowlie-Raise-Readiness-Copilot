# Roadmap

## Completed in V1.2

- Operator console positioning: an internal evidence-intake workbench, not a self-serve replacement for an embedded team
- `review_status` (`draft | needs_review | reviewed`) on every generated output, defaulting to needs operator review
- Operator portfolio with per-company review status and an operator review-promotion endpoint
- Five-company synthetic portfolio
- Operator/founder-created companies with SQLite persistence
- CRUD evidence-intake workspace
- Text-note and file-upload evidence
- Company-specific analysis and report export
- Graceful partial analysis and validation

## Near term

- SQLite FTS5 or TF-IDF evidence ranking
- More flexible CSV column mapping
- Document freshness and version tracking
- Editable action status and owner workflows
- Readiness-score history and change explanations
- PDF and DOCX variants of the Markdown diligence report

## Optional local intelligence

- Ollama integration for grounded answer rewriting
- Local document summarization
- Investor-question clustering
- Citation validation against source snippets

## Workflow expansion

- Data-room sharing permissions
- Investor-specific diligence packs
- Founder and investor CRM integration
- Scenario planning and burn reduction modeling
- Fundraise timeline prediction
- Board update generator
- Cap-table dilution simulator
- Customer contract metadata extraction

## Production hardening

- PostgreSQL and background jobs
- Organization-level access controls
- Encryption and audit logs
- Configurable scoring policies by stage
- Adviser review workflows
- Automated regression fixtures for document extraction
