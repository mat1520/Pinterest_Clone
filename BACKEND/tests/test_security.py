import pytest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


def test_hash_is_not_plaintext():
    pw = "MySecret123!"
    hashed = hash_password(pw)
    assert hashed != pw
    assert len(hashed) > 20


def test_verify_correct_password():
    pw = "MySecret123!"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed) is True


def test_verify_wrong_password():
    hashed = hash_password("correct")
    assert verify_password("wrong", hashed) is False


def test_hashes_are_unique():
    pw = "SamePassword1!"
    h1 = hash_password(pw)
    h2 = hash_password(pw)
    assert h1 != h2


def test_token_roundtrip():
    token = create_access_token(subject=42)
    assert isinstance(token, str)
    user_id = decode_access_token(token)
    assert user_id == 42


def test_decode_invalid_token():
    result = decode_access_token("not.a.token")
    assert result is None


def test_decode_tampered_token():
    token = create_access_token(subject=1)
    tampered = token[:-5] + "XXXXX"
    assert decode_access_token(tampered) is None


def test_password_truncation_at_72():
    pw_72 = "A" * 72 + "extra"
    pw_base = "A" * 72
    h = hash_password(pw_72)
    assert verify_password(pw_base, h) is True


def test_csrf_middleware_blocks_post(client):
    from fastapi.testclient import TestClient
    res = client.post("/api/v1/auth/login", json={"correo": "a@b.com", "clave": "x"})
    assert res.status_code == 403


def test_csrf_allows_get_without_header(client):
    res = client.get("/api/v1/pins")
    assert res.status_code == 200
