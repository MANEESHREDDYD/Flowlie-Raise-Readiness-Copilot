from fastapi.testclient import TestClient

from app.main import app


def test_demo_flow_and_dashboard():
    with TestClient(app) as client:
        client.post("/demo/reset")
        seed = client.post("/demo/seed")
        assert seed.status_code == 200
        company_id = seed.json()["company_id"]
        assert len(client.post(f"/companies/{company_id}/risks/generate").json()) >= 9
        assert len(client.post(f"/companies/{company_id}/investor-qa/generate").json()) >= 10
        assert client.post(f"/companies/{company_id}/readiness/run").status_code == 200
        assert len(client.post(f"/companies/{company_id}/action-plan/generate").json()) >= 8
        dashboard = client.get(f"/companies/{company_id}/dashboard")
        assert dashboard.status_code == 200
        assert dashboard.json()["company"]["name"] == "AtlasAI"
        assert dashboard.json()["readiness_tier"] == "Not diligence-ready"
        assert dashboard.json()["recovery_path"]["projected_range_low"] == 78
        report = client.get(f"/companies/{company_id}/diligence-report.md")
        assert report.status_code == 200
        assert report.headers["content-type"].startswith("text/markdown")
        assert "**Strict Raise Readiness Score:** 53.4/100" in report.text
        assert "Why this matters to investors" in report.text
