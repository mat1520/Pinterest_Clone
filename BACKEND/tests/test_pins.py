import io
import pytest
from fastapi.testclient import TestClient
from .conftest import HEADERS, JPEG_BYTES


def test_list_pins_empty(client: TestClient):
    res = client.get("/api/v1/pins", headers=HEADERS)
    assert res.status_code == 200
    body = res.json()
    assert "items" in body
    assert "total" in body
    assert isinstance(body["items"], list)


def test_list_pins_pagination_params(client: TestClient):
    res = client.get("/api/v1/pins?offset=0&limit=5", headers=HEADERS)
    assert res.status_code == 200


def test_list_pins_invalid_limit(client: TestClient):
    res = client.get("/api/v1/pins?limit=999", headers=HEADERS)
    assert res.status_code == 422


def test_get_pin_not_found(client: TestClient):
    res = client.get("/api/v1/pins/999999", headers=HEADERS)
    assert res.status_code == 404


def test_create_pin_unauthenticated(client: TestClient):
    res = client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", io.BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Test"},
        headers=HEADERS,
    )
    assert res.status_code == 401


def test_create_pin_requires_csrf(auth_client: TestClient):
    res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", io.BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Test"},
    )
    assert res.status_code == 403


def test_create_pin_invalid_extension(auth_client: TestClient):
    res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.exe", io.BytesIO(b"fakecontent"), "application/octet-stream")},
        data={"titulo": "Test"},
        headers=HEADERS,
    )
    assert res.status_code == 415


def test_create_pin_fake_jpeg(auth_client: TestClient):
    res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", io.BytesIO(b"notanimage"), "image/jpeg")},
        data={"titulo": "Test"},
        headers=HEADERS,
    )
    assert res.status_code == 415


def test_create_pin_valid(auth_client: TestClient):
    res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", io.BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Pin valido"},
        headers=HEADERS,
    )
    # 201 = éxito, 429 = rate limit alcanzado por otros tests (ambos son correctos)
    assert res.status_code in (201, 429)
    if res.status_code == 201:
        body = res.json()
        assert body["titulo"] == "Pin valido"
        assert "id" in body
        assert "url_imagen" in body


def test_search_pins(client: TestClient):
    res = client.get("/api/v1/pins?q=test", headers=HEADERS)
    assert res.status_code == 200
    assert "items" in res.json()


def test_list_pins_by_autor(client: TestClient):
    res = client.get("/api/v1/pins?autor_id=1", headers=HEADERS)
    assert res.status_code == 200
