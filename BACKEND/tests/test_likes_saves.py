import pytest
from fastapi.testclient import TestClient
from .conftest import HEADERS


# ── LIKES ───────────────────────────────────────────────────────────────────

def test_get_likes_unauthenticated(client: TestClient):
    res = client.get("/api/v1/pins/1/likes", headers=HEADERS)
    assert res.status_code == 401


def test_toggle_like_unauthenticated(client: TestClient):
    res = client.post("/api/v1/pins/1/like", headers=HEADERS)
    assert res.status_code == 401


def test_toggle_like_csrf(auth_client: TestClient):
    res = auth_client.post("/api/v1/pins/1/like")
    assert res.status_code == 403


def test_get_likes_authenticated_pin_not_found(auth_client: TestClient):
    res = auth_client.get("/api/v1/pins/999999/likes", headers=HEADERS)
    assert res.status_code in (200, 404)


def test_get_likes_returns_schema(auth_client: TestClient):
    from io import BytesIO
    from .conftest import JPEG_BYTES
    # Crear un pin primero
    pin_res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Pin para likes"},
        headers=HEADERS,
    )
    assert pin_res.status_code == 201
    pin_id = pin_res.json()["id"]

    res = auth_client.get(f"/api/v1/pins/{pin_id}/likes", headers=HEADERS)
    assert res.status_code == 200
    body = res.json()
    assert "liked" in body
    assert "likes_count" in body
    assert isinstance(body["liked"], bool)
    assert isinstance(body["likes_count"], int)


def test_toggle_like_returns_schema(auth_client: TestClient):
    from io import BytesIO
    from .conftest import JPEG_BYTES
    pin_res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Pin toggle like"},
        headers=HEADERS,
    )
    pin_id = pin_res.json()["id"]

    res = auth_client.post(f"/api/v1/pins/{pin_id}/like", headers=HEADERS)
    assert res.status_code == 200
    body = res.json()
    assert body["liked"] is True
    assert body["likes_count"] == 1

    # Segunda vez — unlike
    res2 = auth_client.post(f"/api/v1/pins/{pin_id}/like", headers=HEADERS)
    assert res2.json()["liked"] is False
    assert res2.json()["likes_count"] == 0


# ── SAVES ────────────────────────────────────────────────────────────────────

def test_get_save_status_unauthenticated(client: TestClient):
    res = client.get("/api/v1/pins/1/save", headers=HEADERS)
    assert res.status_code == 401


def test_toggle_save_unauthenticated(client: TestClient):
    res = client.post("/api/v1/pins/1/save", headers=HEADERS)
    assert res.status_code == 401


def test_get_saved_pins_unauthenticated(client: TestClient):
    res = client.get("/api/v1/pins/saved", headers=HEADERS)
    assert res.status_code == 401


def test_get_saved_pins_authenticated_empty(auth_client: TestClient):
    res = auth_client.get("/api/v1/pins/saved", headers=HEADERS)
    assert res.status_code == 200
    body = res.json()
    assert "items" in body
    assert isinstance(body["items"], list)


def test_toggle_save_csrf(auth_client: TestClient):
    res = auth_client.post("/api/v1/pins/1/save")
    assert res.status_code == 403


def test_toggle_save_returns_saved_and_count(auth_client: TestClient):
    from io import BytesIO
    from .conftest import JPEG_BYTES
    pin_res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Pin para save"},
        headers=HEADERS,
    )
    pin_id = pin_res.json()["id"]

    res = auth_client.post(f"/api/v1/pins/{pin_id}/save", headers=HEADERS)
    assert res.status_code == 200
    body = res.json()
    assert "saved" in body
    assert "saves_count" in body
    assert body["saved"] is True
    assert body["saves_count"] == 1

    # Unsave
    res2 = auth_client.post(f"/api/v1/pins/{pin_id}/save", headers=HEADERS)
    assert res2.json()["saved"] is False
    assert res2.json()["saves_count"] == 0


def test_save_status_returns_bool(auth_client: TestClient):
    from io import BytesIO
    from .conftest import JPEG_BYTES
    pin_res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Pin save status"},
        headers=HEADERS,
    )
    pin_id = pin_res.json()["id"]

    res = auth_client.get(f"/api/v1/pins/{pin_id}/save", headers=HEADERS)
    assert res.status_code == 200
    assert "saved" in res.json()
    assert isinstance(res.json()["saved"], bool)
    assert res.json()["saved"] is False  # no guardado aún


def test_saved_pins_appear_after_save(auth_client: TestClient):
    from io import BytesIO
    from .conftest import JPEG_BYTES
    pin_res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Pin guardado test"},
        headers=HEADERS,
    )
    pin_id = pin_res.json()["id"]
    auth_client.post(f"/api/v1/pins/{pin_id}/save", headers=HEADERS)

    saved_res = auth_client.get("/api/v1/pins/saved", headers=HEADERS)
    saved_ids = [p["id"] for p in saved_res.json()["items"]]
    assert pin_id in saved_ids
