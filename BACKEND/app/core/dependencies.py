from typing import Optional

from fastapi import Cookie, Depends
from sqlmodel import Session

from app.application.interfaces import IStorageService
from app.core.audit_log import log_token_invalid
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.domain.models import User
from app.infrastructure.database import get_session
from app.infrastructure.repositories import CommentRepository, LikeRepository, PinRepository, SaveRepository, UserRepository
from app.infrastructure.storage_service import get_storage_service as get_s3_service


def get_user_repository(session: Session = Depends(get_session)) -> UserRepository:
    return UserRepository(session)


def get_pin_repository(session: Session = Depends(get_session)) -> PinRepository:
    return PinRepository(session)


def get_comment_repository(session: Session = Depends(get_session)) -> CommentRepository:
    return CommentRepository(session)


def get_like_repository(session: Session = Depends(get_session)) -> LikeRepository:
    return LikeRepository(session)


def get_save_repository(session: Session = Depends(get_session)) -> SaveRepository:
    return SaveRepository(session)


def get_storage_service() -> IStorageService:
    return get_s3_service()


def get_current_user(
    access_token: Optional[str] = Cookie(default=None),
    session: Session = Depends(get_session),
) -> User:
    if access_token is None:
        log_token_invalid("cookie ausente")
        raise UnauthorizedException(detail="No autenticado")
    user_id = decode_access_token(access_token)
    if user_id is None:
        log_token_invalid("token inválido o expirado")
        raise UnauthorizedException(detail="Token inválido o expirado")
    user = session.get(User, user_id)
    if user is None:
        log_token_invalid(f"user_id {user_id} no encontrado")
        raise UnauthorizedException(detail="Usuario no encontrado")
    return user
