from .financial_engine import financial_summary


def _risk(category, severity, title, evidence, impact, fix, why):
    return {
        "category": category, "severity": severity, "title": title, "evidence": evidence,
        "business_impact": impact, "why_matters_to_investors": why,
        "suggested_fix": fix, "status": "open",
    }


def generate_risks(company, documents, metrics, compliance, cap_table, headcount, pipeline) -> list[dict]:
    risks = []
    if metrics:
        summary = financial_summary(metrics)
        runway = summary["runway_months"]
        if runway < 9:
            risks.append(_risk(
                "Finance", "High", "Runway below investor comfort threshold",
                f"Current runway is {runway:.1f} months based on ${summary['latest_cash_balance']:,.0f} cash and ${summary['latest_burn']:,.0f} monthly burn.",
                "The financing window may be compressed.", "Prepare a weekly raise timeline and milestone-linked use-of-funds plan.",
                "Investors assess whether the company can complete the raise without losing operating leverage.",
            ))
        if runway < 6:
            risks.append(_risk(
                "Finance", "Critical", "Runway requires immediate intervention",
                f"Current runway is only {runway:.1f} months.", "The company may face financing pressure before a normal process closes.",
                "Create a cash contingency plan and accelerate financing conversations.",
                "Very short runway can reduce negotiating leverage and increase execution risk.",
            ))
        if summary["gross_margin_change"] < -0.10:
            risks.append(_risk(
                "Finance", "High", "Gross margin has materially declined",
                f"Gross margin declined from {summary['first_gross_margin']:.0%} to {summary['latest_gross_margin']:.0%}.",
                "The scalability narrative may be challenged.", "Prepare a margin bridge and recovery plan.",
                "Margin direction helps investors judge whether growth becomes more efficient at scale.",
            ))
        if summary["burn_increase_percent"] > 30:
            risks.append(_risk(
                "Finance", "Medium", "Monthly burn is increasing quickly",
                f"Monthly burn increased {summary['burn_increase_percent']:.1f}% across the available period.",
                "Capital efficiency may appear weak.", "Add a department-level expense bridge.",
                "Investors compare burn growth with milestone progress and financing needs.",
            ))
    else:
        risks.append(_risk(
            "Finance", "Medium", "Financial history is insufficient",
            "No monthly financial records are available.", "Runway and trend analysis cannot be completed.",
            "Add at least one financial month; add two or more for trend analysis.",
            "Investors need a current cash and burn view before evaluating a financing plan.",
        ))

    unsigned = [row for row in headcount if row.type == "contractor" and not row.ip_assignment_signed]
    if unsigned:
        risks.append(_risk(
            "Legal / HR", "High", "Contractor IP assignments are missing",
            f"{len(unsigned)} contractor record(s) are marked unsigned: {', '.join(row.name for row in unsigned)}.",
            "Product ownership may receive additional diligence.", "Collect signed IP assignment evidence.",
            "Investors need confidence that the company controls the assets supporting its valuation.",
        ))
    if not headcount:
        risks.append(_risk(
            "People", "Low", "Headcount evidence is missing", "No headcount records are available.",
            "Team cost and IP review are incomplete.", "Add employee and contractor records.",
            "Investors evaluate team composition, cost structure, and ownership of work product.",
        ))

    status = {item.item.lower(): item.status for item in compliance}
    for key, title, severity in [
        ("409a valuation", "409A valuation is missing", "Medium"),
        ("boi filing", "BOI filing confirmation is missing", "Medium"),
    ]:
        if status.get(key) in {"missing", "outdated"}:
            risks.append(_risk(
                "Compliance", severity, title, f"The compliance checklist marks {key} as {status[key]}.",
                "The item may create avoidable diligence follow-up.", f"Update and upload evidence for {key}.",
                "Investors expect routine corporate records to be organized and current.",
            ))
    if status.get("state foreign qualification") == "needs_review":
        risks.append(_risk(
            "Compliance", "Low", "State foreign qualification needs review",
            "The checklist marks state foreign qualification as needs review.", "Operating records may require clarification.",
            "Review operating states and document the resulting status.",
            "Investors may ask whether registrations match the company’s operating footprint.",
        ))

    if any(row.type.lower() == "safe" and row.ownership_percent is None for row in cap_table):
        risks.append(_risk(
            "Cap Table", "Medium", "SAFE is not reflected in ownership",
            "A SAFE is listed without an ownership percentage.", "Fully diluted ownership is unclear.",
            "Build a pro-forma cap table showing conversion and financing dilution.",
            "Investors need a fully diluted ownership view before pricing a round.",
        ))
    if not cap_table:
        risks.append(_risk(
            "Cap Table", "Medium", "Cap table data is missing", "No cap table entries are available.",
            "Ownership and dilution cannot be reviewed.", "Add founders, investors, option pool, and convertibles.",
            "Investors require a clear ownership baseline for financing.",
        ))

    concentrations = sorted(pipeline, key=lambda row: row.revenue_concentration, reverse=True)
    if concentrations and concentrations[0].revenue_concentration > 0.30:
        risks.append(_risk(
            "GTM", "High", "Single-customer concentration is high",
            f"{concentrations[0].customer} represents {concentrations[0].revenue_concentration:.0%} of stated concentration.",
            "One account can materially affect the forecast.", "Prepare a diversification and pipeline coverage plan.",
            "Investors discount forecasts that depend heavily on one account.",
        ))
    if sum(row.revenue_concentration for row in concentrations[:2]) > 0.60:
        risks.append(_risk(
            "GTM", "High", "Top-two customer concentration is high",
            f"The top two accounts represent {sum(row.revenue_concentration for row in concentrations[:2]):.0%}.",
            "A delay in either account would affect near-term growth.", "Show broader pipeline coverage and mitigation milestones.",
            "Investors test whether growth remains durable if a large account slips.",
        ))
    if not pipeline:
        risks.append(_risk(
            "GTM", "Medium", "Customer pipeline evidence is missing", "No customer pipeline records are available.",
            "Commercial traction cannot be evaluated.", "Add pipeline or customer evidence.",
            "Investors need evidence connecting product adoption to the growth plan.",
        ))

    doc_types = {doc.document_type for doc in documents if doc.status == "present"}
    all_text = " ".join((doc.extracted_text or "").lower() for doc in documents)
    if ("use of funds" in all_text or "use-of-funds" in all_text) and "use_of_funds" not in doc_types:
        risks.append(_risk(
            "Fundraising", "Medium", "Detailed use-of-funds is missing",
            "Investor notes mention use of funds, but no detailed document is present.", "The raise amount may look disconnected from milestones.",
            "Prepare a category-by-category budget linked to outcomes.",
            "Investors want the raise amount tied to an achievable operating plan.",
        ))

    industry = company.industry.lower()
    if "fintech" in industry and ("security" not in doc_types or "soc 2 is in progress" in all_text):
        risks.append(_risk(
            "Security", "High", "SOC 2 evidence is incomplete",
            "No document is classified as security assurance or SOC 2 evidence.", "Enterprise diligence may stall.",
            "Upload current SOC 2 readiness, control, or audit evidence.",
            "Fintech investors expect a credible control environment and enterprise security path.",
        ))
    if "health" in industry and ("privacy_security" not in doc_types or "security documentation is incomplete" in all_text):
        risks.append(_risk(
            "Privacy & security", "High", "Healthcare security documentation is incomplete",
            "No privacy/security document is present.", "Healthcare customer diligence may be delayed.",
            "Add HIPAA, privacy, PHI handling, and security control evidence.",
            "Healthcare investors assess whether compliance and security can support commercial scale.",
        ))
    if "devtool" in industry and ("investor_process" not in doc_types or "fragmented" in all_text):
        risks.append(_risk(
            "Fundraising", "Medium", "Investor process materials need organization",
            "No investor process note or tracker is present.", "Follow-ups and diligence ownership may be inconsistent.",
            "Create an investor pipeline, materials checklist, and follow-up cadence.",
            "A disciplined process helps investors trust execution and reduces fundraising drift.",
        ))
    return risks
