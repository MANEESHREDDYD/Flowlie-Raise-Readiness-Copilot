# Engineering Lessons

## Preserve the honest score

AtlasAI's 53.4 strict score is an integration anchor, not a marketing problem. The separate recovery projection communicates the path to improvement without changing current evidence or inflating the baseline.

## Structure beats naming conventions

Founder ownership originally depended on holder names beginning with “Founder.” Real cap tables contain names. The explicit `is_founder` field is now persisted by the API and editable in the UI.

## Routing is part of data integrity

A multi-company API is not enough if navigation still reads company `1`. All operational views now carry the active company ID, while legacy URLs redirect to a company-selection surface.

## Tests must not share developer state

FastAPI tests previously imported the production-configured SQLite engine. The release candidate sets a temporary database URL before application import and resets the isolated schema per test.

## Unknown is a valid result

Unsupported documents remain visible as `unknown` and `needs_review`. The application does not upgrade weak evidence merely to make the interface look complete.

## Deterministic does not mean omniscient

Rules make calculations reproducible and auditable, but they remain policy choices. The confidence audit calls its coverage values heuristic estimates and exposes limitations beside each component.

## Release polish needs real states

Screenshots and demo scripts are part of the product surface. They must be captured from seeded, valid routes rather than empty or broken pages.
