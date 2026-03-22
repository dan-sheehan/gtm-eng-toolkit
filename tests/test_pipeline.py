"""Tests for Pipeline Dashboard — metrics and API routes."""
from __future__ import annotations

import pytest

import app_pipeline


@pytest.fixture
def app(tmp_path):
    app_pipeline.DB_PATH = tmp_path / "test.db"
    app_pipeline.DATA_DIR = tmp_path
    app_pipeline.ensure_db()
    flask_app = app_pipeline.create_app(prefix="")
    flask_app.config["TESTING"] = True
    return flask_app


@pytest.fixture
def client(app):
    return app.test_client()


def test_index_returns_200(client):
    assert client.get("/").status_code == 200


def test_empty_deals(client):
    assert client.get("/api/deals").get_json()["deals"] == []


def test_create_and_list_deal(client):
    resp = client.post("/api/deals", json={
        "company": "Acme", "contact": "Jane", "value": 50000, "stage": "discovery",
    })
    assert resp.status_code == 200
    deals = client.get("/api/deals").get_json()["deals"]
    assert len(deals) == 1
    assert deals[0]["company"] == "Acme"


def test_metrics_with_deals(client):
    client.post("/api/deals", json={"company": "A", "value": 100000, "stage": "proposal"})
    client.post("/api/deals", json={"company": "B", "value": 50000, "stage": "closed_won"})
    client.post("/api/deals", json={"company": "C", "value": 30000, "stage": "closed_lost"})

    data = client.get("/api/metrics").get_json()
    assert data["total_pipeline"] == 100000
    assert data["weighted_pipeline"] == 50000  # proposal = 50%
    assert data["win_rate"] == 50

def test_seed(client):
    resp = client.post("/api/seed")
    assert resp.status_code == 200
    assert resp.get_json()["count"] > 0

def test_create_requires_company(client):
    assert client.post("/api/deals", json={"value": 100}).status_code == 400
