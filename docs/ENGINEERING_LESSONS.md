# Engineering Lessons

* **Why the strict 53.4 score was preserved instead of inflated:** Inflated scores don't help founders. We wanted a deterministic, conservative baseline.
* **Why the recovery path was separated from current readiness:** To explicitly show founders that "readiness" isn't a fixed state, but a function of completed cleanup actions.
* **Why generated outputs default to `needs_review`:** Because no automated system can provide final legal, financial, or investment judgments. Operator oversight is mandatory.
* **Why deterministic rules were used before LLMs:** Rules provide auditable, repeatable triage without hallucinations.
* **Where deterministic rules break down:** They struggle with nuance, unusual edge cases, and highly ambiguous text, where LLMs or human judgment excel.
* **How a production system could combine rules, retrieval, local/hosted models, and human review:** Rules for initial triage and keyword matching, RAG/LLMs for complex summarization and Q&A, with human operators making the final determinations and managing the "needs_review" queues.
