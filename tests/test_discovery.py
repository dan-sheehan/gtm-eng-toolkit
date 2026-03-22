"""Tests for Discovery Call Prep — prompt building and route checks."""
from __future__ import annotations

import pytest

import app_discovery


@pytest.fixture
def app(tmp_path):
    app_discovery.DB_PATH = tmp_path / "test.db"
    app_discovery.DATA_DIR = tmp_path
    app_discovery.ensure_db()
    flask_app = app_discovery.create_app(prefix="")
    flask_app.config["TESTING"] = True
    return flask_app


@pytest.fixture
def client(app):
    return app.test_client()


def test_index_returns_200(client):
    resp = client.get("/")
    assert resp.status_code == 200


def test_build_prompt_includes_company():
    prompt = app_discovery.build_prompt({
        "company_url": "https://example.com",
        "prospect_name": "Jane Doe",
        "prospect_title": "VP Sales",
        "prospect_linkedin": "",
    })
    assert "https://example.com" in prompt
    assert "Jane Doe" in prompt


def test_saved_list_empty(client):
    resp = client.get("/api/preps")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["preps"] == []
