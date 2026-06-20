from fastapi.testclient import TestClient

from app.main import app


COMPANY = {
    "name": "ManualCo",
    "industry": "B2B SaaS",
    "stage": "Seed",
    "target_raise": 2000000,
    "cash_balance": 500000,
    "monthly_burn": 60000,
    "current_arr": 240000,
    "team_size": 5,
    "employees": 4,
    "contractors": 1,
    "primary_market": "Mid-market",
    "fundraise_goal": "Reach $1M ARR and extend runway",
}


def _delete_named(client, name):
    for company in client.get("/companies").json():
        if company["name"] == name:
            client.delete(f"/companies/{company['id']}")


def test_seed_all_demo_companies():
    with TestClient(app) as client:
        response = client.post("/demo/seed-all")
        assert response.status_code == 200
        seeded = response.json()["seeded_companies"]
        assert len(seeded) == 5
        assert {item["name"] for item in seeded} == {
            "AtlasAI", "FinPilot", "HealthSync", "DevToolsHub", "GreenLedger"
        }
        assert all(item["score"] is not None for item in seeded)
        scores = {item["name"]: item["score"] for item in seeded}
        assert scores == {
            "AtlasAI": 53.4, "FinPilot": 81.2, "HealthSync": 69.5,
            "DevToolsHub": 76.8, "GreenLedger": 38.9,
        }


def test_company_summary():
    with TestClient(app) as client:
        client.post("/demo/seed-all")
        response = client.get("/companies/summary")
        assert response.status_code == 200
        rows = response.json()
        assert len([row for row in rows if row["is_demo"]]) == 5
        for row in rows:
            assert {"name", "stage", "industry", "score", "tier", "top_risk", "review_status"} <= row.keys()
        # Every analyzed demo company starts as an operator-review draft.
        assert all(row["review_status"] == "needs_review" for row in rows if row["score"] is not None)


def test_user_company_creation_and_analysis():
    with TestClient(app) as client:
        _delete_named(client, "ManualCo")
        created = client.post("/companies", json=COMPANY)
        assert created.status_code == 200
        company_id = created.json()["id"]
        assert client.post(f"/companies/{company_id}/financials", json={
            "month": "2026-06", "revenue": 20000, "expenses": 80000,
            "cash_balance": 500000, "burn": 60000, "gross_margin": 0.7,
        }).status_code == 200
        assert client.post(f"/companies/{company_id}/cap-table", json={
            "holder": "Founder A", "type": "common", "ownership_percent": 90, "shares": 9000000,
        }).status_code == 200
        assert client.post(f"/companies/{company_id}/headcount", json={
            "name": "Taylor", "role": "Engineer", "type": "contractor",
            "start_date": "2026-01-01", "ip_assignment_signed": True, "monthly_cost": 8000,
        }).status_code == 200
        assert client.post(f"/companies/{company_id}/customer-pipeline", json={
            "customer": "Acme", "stage": "pilot", "contract_value": 50000,
            "probability": 0.6, "expected_close_month": "2026-08", "revenue_concentration": 0.3,
        }).status_code == 200
        assert client.post(f"/companies/{company_id}/compliance", json={
            "item": "Business Insurance", "status": "present",
            "last_updated": "2026-06-01", "owner": "CEO",
        }).status_code == 200
        client.post(f"/companies/{company_id}/risks/generate")
        client.post(f"/companies/{company_id}/investor-qa/generate")
        score = client.post(f"/companies/{company_id}/readiness/run")
        client.post(f"/companies/{company_id}/action-plan/generate")
        assert score.status_code == 200
        assert score.json()["overall_score"] >= 0
        assert client.get(f"/companies/{company_id}/diligence-report.md").status_code == 200


def test_user_documents_text_notes():
    with TestClient(app) as client:
        _delete_named(client, "NotesCo")
        company_id = client.post("/companies", json={**COMPANY, "name": "NotesCo"}).json()["id"]
        response = client.post(f"/companies/{company_id}/documents/text", json={
            "title": "Investor meeting note",
            "text": "Investor asked about runway, use of funds, and diligence follow up.",
            "status": "present",
        })
        assert response.status_code == 200
        assert response.json()["document_type"] == "investor_meeting"
        stored = client.get(f"/companies/{company_id}/documents").json()
        assert any(item["id"] == response.json()["id"] for item in stored)


def test_unknown_document_handling():
    with TestClient(app) as client:
        _delete_named(client, "NotesCo2")
        company_id = client.post("/companies", json={**COMPANY, "name": "NotesCo2"}).json()["id"]
        response = client.post(f"/companies/{company_id}/documents/text", json={
            "title": "Random Note",
            "text": "This is completely unrelated text about cooking pizza and random stuff.",
            "status": "present",
        })
        assert response.status_code == 200
        doc = response.json()
        assert doc["document_type"] == "unknown"
        assert doc["review_status"] == "needs_review"
        
        stored = client.get(f"/companies/{company_id}/documents").json()
        assert any(item["id"] == doc["id"] for item in stored)
        
        score = client.post(f"/companies/{company_id}/readiness/run")
        assert score.status_code == 200


def test_engines_not_atlasai_only():
    with TestClient(app) as client:
        seeded = client.post("/demo/seed-all").json()["seeded_companies"]
        finpilot = next(item for item in seeded if item["name"] == "FinPilot")
        healthsync = next(item for item in seeded if item["name"] == "HealthSync")
        fin_risks = {item["title"] for item in client.get(f"/companies/{finpilot['id']}/risks").json()}
        health_risks = {item["title"] for item in client.get(f"/companies/{healthsync['id']}/risks").json()}
        fin_q = {item["question"] for item in client.get(f"/companies/{finpilot['id']}/investor-qa").json()}
        health_q = {item["question"] for item in client.get(f"/companies/{healthsync['id']}/investor-qa").json()}
        assert fin_risks != health_risks
        assert fin_q != health_q
        assert "SOC 2 evidence is incomplete" in fin_risks
        assert "Healthcare security documentation is incomplete" in health_risks


def test_generated_outputs_require_review():
    with TestClient(app) as client:
        seeded = client.post("/demo/seed-all").json()["seeded_companies"]
        company_id = next(item["id"] for item in seeded if item["name"] == "AtlasAI")

        risks = client.get(f"/companies/{company_id}/risks").json()
        questions = client.get(f"/companies/{company_id}/investor-qa").json()
        actions = client.get(f"/companies/{company_id}/action-plan").json()
        score = client.get(f"/companies/{company_id}/readiness/latest").json()

        assert risks and all(item["review_status"] == "needs_review" for item in risks)
        assert questions and all(item["review_status"] == "needs_review" for item in questions)
        assert actions and all(item["review_status"] == "needs_review" for item in actions)
        assert score["review_status"] == "needs_review"

        report = client.get(f"/companies/{company_id}/diligence-report.md").text
        assert "requires operator review" in report.lower()

        # An operator can move the draft analysis to reviewed.
        reviewed = client.patch(
            f"/companies/{company_id}/readiness/review", json={"review_status": "reviewed"}
        )
        assert reviewed.status_code == 200
        assert reviewed.json()["review_status"] == "reviewed"
        assert all(
            item["review_status"] == "reviewed"
            for item in client.get(f"/companies/{company_id}/risks").json()
        )
