"""Tests for Morning Brief — route checks and data loading."""
from __future__ import annotations

import pytest

import app_morning_brief


@pytest.fixture
def app():
    flask_app = app_morning_brief.create_app(prefix="")
    flask_app.config["TESTING"] = True
    return flask_app


@pytest.fixture
def client(app):
    return app.test_client()


def test_index_returns_200(client):
    resp = client.get("/")
    assert resp.status_code == 200


def test_api_brief_returns_json(client):
    resp = client.get("/api/brief")
    assert resp.status_code == 200
    data = resp.get_json()
    # Either has data or has error message
    assert "generated_at" in data or "error" in data
