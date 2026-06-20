from .financial_engine import financial_summary


def _q(question, answer, source, missing, confidence, category):
    return {
        "question": question, "suggested_answer": answer, "source": source,
        "missing_evidence": missing, "confidence": confidence, "category": category,
    }


def _source(documents, doc_types, fallback):
    names = [doc.file_name for doc in documents if doc.document_type in doc_types]
    return ", ".join(names) if names else fallback


def generate_questions(company, metrics, cap_table, headcount, pipeline, compliance, documents=None) -> list[dict]:
    documents = documents or []
    questions = []
    if metrics:
        summary = financial_summary(metrics)
        questions += [
            _q(
                f"How much runway does {company.name} currently have, and what milestones will the raise fund?",
                f"{company.name} has approximately {summary['runway_months']:.1f} months of runway based on ${summary['latest_cash_balance']:,.0f} cash and ${summary['latest_burn']:,.0f} monthly burn. The ${company.target_raise:,.0f} target should be tied to the stated goal: {company.fundraise_goal}.",
                _source(documents, {"financials"}, "financial metrics, company profile"),
                "Detailed use-of-funds and milestone plan.", 0.95, "Finance",
            ),
            _q(
                "How are revenue growth, burn, and gross margin changing?",
                f"Across the available period, revenue changed {summary['revenue_growth_percent']:.1f}%, burn changed {summary['burn_increase_percent']:.1f}%, and gross margin changed {summary['gross_margin_change'] * 100:.0f} percentage points.",
                _source(documents, {"financials", "investor_update"}, "financial metrics"),
                "Department-level budget and margin bridge.", 0.93, "Finance",
            ),
        ]
    else:
        questions.append(_q(
            "What is the current runway and monthly operating plan?",
            "Financial metrics have not been added, so the system cannot calculate runway or burn trends yet.",
            "No financial source available", "At least one monthly financial record.", 0.25, "Finance",
        ))

    unsigned = [item for item in headcount if item.type == "contractor" and not item.ip_assignment_signed]
    questions.append(_q(
        "Is all employee and contractor-built IP assigned to the company?",
        f"The headcount records show {len(unsigned)} contractor(s) without confirmed IP assignment." if headcount else "No headcount records are available to verify IP assignment.",
        _source(documents, {"headcount", "contractor_ip"}, "headcount records"),
        "Signed IP assignment evidence." if unsigned or not headcount else "No material gap detected.", 0.9 if headcount else 0.3, "Legal / HR",
    ))

    if pipeline:
        concentrations = sorted(pipeline, key=lambda item: item.revenue_concentration, reverse=True)
        top_two = sum(item.revenue_concentration for item in concentrations[:2])
        questions.append(_q(
            "How concentrated is the customer pipeline?",
            f"The largest account represents {concentrations[0].revenue_concentration:.0%}, and the top two represent {top_two:.0%} of stated concentration.",
            _source(documents, {"customer_pipeline"}, "customer pipeline records"),
            "Customer diversification and pipeline coverage plan.", 0.96, "GTM",
        ))
    else:
        questions.append(_q(
            "What customer evidence supports the raise?",
            "No customer pipeline records are available yet.",
            "No customer source available", "Pipeline or customer evidence.", 0.2, "GTM",
        ))

    status = {item.item.lower(): item.status for item in compliance}
    missing_items = [item.item for item in compliance if item.status in {"missing", "outdated", "needs_review"}]
    questions.append(_q(
        "Which compliance items still need diligence follow-up?",
        f"The checklist identifies {', '.join(missing_items)}." if missing_items else "No unresolved items are listed in the current compliance checklist.",
        _source(documents, {"compliance", "security", "privacy_security"}, "compliance records"),
        "Supporting evidence for unresolved checklist items." if missing_items else "No material gap detected.", 0.92 if compliance else 0.25, "Compliance",
    ))

    safe = next((item for item in cap_table if item.type.lower() == "safe" and item.ownership_percent is None), None)
    questions.append(_q(
        "Does the fully diluted cap table reflect all convertible instruments?",
        f"{safe.holder} is listed without a modeled ownership percentage." if safe else ("The current entries do not show an unmodeled SAFE." if cap_table else "No cap table entries are available."),
        _source(documents, {"cap_table"}, "cap table records"),
        "Pro-forma dilution model." if safe or not cap_table else "No material gap detected.", 0.9 if cap_table else 0.2, "Cap Table",
    ))

    industry = company.industry.lower()
    if "fintech" in industry:
        questions.append(_q(
            "What security assurance and SOC 2 evidence is available?",
            "The current record should distinguish implemented controls from completed third-party assurance.",
            _source(documents, {"security"}, "security and compliance records"),
            "Current SOC 2 report or readiness evidence.", 0.82, "Security",
        ))
    if "health" in industry:
        questions.append(_q(
            "How are privacy, PHI, and security responsibilities documented?",
            "The diligence response should be grounded in the privacy and security records currently uploaded.",
            _source(documents, {"privacy_security"}, "privacy and security records"),
            "HIPAA/privacy control evidence and security documentation.", 0.82, "Privacy & security",
        ))
    if "devtool" in industry:
        questions.append(_q(
            "Is the investor process organized with current materials and follow-ups?",
            "The investor process should have a clear owner, current materials, and a documented follow-up cadence.",
            _source(documents, {"investor_process", "investor_meeting"}, "investor process notes"),
            "Current investor pipeline and process tracker.", 0.84, "Fundraising",
        ))

    questions.append(_q(
        f"How exactly will the ${company.target_raise:,.0f} raise be used?",
        f"The stated fundraising goal is: {company.fundraise_goal}. A category-level allocation should connect this goal to measurable milestones.",
        _source(documents, {"use_of_funds", "pitch_deck", "data_room_index"}, "company profile"),
        "Detailed use-of-funds breakdown.", 0.85, "Fundraising",
    ))
    questions.extend([
        _q(
            "What hiring plan is embedded in the raise?",
            f"{company.name} currently reports {company.employees} employees and {company.contractors} contractors. Hiring should be tied to the stated fundraising milestones.",
            _source(documents, {"headcount", "use_of_funds"}, "company profile and headcount records"),
            "Role-by-role hiring plan and timing.", 0.78, "People",
        ),
        _q(
            "Which data-room items are still missing or need review?",
            "The data-room checklist should be reviewed alongside the generated risk flags before investor access is expanded.",
            _source(documents, {"data_room_index", "compliance"}, "document inventory and compliance records"),
            "Updated data-room index with owners and dates.", 0.8, "Data Room",
        ),
        _q(
            "What milestones define a successful financing outcome?",
            f"The stated goal is: {company.fundraise_goal}. The founder should translate that goal into measurable product, revenue, hiring, and runway milestones.",
            _source(documents, {"pitch_deck", "investor_meeting", "investor_process"}, "company profile"),
            "Milestone plan with dates and owners.", 0.8, "Fundraising",
        ),
    ])
    return questions
