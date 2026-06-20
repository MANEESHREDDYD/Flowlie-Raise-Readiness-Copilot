from .financial_engine import financial_summary


def _question(question, answer, source, missing, confidence, category):
    return {
        "question": question,
        "suggested_answer": answer,
        "source": source,
        "missing_evidence": missing,
        "confidence": confidence,
        "category": category,
    }


def generate_questions(company, metrics, cap_table, headcount, pipeline, compliance) -> list[dict]:
    summary = financial_summary(metrics)
    concentrations = sorted(pipeline, key=lambda item: item.revenue_concentration, reverse=True)
    top_two = sum(item.revenue_concentration for item in concentrations[:2])
    unsigned = [item for item in headcount if item.type == "contractor" and not item.ip_assignment_signed]
    safe = next((item for item in cap_table if item.type == "safe"), None)
    return [
        _question(
            f"How much runway does {company.name} currently have, and how will the Seed round extend it?",
            f"{company.name} currently has approximately {summary['runway_months']:.1f} months of runway based on ${summary['latest_cash_balance']/1000:.0f}K cash and ${summary['latest_burn']/1000:.0f}K monthly burn. The proposed ${company.target_raise/1_000_000:.0f}M Seed round is intended to extend runway toward 24 months while funding GTM hiring, product infrastructure, and enterprise pilot conversion.",
            "atlasai_financials.csv, atlasai_company_profile.json",
            "Detailed use-of-funds breakdown.", 0.97, "Finance",
        ),
        _question(
            f"Why did gross margin decline from {summary['first_gross_margin']:.0%} to {summary['latest_gross_margin']:.0%}?",
            f"Gross margin declined from {summary['first_gross_margin']:.0%} in January to {summary['latest_gross_margin']:.0%} in May. The investor update attributes the decline to infrastructure costs and onboarding support for enterprise pilots. {company.name} should show how margins normalize as pilots convert and infrastructure utilization improves.",
            "atlasai_financials.csv, atlasai_investor_update.txt",
            "Margin recovery plan.", 0.95, "Finance",
        ),
        _question(
            "Is all contractor-built product and ML pipeline IP assigned to the company?",
            f"The current headcount file shows {len(unsigned)} contractors with IP assignment marked as false. {company.name} should not claim full IP readiness until signed contractor IP assignment agreements are collected and uploaded.",
            "atlasai_headcount.csv",
            "Signed contractor IP assignment agreements.", 0.99, "Legal / HR",
        ),
        _question(
            "How concentrated is revenue or pipeline value among the top customers?",
            f"The customer pipeline shows {concentrations[0].customer} at {concentrations[0].revenue_concentration:.0%} concentration and {concentrations[1].customer} at {concentrations[1].revenue_concentration:.0%}. Together, the top two represent approximately {top_two:.0%} of pipeline concentration.",
            "atlasai_customer_pipeline.csv",
            "Customer diversification plan.", 0.98, "GTM",
        ),
        _question(
            "Does the company have a current 409A valuation?",
            "The compliance checklist marks the 409A valuation as missing. If AtlasAI has issued or plans to issue options, it should coordinate a valuation and upload confirmation before deeper diligence.",
            "atlasai_compliance_checklist.csv",
            "409A valuation confirmation.", 0.99, "Compliance",
        ),
        _question(
            "Is BOI filing complete?",
            "The compliance checklist marks BOI filing as missing. AtlasAI should confirm filing status with the appropriate adviser and upload supporting documentation.",
            "atlasai_compliance_checklist.csv",
            "BOI filing confirmation.", 0.99, "Compliance",
        ),
        _question(
            f"How is the $500K SAFE reflected in the cap table and dilution model?",
            f"The cap table lists a SAFE ({safe.notes if safe else '$500K SAFE not converted'}) without an ownership percentage. AtlasAI should provide a pro-forma cap table showing SAFE conversion and Seed round dilution.",
            "atlasai_cap_table.csv",
            "Pro-forma cap table.", 0.97, "Cap Table",
        ),
        _question(
            f"Why did monthly burn increase from ${summary['first_burn']/1000:.0f}K to ${summary['latest_burn']/1000:.0f}K?",
            f"Monthly burn increased from ${summary['first_burn']/1000:.0f}K in January to ${summary['latest_burn']/1000:.0f}K in May. AtlasAI should explain how much of this increase is tied to GTM hiring, product infrastructure, and enterprise pilot support.",
            "atlasai_financials.csv",
            "Department-level expense breakdown.", 0.94, "Finance",
        ),
        _question(
            f"How exactly will the ${company.target_raise/1_000_000:.0f}M Seed round be used?",
            "The company profile says the raise will fund GTM hiring, product infrastructure, and enterprise pilot conversion. The data room does not contain a detailed use-of-funds breakdown, so AtlasAI should prepare a budget allocation by category and milestone.",
            "atlasai_company_profile.json, atlasai_data_room_index.txt",
            "Detailed use-of-funds breakdown.", 0.96, "Fundraising",
        ),
        _question(
            "Does the round provide enough capital for long enterprise sales cycles?",
            f"AtlasAI targets mid-market and enterprise customers. With {summary['runway_months']:.1f} months of current runway, investors may question whether the company has enough time to convert pilots. The Seed round should be tied to a milestone plan that funds sales cycles and extends runway.",
            "atlasai_pitch_deck_summary.txt, atlasai_financials.csv",
            "Enterprise sales-cycle model.", 0.91, "GTM",
        ),
    ]
