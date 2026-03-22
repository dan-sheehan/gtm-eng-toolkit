"""Tests for ICP Scorer — scoring logic and API routes."""
from __future__ import annotations

import pytest

import app_icp_scorer


@pytest.fixture
def model():
    return app_icp_scorer.load_model()


@pytest.fixture
def app(tmp_path):
    app_icp_scorer.DB_PATH = tmp_path / "test.db"
    app_icp_scorer.DATA_DIR = tmp_path
    app_icp_scorer.ensure_db()
    app = app_icp_scorer.create_app(prefix="")
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(app):
    return app.test_client()


class TestScoringLogic:
    def test_perfect_score(self, model):
        selections = {
            "industry_fit": "saas",
            "company_size": "51_200",
            "funding_stage": "series_b",
            "tech_stack": "modern_full",
            "growth_signals": "strong",
            "buying_signals": "active_eval",
        }
        score, grade, breakdown = app_icp_scorer.compute_score(model, selections)
        assert score == 100
        assert grade == "A"
        assert len(breakdown) == 6

    def test_low_score(self, model):
        selections = {
            "industry_fit": "non_tech",
            "company_size": "1_10",
            "funding_stage": "unknown",
            "tech_stack": "unknown",
            "growth_signals": "contracting",
            "buying_signals": "cold",
        }
        score, grade, _ = app_icp_scorer.compute_score(model, selections)
        assert score < 40
        assert grade == "D"

    def test_empty_selections(self, model):
        score, grade, _ = app_icp_scorer.compute_score(model, {})
        assert score == 0
        assert grade == "D"


class TestAPI:
    def test_index_returns_200(self, client):
        assert client.get("/").status_code == 200

    def test_get_model(self, client):
        resp = client.get("/api/model")
        assert resp.status_code == 200
        assert "dimensions" in resp.get_json()

    def test_score_and_list(self, client):
        resp = client.post("/api/score", json={
            "company_name": "Test Corp",
            "selections": {"industry_fit": "saas"},
        })
        assert resp.status_code == 200
        assert resp.get_json()["grade"] in ("A", "B", "C", "D")

        scores = client.get("/api/scores").get_json()["scores"]
        assert len(scores) >= 1

    def test_score_requires_company_name(self, client):
        assert client.post("/api/score", json={"selections": {}}).status_code == 400
