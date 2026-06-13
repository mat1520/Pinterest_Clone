import pytest
from fastapi.testclient import TestClient
from .conftest import HEADERS


def test_get_comments_empty(auth_client: TestClient):
    from io import BytesIO
    from .conftest import JPEG_BYTES
    pin_res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Pin comentarios"},
        headers=HEADERS,
    )
    pin_id = pin_res.json()["id"]
    res = auth_client.get(f"/api/v1/pins/{pin_id}/comments", headers=HEADERS)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert res.json() == []


def test_create_comment_success(auth_client: TestClient):
    from io import BytesIO
    from .conftest import JPEG_BYTES
    pin_res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Pin con comentario"},
        headers=HEADERS,
    )
    pin_id = pin_res.json()["id"]
    res = auth_client.post(f"/api/v1/pins/{pin_id}/comments", json={"texto": "Comentario!"}, headers=HEADERS)
    assert res.status_code == 201
    assert res.json()["texto"] == "Comentario!"


def test_create_comment_unauthenticated(client: TestClient):
    res = client.post("/api/v1/pins/1/comments", json={"texto": "hola"}, headers=HEADERS)
    assert res.status_code == 401


def test_create_comment_csrf(auth_client: TestClient):
    res = auth_client.post("/api/v1/pins/1/comments", json={"texto": "hola"})
    assert res.status_code == 403


def test_create_comment_pin_not_found(auth_client: TestClient):
    res = auth_client.post("/api/v1/pins/999999/comments", json={"texto": "hola"}, headers=HEADERS)
    assert res.status_code == 404


def test_create_comment_empty_text(auth_client: TestClient):
    res = auth_client.post("/api/v1/pins/1/comments", json={"texto": ""}, headers=HEADERS)
    assert res.status_code == 422


def test_delete_comment_unauthenticated(client: TestClient):
    res = client.delete("/api/v1/pins/1/comments/1", headers=HEADERS)
    assert res.status_code == 401


def test_delete_comment_not_found(auth_client: TestClient):
    res = auth_client.delete("/api/v1/pins/1/comments/999999", headers=HEADERS)
    assert res.status_code == 404


def test_delete_own_comment(auth_client: TestClient):
    from io import BytesIO
    from .conftest import JPEG_BYTES
    pin_res = auth_client.post(
        "/api/v1/pins",
        files={"archivo": ("img.jpg", BytesIO(JPEG_BYTES), "image/jpeg")},
        data={"titulo": "Pin del que borro comentario"},
        headers=HEADERS,
    )
    pin_id = pin_res.json()["id"]
    comment_res = auth_client.post(f"/api/v1/pins/{pin_id}/comments", json={"texto": "Borrame"}, headers=HEADERS)
    comment_id = comment_res.json()["id"]
    del_res = auth_client.delete(f"/api/v1/pins/{pin_id}/comments/{comment_id}", headers=HEADERS)
    assert del_res.status_code == 204
