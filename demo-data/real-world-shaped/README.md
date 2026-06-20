# Real-World-Shaped Examples

This directory contains public-template-inspired, real-world-shaped data with synthetic/redacted values. 

It exists to prove that the pipeline has been tested against inputs that are less ideal than the purely synthetic "happy path" demo data used elsewhere.

## Files included:

1. **synthetic_safe_summary.txt**: This document is an unstructured summary inspired by a standard YC SAFE template. It uses synthetic values (e.g. $10M cap, 20% discount) to simulate how a founder might dump SAFE details into a raw text file rather than structuring them into rows.
   - *Result*: The keyword classifier correctly maps this to Ownership ("cap_table") and sets the `evidence_quality` to partial/weak based on confidence, while keeping it in a `needs_review` draft state.
