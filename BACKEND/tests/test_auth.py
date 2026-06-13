import pytest
from fastapi.testclient import TestClient
from .conftest import HEADERS, USER_DATA


def test_register_success(client: TestClient):
    res = client.post("/api/v1/auth/register", json={
        **USER_DATA, "correo": "reg_ok@auth-test.com"
    }, headers=HEADERS)
    assert res.status_code == 201
    body = res.json()
    assert body["correo"] == "reg_ok@auth-test.com"
    assert "clave_hash" not in body
    assert "clave" not in body


def test_register_duplicate_email(client: TestClient):
    data = {**USER_DATA, "correo": "dup@auth-test.com"}
    client.post("/api/v1/auth/register", json=data, headers=HEADERS)
    res = client.post("/api/v1/auth/register", json=data, headers=HEADERS)
    assert res.status_code == 409


def test_register_invalid_email(client: TestClient):
    res = client.post("/api/v1/auth/register", json={
        **USER_DATA, "correo": "not-an-email"
    }, headers=HEADERS)
    assert res.status_code == 422


def test_register_weak_password(client: TestClient):
    res = client.post("/api/v1/auth/register", json={
        **USER_DATA, "correo": "weak@auth-test.com", "clave": "1234"
    }, headers=HEADERS)
    assert res.status_code == 422


def test_register_underage(client: TestClient):
    res = client.post("/api/v1/auth/register", json={
        **USER_DATA, "correo": "young@auth-test.com", "fecha_nacimiento": "2020-01-01"
    }, headers=HEADERS)
    assert res.status_code == 422


def test_login_wrong_password(client: TestClient):
    correo = "wrongpw@auth-test.com"
    client.post("/api/v1/auth/register", json={**USER_DATA, "correo": correo}, headers=HEADERS)
    res = client.post("/api/v1/auth/login", json={"correo": correo, "clave": "WrongPass1!"}, headers=HEADERS)
    assert res.status_code == 401


def test_login_nonexistent_user(client: TestClient):
    res = client.post("/api/v1/auth/login", json={"correo": "ghost@auth-test.com", "clave": "Any1234!"}, headers=HEADERS)
    assert res.status_code == 401


def test_get_me_authenticated(auth_client: TestClient):
    res = auth_client.get("/api/v1/users/me", headers=HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert "correo" in data
    assert "clave_hash" not in data


def test_get_me_unauthenticated(client: TestClient):
    res = client.get("/api/v1/users/me", headers=HEADERS)
    assert res.status_code == 401


def test_logout(auth_client: TestClient):
    res = auth_client.post("/api/v1/auth/logout", headers=HEADERS)
    assert res.status_code == 200


def test_csrf_blocked_without_header(client: TestClient):
    res = client.post("/api/v1/auth/login", json={"correo": "a@b.com", "clave": "pass"})
    assert res.status_code == 403
