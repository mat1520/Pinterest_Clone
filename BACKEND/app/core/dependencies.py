from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.application.interfaces import IStorageService
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.domain.models import User
from app.infrastructure.database import get_session
from app.infrastructure.repositories import CommentRepository, PinRepository, UserRepository
from app.infrastructure.storage_service import AWSS3StorageService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_user_repository(
    session: Session = Depends(get_session),
) -> UserRepository:
    return UserRepository(session)


def get_pin_repository(
    session: Session = Depends(get_session),
) -> PinRepository:
    return PinRepository(session)


def get_comment_repository(
    session: Session = Depends(get_session),
) -> CommentRepository:
    return CommentRepository(session)


def get_storage_service() -> IStorageService:
    return AWSS3StorageService()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    user_id = decode_access_token(token)
    if user_id is None:
        raise UnauthorizedException(detail="Token invalido o expirado")
    user = session.get(User, user_id)
    if user is None:
        raise UnauthorizedException(detail="Usuario no encontrado")
    return user
