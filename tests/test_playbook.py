"""Tests for Playbook Generator — segment templates and health scoring."""
from __future__ import annotations

import pytest

import app_playbook


class TestSegmentTemplates:
    def test_all_segments_have_required_keys(self):
        for segment, config in app_playbook.SEGMENT_TEMPLATES.items():
            assert "timeline" in config
            assert "touch_frequency" in config
            assert "escalation_threshold" in config

    def test_smb_has_shorter_timeline(self):
        assert "14" in app_playbook.SEGMENT_TEMPLATES["smb"]["timeline"]

    def test_enterprise_has_longer_timeline(self):
        assert "120" in app_playbook.SEGMENT_TEMPLATES["enterprise"]["timeline"]


@pytest.fixture
def app(tmp_path):
    app_playbook.DB_PATH = tmp_path / "test.db"
    app_playbook.DATA_DIR = tmp_path
    app_playbook.ensure_db()
    flask_app = app_playbook.create_app(prefix="")
    flask_app.config["TESTING"] = True
    return flask_app


@pytest.fixture
def client(app):
    return app.test_client()


class TestAPI:
    def test_index_returns_200(self, client):
        resp = client.get("/")
        assert resp.status_code == 200

    def test_segments_endpoint(self, client):
        resp = client.get("/api/segments")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "smb" in data["segments"]
        assert "enterprise" in data["segments"]

    def test_health_score_computation(self, client):
        resp = client.post("/api/playbooks/999/health-score", json={
            "milestones": [
                {"weight": 30, "completion": 1.0},
                {"weight": 20, "completion": 0.5},
                {"weight": 50, "completion": 0.0},
            ],
        })
        assert resp.status_code == 200
        data = resp.get_json()
        # 30*1.0 + 20*0.5 + 50*0.0 = 40 out of 100
        assert data["score"] == 40
        assert data["grade"] == "C"
        assert data["at_risk"] is True

    def test_health_score_perfect(self, client):
        resp = client.post("/api/playbooks/1/health-score", json={
            "milestones": [
                {"weight": 50, "completion": 1.0},
                {"weight": 50, "completion": 1.0},
            ],
        })
        data = resp.get_json()
        assert data["score"] == 100
        assert data["grade"] == "A"
        assert data["at_risk"] is False
