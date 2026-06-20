from fastapi.testclient import TestClient
from app.main import app

import uuid

def test_irrelevant_document_is_unknown_and_not_strong_evidence():
    with TestClient(app) as client:
        comp_res = client.post("/companies", json={"name": f"Test-{uuid.uuid4()}", "industry": "Tech", "stage": "Seed", "target_raise": 1000000, "cash_balance": 100000, "monthly_burn": 10000, "current_arr": 0, "team_size": 2, "employees": 2, "contractors": 0, "primary_market": "US", "fundraise_goal": "Product launch"})
        company_id = comp_res.json()["id"]

        with open("../../demo-data/stress-tests/irrelevant_marketing_note.txt", "r") as f:
            text = f.read()

        doc_res = client.post(f"/companies/{company_id}/documents/text", json={"title": "irrelevant_marketing_note.txt", "text": text, "status": "present"})
        assert doc_res.status_code == 200
        doc = doc_res.json()
        assert doc["document_type"] == "unknown"
        assert doc["category"] == "unclassified"
        assert doc["review_status"] == "needs_review"
        assert doc["evidence_quality"] == "unknown"

def test_ambiguous_compliance_note_is_not_overclaimed_as_strong():
    with TestClient(app) as client:
        comp_res = client.post("/companies", json={"name": f"Test-{uuid.uuid4()}", "industry": "Tech", "stage": "Seed", "target_raise": 1000000, "cash_balance": 100000, "monthly_burn": 10000, "current_arr": 0, "team_size": 2, "employees": 2, "contractors": 0, "primary_market": "US", "fundraise_goal": "Product launch"})
        company_id = comp_res.json()["id"]

        with open("../../demo-data/stress-tests/ambiguous_compliance_note.txt", "r") as f:
            text = f.read()

        doc_res = client.post(f"/companies/{company_id}/documents/text", json={"title": "ambiguous_compliance_note.txt", "text": text, "status": "present"})
        assert doc_res.status_code == 200
        doc = doc_res.json()
        # With 3 keyword hits (409a, state, insurance) out of a small text, it yields "partial"
        assert doc["evidence_quality"] == "partial"

def test_nonstandard_safe_note_does_not_satisfy_cap_table_modeling_risk():
    with TestClient(app) as client:
        comp_res = client.post("/companies", json={"name": f"Test-{uuid.uuid4()}", "industry": "Tech", "stage": "Seed", "target_raise": 1000000, "cash_balance": 100000, "monthly_burn": 10000, "current_arr": 0, "team_size": 2, "employees": 2, "contractors": 0, "primary_market": "US", "fundraise_goal": "Product launch"})
        company_id = comp_res.json()["id"]

        with open("../../demo-data/stress-tests/nonstandard_safe_note.txt", "r") as f:
            text = f.read()

        client.post(f"/companies/{company_id}/documents/text", json={"title": "nonstandard_safe_note.txt", "text": text, "status": "present"})
        
        # We don't add structured CapTable records.
        client.post(f"/companies/{company_id}/risks/generate")
        risks_res = client.get(f"/companies/{company_id}/risks")
        risks = risks_res.json()
        
        cap_table_risks = [r for r in risks if r.get("category") == "Cap Table"]
        # The unmodeled-SAFE risk flag or missing cap table flag must still fire.
        assert len(cap_table_risks) > 0
        assert any("Unmodeled" in r["title"] or "Missing" in r["title"] or "SAFE" in r["title"] or "Cap table" in r["title"] for r in cap_table_risks)


def test_evidence_quality_has_real_partial_weak_tiers():
    from app.engines.document_classifier import classify_document
    
    # 1. Weak tier test
    res1 = classify_document("we have a safe but missing option pool", "cap_table.txt")
    # This should match 'safe', 'option pool' -> confidence is around 0.35 + 2/6 = 0.68 -> partial
    # If 1 match -> 0.35 + 1/6 = 0.51 -> weak
    res_weak = classify_document("we have a safe", "cap_table.txt")
    assert res_weak["evidence_quality"] == "weak"

    res_partial = classify_document("safe option pool", "cap_table.txt")
    assert res_partial["evidence_quality"] == "partial"

    # Strong tier: all keywords
    res_strong = classify_document("ownership shares safe option pool preferred common", "cap_table.txt")
    assert res_strong["evidence_quality"] == "strong"

def test_founder_ownership_uses_structural_field_not_name_matching():
    from app.engines.readiness_engine import cap_table_score
    from app.models import CapTableEntry
    
    entries_buggy = [
        CapTableEntry(holder="John Doe", type="Common", is_founder=False, ownership_percent=60)
    ]
    assert cap_table_score(entries_buggy) < 100 # Founder ownership is 0 because is_founder is False

    entries_fixed = [
        CapTableEntry(holder="John Doe", type="Common", is_founder=True, ownership_percent=60)
    ]
    score = cap_table_score(entries_fixed)
    assert score == 80 # Missing shares (-10) and Option pool missing (-10)

def test_analysis_never_crashes_on_unknown_or_low_confidence_documents():
    with TestClient(app) as client:
        comp_res = client.post("/companies", json={"name": f"Test-{uuid.uuid4()}", "industry": "Tech", "stage": "Seed", "target_raise": 1000000, "cash_balance": 100000, "monthly_burn": 10000, "current_arr": 0, "team_size": 2, "employees": 2, "contractors": 0, "primary_market": "US", "fundraise_goal": "Product launch"})
        company_id = comp_res.json()["id"]

        with open("../../demo-data/stress-tests/irrelevant_marketing_note.txt", "r") as f:
            client.post(f"/companies/{company_id}/documents/text", json={"title": "irrelevant.txt", "text": f.read(), "status": "present"})
        with open("../../demo-data/stress-tests/ambiguous_compliance_note.txt", "r") as f:
            client.post(f"/companies/{company_id}/documents/text", json={"title": "ambiguous.txt", "text": f.read(), "status": "present"})
        with open("../../demo-data/stress-tests/nonstandard_safe_note.txt", "r") as f:
            client.post(f"/companies/{company_id}/documents/text", json={"title": "safe.txt", "text": f.read(), "status": "present"})
        with open("../../demo-data/stress-tests/messy_founder_cap_table_note.txt", "r") as f:
            client.post(f"/companies/{company_id}/documents/text", json={"title": "messy_cap.txt", "text": f.read(), "status": "present"})
        
        res = client.post(f"/companies/{company_id}/readiness/run")
        assert res.status_code == 200
