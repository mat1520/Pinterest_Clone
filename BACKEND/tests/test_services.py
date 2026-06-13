"""Unit tests para services usando mocks — sin base de datos."""
from unittest.mock import MagicMock, patch
import pytest
from datetime import date

from app.application.services import AuthService, PinService, LikeService, SaveService, CommentService
from app.core.exceptions import ConflictException, NotFoundException, ForbiddenException, UnauthorizedException
from app.domain.models import User, Pin, Comment
from app.schemas.user import UserCreate, UserLogin


def _make_user(id=1, es_admin=False) -> User:
    return User(
        id=id,
        nombre="Test",
        correo="t@t.com",
        clave_hash="$2b$12$fakehash",
        fecha_nacimiento=date(2000, 1, 1),
        es_admin=es_admin,
    )


def _make_pin(id=1, autor_id=1) -> Pin:
    return Pin(id=id, titulo="Pin", url_imagen="key.jpg", autor_id=autor_id)


# ── AuthService ──────────────────────────────────────────────────────────────

def test_register_conflict():
    repo = MagicMock()
    repo.get_by_email.return_value = _make_user()
    svc = AuthService(repo)
    data = UserCreate(nombre="Existing", correo="x@x.com", clave="Valid1234!", fecha_nacimiento=date(2000, 1, 1))
    with pytest.raises(ConflictException):
        svc.register(data)


def test_register_success():
    repo = MagicMock()
    repo.get_by_email.return_value = None
    new_user = _make_user()
    repo.create.return_value = new_user
    svc = AuthService(repo)
    data = UserCreate(nombre="Nuevo", correo="nuevo@x.com", clave="Valid1234!", fecha_nacimiento=date(2000, 1, 1))
    result = svc.register(data)
    assert result == new_user
    repo.create.assert_called_once()


def test_login_wrong_creds():
    repo = MagicMock()
    repo.get_by_email.return_value = None
    svc = AuthService(repo)
    data = UserLogin(correo="x@x.com", clave="wrong")
    with pytest.raises(UnauthorizedException):
        svc.login(data)


# ── PinService ───────────────────────────────────────────────────────────────

def test_get_by_id_not_found():
    repo = MagicMock()
    repo.get_by_id.return_value = None
    svc = PinService(repo, MagicMock())
    with pytest.raises(NotFoundException):
        svc.get_by_id(999)


def test_find_by_id_returns_none():
    repo = MagicMock()
    repo.get_by_id.return_value = None
    svc = PinService(repo, MagicMock())
    assert svc.find_by_id(999) is None


def test_delete_pin_not_owner():
    repo = MagicMock()
    pin = _make_pin(autor_id=2)
    repo.get_by_id.return_value = pin
    svc = PinService(repo, MagicMock())
    user = _make_user(id=1, es_admin=False)
    with pytest.raises(ForbiddenException):
        svc.delete(pin_id=1, user=user)


def test_delete_pin_admin_can_delete_any():
    repo = MagicMock()
    storage = MagicMock()
    pin = _make_pin(autor_id=2)
    repo.get_by_id.return_value = pin
    svc = PinService(repo, storage)
    admin = _make_user(id=99, es_admin=True)
    svc.delete(pin_id=1, user=admin)
    repo.delete.assert_called_once_with(pin)


def test_delete_pin_owner():
    repo = MagicMock()
    storage = MagicMock()
    pin = _make_pin(autor_id=1)
    repo.get_by_id.return_value = pin
    svc = PinService(repo, storage)
    owner = _make_user(id=1)
    svc.delete(pin_id=1, user=owner)
    repo.delete.assert_called_once_with(pin)


# ── LikeService ──────────────────────────────────────────────────────────────

def test_like_toggle_delegates():
    repo = MagicMock()
    repo.toggle.return_value = (True, 1)
    svc = LikeService(repo)
    liked, count = svc.toggle(user_id=1, pin_id=1)
    assert liked is True
    assert count == 1


def test_is_liked_delegates():
    repo = MagicMock()
    repo.is_liked.return_value = True
    svc = LikeService(repo)
    assert svc.is_liked(1, 1) is True


# ── SaveService ───────────────────────────────────────────────────────────────

def test_save_toggle_delegates():
    repo = MagicMock()
    repo.toggle.return_value = True
    svc = SaveService(repo)
    assert svc.toggle(1, 1) is True


def test_is_saved_delegates():
    repo = MagicMock()
    repo.is_saved.return_value = False
    svc = SaveService(repo)
    assert svc.is_saved(1, 1) is False


def test_get_saved_ids():
    repo = MagicMock()
    repo.get_saved_pin_ids.return_value = [3, 7, 12]
    svc = SaveService(repo)
    assert svc.get_saved_pin_ids(1) == [3, 7, 12]


# ── CommentService ────────────────────────────────────────────────────────────

def test_create_comment_pin_not_found():
    comment_repo = MagicMock()
    pin_repo = MagicMock()
    pin_repo.get_by_id.return_value = None
    svc = CommentService(comment_repo, pin_repo)
    with pytest.raises(NotFoundException):
        svc.create("hola", pin_id=999, autor_id=1)


def test_delete_comment_not_owner():
    comment_repo = MagicMock()
    pin_repo = MagicMock()
    comment = Comment(id=1, texto="x", pin_id=1, autor_id=2)
    comment_repo.get_by_id.return_value = comment
    svc = CommentService(comment_repo, pin_repo)
    user = _make_user(id=1, es_admin=False)
    with pytest.raises(ForbiddenException):
        svc.delete(comment_id=1, user=user)


def test_delete_comment_owner():
    comment_repo = MagicMock()
    pin_repo = MagicMock()
    comment = Comment(id=1, texto="x", pin_id=1, autor_id=1)
    comment_repo.get_by_id.return_value = comment
    svc = CommentService(comment_repo, pin_repo)
    owner = _make_user(id=1)
    svc.delete(comment_id=1, user=owner)
    comment_repo.delete.assert_called_once_with(comment)
