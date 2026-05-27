# tests/test_foundation.py
# ─────────────────────────────────────────────────────────────
# Phase 1 smoke tests — verifies the foundation is wired up.
# ─────────────────────────────────────────────────────────────


def test_root_redirects_to_dashboard(client):
    """GET / should redirect to /dashboard."""
    response = client.get("/", follow_redirects=False)
    assert response.status_code in (301, 302, 307, 308)
    assert "/dashboard" in response.headers["location"]


def test_dashboard_page_loads(client):
    """GET /dashboard should return 200 HTML."""
    response = client.get("/dashboard")
    assert response.status_code == 200
    assert b"Dashboard" in response.content


def test_login_page_loads(client):
    """GET /auth/login should return 200 HTML."""
    response = client.get("/auth/login")
    assert response.status_code == 200
    assert b"Sign in" in response.content


def test_transactions_page_loads(client):
    """GET /transactions should return 200 HTML."""
    response = client.get("/transactions")
    assert response.status_code == 200


def test_reports_page_loads(client):
    """GET /reports should return 200 HTML."""
    response = client.get("/reports")
    assert response.status_code == 200


def test_receipts_capture_page_loads(client):
    """GET /receipts/capture should return 200 HTML."""
    response = client.get("/receipts/capture")
    assert response.status_code == 200


def test_static_css_accessible(client):
    """GET /static/css/app.css should return 200."""
    response = client.get("/static/css/app.css")
    assert response.status_code == 200


def test_static_js_accessible(client):
    """GET /static/js/app.js should return 200."""
    response = client.get("/static/js/app.js")
    assert response.status_code == 200
