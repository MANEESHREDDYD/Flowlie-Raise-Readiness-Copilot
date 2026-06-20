from .financial_engine import financial_summary


INVESTOR_RELEVANCE = {
    "Runway below investor comfort threshold": "Investors evaluate whether the company can finish the raise without losing operating leverage or accepting avoidable financing pressure.",
    "Runway requires immediate intervention": "Investors may see a compressed financing window as execution risk and reduced negotiating leverage.",
    "Gross margin has materially declined": "Investors use margin direction to assess whether growth can become more efficient as the company scales.",
    "Monthly burn is increasing quickly": "Investors compare burn growth with milestone progress to judge capital efficiency and the credibility of the financing plan.",
    "Contractor IP assignments are missing": "Investors need confidence that the company controls the product assets that support its valuation and future revenue.",
    "409A valuation is missing": "Investors expect option-grant records and supporting valuation evidence to withstand compensation diligence.",
    "BOI filing confirmation is missing": "Investors prefer routine corporate evidence to be organized so it does not create avoidable diligence delays.",
    "State foreign qualification needs review": "Investors may ask whether the company’s corporate records match where its team and operations are active.",
    "SAFE is not reflected in ownership": "Investors need a fully diluted ownership view to understand conversion mechanics and post-round dilution.",
    "Single-customer concentration is high": "Investors discount forecasts when one account can materially change revenue outcomes or negotiating leverage.",
    "Top-two customer concentration is high": "Investors test whether the growth story remains durable if a major account delays, contracts, or churns.",
    "Detailed use-of-funds is missing": "Investors want the raise amount tied to specific milestones, hiring decisions, and an achievable runway plan.",
}


def _risk(category, severity, title, evidence, business_impact, suggested_fix):
    return {
        "category": category,
        "severity": severity,
        "title": title,
        "evidence": evidence,
        "business_impact": business_impact,
        "why_matters_to_investors": INVESTOR_RELEVANCE[title],
        "suggested_fix": suggested_fix,
        "status": "open",
    }


def generate_risks(company, documents, metrics, compliance, cap_table, headcount, pipeline) -> list[dict]:
    summary = financial_summary(metrics)
    risks = []
    runway = summary["runway_months"]
    if runway < 9:
        risks.append(_risk(
            "Finance", "High", "Runway below investor comfort threshold",
            f"Current runway is {runway:.1f} months based on ${summary['latest_cash_balance']:,.0f} cash and ${summary['latest_burn']:,.0f} monthly burn.",
            "Investors may question whether the company has enough time to complete the raise and hit next milestones.",
            "Prepare a clear raise timeline and use-of-funds plan showing how the Seed round extends runway.",
        ))
    if runway < 6:
        risks.append(_risk(
            "Finance", "Critical", "Runway requires immediate intervention",
            f"Current runway is only {runway:.1f} months.",
            "The company could face financing pressure before a normal Seed process closes.",
            "Create a weekly cash plan, identify contingency reductions, and accelerate the raise timeline.",
        ))
    if summary["gross_margin_change"] < -0.10:
        risks.append(_risk(
            "Finance", "High", "Gross margin has materially declined",
            f"Gross margin declined from {summary['first_gross_margin']:.0%} to {summary['latest_gross_margin']:.0%}.",
            "Investors may question the scalability and unit economics of enterprise delivery.",
            "Prepare a margin bridge and a recovery plan tied to infrastructure and onboarding efficiency.",
        ))
    if summary["burn_increase_percent"] > 30:
        risks.append(_risk(
            "Finance", "Medium", "Monthly burn is increasing quickly",
            f"Monthly burn increased from ${summary['first_burn']:,.0f} to ${summary['latest_burn']:,.0f}, a {summary['burn_increase_percent']:.1f}% increase.",
            "A rising burn profile reduces fundraising leverage and may make the milestone plan look inefficient.",
            "Add a department-level expense bridge and identify spend that is milestone-critical.",
        ))

    unsigned_contractors = [record for record in headcount if record.type == "contractor" and not record.ip_assignment_signed]
    if unsigned_contractors:
        names = ", ".join(record.name for record in unsigned_contractors)
        risks.append(_risk(
            "Legal / HR", "High", "Contractor IP assignments are missing",
            f"{len(unsigned_contractors)} contractor records are marked unsigned: {names}.",
            "Investors may question whether all company product and ML pipeline IP is clearly assigned.",
            "Collect signed invention and IP assignment agreements and upload them to the data room.",
        ))

    status = {item.item.lower(): item.status for item in compliance}
    if status.get("409a valuation") == "missing":
        risks.append(_risk(
            "Compliance", "Medium", "409A valuation is missing",
            "The compliance checklist marks the 409A valuation as missing.",
            "Option grants may receive additional diligence and delay compensation review.",
            "Schedule or upload a current 409A valuation confirmation.",
        ))
    if status.get("boi filing") == "missing":
        risks.append(_risk(
            "Compliance", "Medium", "BOI filing confirmation is missing",
            "The compliance checklist marks BOI filing as missing.",
            "Missing filing evidence creates an avoidable diligence follow-up.",
            "Confirm the filing status with the appropriate adviser and upload supporting documentation.",
        ))
    if status.get("state foreign qualification") == "needs_review":
        risks.append(_risk(
            "Compliance", "Low", "State foreign qualification needs review",
            "The compliance checklist marks state foreign qualification as needs review.",
            "Investors may ask whether registrations match the company’s operating footprint.",
            "Review current operating states and document the resulting status.",
        ))
    if any(entry.type == "safe" and entry.ownership_percent is None for entry in cap_table):
        safe = next(entry for entry in cap_table if entry.type == "safe" and entry.ownership_percent is None)
        risks.append(_risk(
            "Cap Table", "Medium", "SAFE is not reflected in ownership",
            f"{safe.holder} is listed without ownership percentage. Notes: {safe.notes or 'No conversion detail provided'}.",
            "Investors cannot see fully diluted ownership or expected Seed dilution.",
            "Build a pro-forma cap table showing SAFE conversion and the proposed financing.",
        ))
    concentrations = sorted(pipeline, key=lambda item: item.revenue_concentration, reverse=True)
    if concentrations and concentrations[0].revenue_concentration > 0.30:
        top = concentrations[0]
        risks.append(_risk(
            "GTM", "High", "Single-customer concentration is high",
            f"{top.customer} represents {top.revenue_concentration:.0%} of stated pipeline concentration.",
            "Dependence on one account can make forecast quality and negotiating leverage look fragile.",
            "Prepare a diversification plan and distinguish signed revenue from probability-weighted pipeline.",
        ))
    if sum(item.revenue_concentration for item in concentrations[:2]) > 0.60:
        total = sum(item.revenue_concentration for item in concentrations[:2])
        risks.append(_risk(
            "GTM", "High", "Top-two customer concentration is high",
            f"The top two accounts represent approximately {total:.0%} of pipeline concentration.",
            "A delay or loss in either account would materially affect the near-term growth story.",
            "Show pipeline coverage, expansion opportunities, and concrete diversification milestones.",
        ))
    transcript = " ".join(
        doc.extracted_text.lower() for doc in documents if doc.document_type == "investor_meeting"
    )
    present_types = {doc.document_type for doc in documents if doc.status == "present"}
    if ("use-of-funds" in transcript or "use of funds" in transcript) and "use_of_funds" not in present_types:
        risks.append(_risk(
            "Fundraising", "Medium", "Detailed use-of-funds is missing",
            "The investor transcript asks for a clearer use-of-funds breakdown, but no use-of-funds document is present.",
            "The raise amount may appear disconnected from milestones and operating needs.",
            "Prepare a category-by-category budget linked to hiring, product, GTM, and runway milestones.",
        ))
    return risks
