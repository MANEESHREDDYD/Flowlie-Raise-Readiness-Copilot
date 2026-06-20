import re


def search_documents(documents, query: str, limit: int = 3) -> list[dict]:
    query_terms = set(re.findall(r"[a-z0-9]+", query.lower()))
    results = []
    for document in documents:
        text = document.extracted_text or ""
        words = set(re.findall(r"[a-z0-9]+", text.lower()))
        overlap = len(query_terms & words)
        if not overlap:
            continue
        lower = text.lower()
        first_hit = min((lower.find(term) for term in query_terms if term in lower), default=0)
        start = max(0, first_hit - 100)
        snippet = text[start : start + 360].replace("\n", " ").strip()
        results.append(
            {
                "file_name": document.file_name,
                "document_type": document.document_type,
                "score": round(overlap / max(1, len(query_terms)), 2),
                "snippet": snippet,
            }
        )
    return sorted(results, key=lambda item: item["score"], reverse=True)[:limit]
