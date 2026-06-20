# Stress Test

## Purpose

The stress fixtures test whether ambiguous or irrelevant inputs degrade safely. They do not prove real-world diligence understanding.

## Fixtures

| Fixture | Expected behavior |
| --- | --- |
| `irrelevant_marketing_note.txt` | Classified as unknown and held for review |
| `ambiguous_compliance_note.txt` | Stored as partial evidence rather than a strong conclusion |
| `nonstandard_safe_note.txt` | Does not resolve the structured cap-table risk |
| `messy_founder_cap_table_note.txt` | Requires operator mapping to an explicit founder record |

## Confirmed behavior

- Unknown documents do not crash readiness analysis.
- Unstructured SAFE prose does not satisfy structured ownership requirements.
- Founder ownership relies on `is_founder`, not a person's name.
- Evidence quality supports weak, partial, strong, and unknown states.
- Validation rejects malformed structured records.

## Honest interpretation

The confidence layer is deterministic workflow scaffolding. Thresholds such as document count and review status are deliberately inspectable, but they are not statistical uncertainty estimates. The value of the prototype is safe routing, explicit limitations, and visible operator review—not mathematical confidence.

## Remaining work

Real deployment would need OCR, semantic extraction, cross-document claim validation, richer reviewer tooling, security controls, and domain-expert evaluation.
