from ..utils.dates import due_date


TASKS = {
    "Runway below investor comfort threshold": ("Publish a raise timeline and use-of-funds plan", "CEO", "Fundraising", 0.0),
    "Runway requires immediate intervention": ("Create a weekly cash contingency plan", "CEO", "Finance", 0.0),
    "Gross margin has materially declined": ("Prepare a gross-margin recovery bridge", "Finance", "Investor Q&A", 0.0),
    "Monthly burn is increasing quickly": ("Add a department-level expense bridge", "Finance", "Finance", 0.0),
    "Financial history is insufficient": ("Add monthly financial records", "Finance", "Finance", 0.0),
    "Contractor IP assignments are missing": ("Upload signed contractor IP assignment agreements", "CTO", "Legal / HR", 7.9),
    "Headcount evidence is missing": ("Add employee and contractor records", "Operations", "People", 0.0),
    "409A valuation is missing": ("Upload or schedule a current 409A valuation", "Finance", "Compliance", 5.9),
    "BOI filing confirmation is missing": ("Confirm and upload BOI filing documentation", "CEO", "Compliance", 5.9),
    "State foreign qualification needs review": ("Review state foreign qualification status", "Legal", "Compliance", 0.0),
    "SAFE is not reflected in ownership": ("Build a pro-forma cap table including SAFE conversion", "Finance", "Cap Table", 3.0),
    "Cap table data is missing": ("Add a fully diluted cap table", "Finance", "Cap Table", 0.0),
    "Single-customer concentration is high": ("Create a customer concentration mitigation memo", "Sales", "GTM", 0.0),
    "Top-two customer concentration is high": ("Add pipeline coverage and diversification milestones", "Sales", "GTM", 0.0),
    "Customer pipeline evidence is missing": ("Add customer pipeline records", "Sales", "GTM", 0.0),
    "Detailed use-of-funds is missing": ("Prepare a detailed use-of-funds breakdown", "CEO", "Fundraising", 2.9),
    "SOC 2 evidence is incomplete": ("Upload SOC 2 readiness or assurance evidence", "CTO", "Security", 0.0),
    "Healthcare security documentation is incomplete": ("Upload privacy and healthcare security documentation", "CTO", "Privacy & security", 0.0),
    "Investor process materials need organization": ("Create an investor process tracker and materials checklist", "CEO", "Fundraising", 0.0),
}


def generate_action_plan(risks) -> list[dict]:
    tasks = []
    seen = set()
    for index, risk in enumerate(risks):
        title = risk.get("title") if isinstance(risk, dict) else risk.title
        severity = risk.get("severity") if isinstance(risk, dict) else risk.severity
        if title in seen:
            continue
        seen.add(title)
        task, owner, category, lift = TASKS.get(
            title, (f"Resolve: {title}", "CEO", "Readiness", 0.0)
        )
        tasks.append({
            "title": task,
            "priority": "High" if severity in {"Critical", "High"} else "Medium",
            "owner": owner,
            "due_date": due_date(min(7, index + 1)),
            "category": category,
            "status": "open",
            "estimated_score_lift": lift,
        })
    return tasks
