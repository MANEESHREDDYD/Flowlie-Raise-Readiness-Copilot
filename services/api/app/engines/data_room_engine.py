REQUIRED_DOCUMENTS = [
    ("pitch_deck", "Pitch deck", "Fundraising"),
    ("financials", "Financials", "Finance"),
    ("cap_table", "Cap table", "Ownership"),
    ("headcount", "Headcount", "People"),
    ("customer_pipeline", "Customer pipeline", "Commercial"),
    ("compliance", "Compliance checklist", "Legal & compliance"),
    ("investor_meeting", "Investor meeting transcript", "Fundraising"),
    ("investor_update", "Investor update", "Fundraising"),
    ("use_of_funds", "Use-of-funds breakdown", "Fundraising"),
    ("contractor_ip", "Contractor IP assignment agreements", "Legal & compliance"),
    ("409a", "409A valuation", "Legal & compliance"),
    ("boi", "BOI filing confirmation", "Legal & compliance"),
    ("customer_contracts", "Customer contracts", "Commercial"),
]


def build_data_room(documents, compliance_items) -> list[dict]:
    present_types = {doc.document_type for doc in documents if doc.status == "present"}
    compliance = {item.item.lower(): item.status for item in compliance_items}
    checklist = []
    for key, label, category in REQUIRED_DOCUMENTS:
        status = "present" if key in present_types else "missing"
        if key == "409a":
            status = compliance.get("409a valuation", "missing")
        elif key == "boi":
            status = compliance.get("boi filing", "missing")
        elif key == "contractor_ip":
            status = compliance.get("contractor ip assignments", "missing")
        checklist.append({"key": key, "name": label, "category": category, "status": status})
    return checklist


def data_room_score(checklist: list[dict]) -> float:
    points = sum(1 if item["status"] == "present" else 0.5 if item["status"] == "needs_review" else 0 for item in checklist)
    return round(points / len(checklist) * 100, 1)
