from .readiness_engine import readiness_tier


RECOVERY_ACTIONS = [
    {
        "action": "Upload signed contractor IP assignment agreements",
        "estimated_score_lift": 7.9,
        "score_basis": "Compliance +25, data room +1 present item, and meeting follow-up +20; weighted lift 7.9.",
        "source_evidence": "atlasai/headcount.csv, atlasai/compliance_checklist.csv, atlasai/investor_meeting_transcript.txt",
    },
    {
        "action": "Upload a current 409A valuation confirmation",
        "estimated_score_lift": 5.9,
        "score_basis": "Compliance +20 and data room +1 present item; weighted lift 5.9.",
        "source_evidence": "atlasai/compliance_checklist.csv, atlasai/data_room_index.txt",
    },
    {
        "action": "Confirm and upload BOI filing documentation",
        "estimated_score_lift": 5.9,
        "score_basis": "Compliance +20 and data room +1 present item; weighted lift 5.9.",
        "source_evidence": "atlasai/compliance_checklist.csv, atlasai/data_room_index.txt",
    },
    {
        "action": "Prepare a detailed use-of-funds breakdown",
        "estimated_score_lift": 2.9,
        "score_basis": "Data room +1 present item and meeting follow-up +20; weighted lift 2.9.",
        "source_evidence": "atlasai/investor_meeting_transcript.txt, atlasai/data_room_index.txt",
    },
    {
        "action": "Build a pro-forma cap table including SAFE conversion",
        "estimated_score_lift": 3.0,
        "score_basis": "Cap-table score +20; weighted lift 3.0.",
        "source_evidence": "atlasai/cap_table.csv",
    },
    {
        "action": "Create a customer concentration mitigation memo",
        "estimated_score_lift": 0.0,
        "score_basis": "Improves investor preparedness but does not change the strict score until concentration metrics improve.",
        "source_evidence": "atlasai/customer_pipeline.csv",
    },
]


def build_recovery_path(current_score: float, action_items=None) -> dict:
    actions = RECOVERY_ACTIONS
    if action_items is not None:
        actions = [
            {
                "action": item.title,
                "estimated_score_lift": item.estimated_score_lift,
                "score_basis": "Estimated from the deterministic penalty addressed by this action." if item.estimated_score_lift else "Improves preparedness but does not directly change a strict scoring rule.",
                "source_evidence": item.category,
            }
            for item in action_items
        ]
    strict_lift = round(sum(item["estimated_score_lift"] for item in actions), 1)
    projected = round(min(100, current_score + strict_lift), 1)
    return {
        "current_strict_score": current_score,
        "current_tier": readiness_tier(current_score),
        "estimated_strict_score_lift": strict_lift,
        "projected_strict_score": projected,
        "projected_range_low": max(current_score, round(projected - 1)),
        "projected_range_high": min(100, round(projected + 5)),
        "projected_tier": readiness_tier(projected),
        "actions": actions,
        "methodology": (
            "Projection removes only the explicit scoring penalties addressed by completed evidence. "
            "The range reflects document validation and follow-up review; it does not change the scoring rules."
        ),
    }
