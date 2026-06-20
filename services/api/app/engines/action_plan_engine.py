from ..utils.dates import due_date


def generate_action_plan(risks) -> list[dict]:
    templates = [
        ("Upload signed contractor IP assignment agreements", "High", "CTO", 1, "Legal / HR", 7.9),
        ("Prepare detailed use-of-funds breakdown for the $3M Seed round", "High", "CEO", 2, "Fundraising", 2.9),
        ("Build a pro-forma cap table including $500K SAFE conversion", "High", "Finance", 3, "Cap Table", 3.0),
        ("Upload 409A valuation confirmation or mark it as scheduled", "Medium", "Finance", 4, "Compliance", 5.9),
        ("Confirm and upload BOI filing documentation", "Medium", "CEO", 4, "Compliance", 5.9),
        ("Prepare an evidence-backed explanation for gross margin decline", "Medium", "Finance", 5, "Investor Q&A", 0.0),
        ("Create a customer concentration mitigation memo", "High", "Sales", 6, "GTM", 0.0),
        ("Add a department-level expense breakdown for the burn increase", "Medium", "Finance", 7, "Finance", 0.0),
        ("Publish a raise timeline with weekly diligence owners", "High", "CEO", 1, "Fundraising", 0.0),
    ]
    def severity(risk):
        return risk.get("severity", "") if isinstance(risk, dict) else getattr(risk, "severity", "")

    high_risk = any(severity(risk) in {"High", "Critical"} for risk in risks)
    return [
        {
            "title": title,
            "priority": priority if high_risk else "Medium",
            "owner": owner,
            "due_date": due_date(day),
            "category": category,
            "status": "open",
            "estimated_score_lift": estimated_score_lift,
        }
        for title, priority, owner, day, category, estimated_score_lift in templates
    ]
