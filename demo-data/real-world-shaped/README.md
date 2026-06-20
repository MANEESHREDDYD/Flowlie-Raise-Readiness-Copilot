# Real-World-Shaped Examples

This folder contains public-template-inspired, real-world-shaped data with synthetic/redacted values.
It is designed to test the system's ability to handle structurally complex but entirely fictional data.

## Files included:

1. **synthetic_safe_summary.txt**: This document is an unstructured summary inspired by a standard YC SAFE template. It uses synthetic values (e.g. $10M cap, 20% discount) to simulate how a founder might dump SAFE details into a raw text file rather than structuring them into rows.
   - *Result*: The keyword classifier correctly maps this to Ownership ("cap_table") and sets the `evidence_quality` to partial/weak based on confidence, while keeping it in a `needs_review` draft state.
