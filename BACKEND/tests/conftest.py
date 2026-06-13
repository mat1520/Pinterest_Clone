import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-secret-key-32chars-minimum!!"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"
os.environ["AWS_ACCESS_KEY_ID"] = "test"
os.environ["AWS_SECRET_ACCESS_KEY"] = "test"
os.environ["AWS_REGION"] = "us-east-1"
os.environ["AWS_S3_BUCKET"] = "test-bucket"
os.environ["PRESIGNED_URL_EXPIRATION"] = "3600"
os.environ["ADMIN_EMAIL"] = "admin@test.com"
os.environ["ADMIN_PASSWORD"] = "Admin1234!"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173"

import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from unittest.mock import MagicMock

from app.domain.models import User
from app.core.security import hash_password

TEST_DB_URL = "sqlite://"
HEADERS = {"X-Requested-With": "XMLHttpRequest"}

USER_DATA = {
    "nombre": "Tester",
    "correo": "tester@example.com",
    "clave": "Tester1234!",
    "fecha_nacimiento": "2000-01-01",
}

JPEG_BYTES = b"\xff\xd8\xff\xe0" + b"\x00" * 14 + b"\xff\xd9"


def _make_user(id: int = 1, correo: str = "u@test.com", es_admin: bool = False) -> User:
    return User(
        id=id,
        nombre="Test User",
        correo=correo,
        clave_hash=hash_password("Test1234!"),
        fecha_nacimiento=date(2000, 1, 1),
        es_admin=es_admin,
    )


@pytest.fixture(name="engine", scope="session")
def engine_fixture():
    engine = create_engine(
        TEST_DB_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine


@pytest.fixture(name="client")
def client_fixture(engine):
    from app.main import app
    from app.infrastructure.database import get_session
    from app.core.dependencies import get_storage_service

    def get_session_override():
        with Session(engine) as session:
            yield session

    mock_storage = MagicMock()
    mock_storage.upload.return_value = "test-key.jpg"
    mock_storage.get_presigned_url.return_value = "https://example.com/test-key.jpg"
    mock_storage.delete.return_value = None

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_storage_service] = lambda: mock_storage

    with TestClient(app, raise_server_exceptions=True) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture(name="auth_client")
def auth_client_fixture(engine):
    """Client autenticado directamente via JWT — sin tocar rate limiter."""
    from app.main import app
    from app.infrastructure.database import get_session
    from app.core.dependencies import get_storage_service, get_current_user
    from app.core.security import create_access_token

    def get_session_override():
        with Session(engine) as session:
            yield session

    mock_storage = MagicMock()
    mock_storage.upload.return_value = "test-key.jpg"
    mock_storage.get_presigned_url.return_value = "https://example.com/test-key.jpg"
    mock_storage.delete.return_value = None

    # Crear usuario en la DB de test
    with Session(engine) as session:
        existing = session.get(User, 999)
        if not existing:
            u = User(
                id=999,
                nombre="Auth Tester",
                correo="auth@test.com",
                clave_hash=hash_password("Auth1234!"),
                fecha_nacimiento=date(2000, 1, 1),
                es_admin=False,
            )
            session.add(u)
            session.commit()

    auth_user = _make_user(id=999, correo="auth@test.com")

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_storage_service] = lambda: mock_storage
    app.dependency_overrides[get_current_user] = lambda: auth_user

    with TestClient(app, raise_server_exceptions=True) as c:
        yield c

    app.dependency_overrides.clear()
