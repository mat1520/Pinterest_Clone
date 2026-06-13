from typing import List

from app.application.interfaces import (
    ICommentRepository,
    ILikeRepository,
    IPinRepository,
    ISaveRepository,
    IStorageService,
    IUserRepository,
)
from app.core.audit_log import (
    log_delete_pin,
    log_login_failure,
    log_login_success,
    log_unauthorized_delete_attempt,
)
from app.core.exceptions import ConflictException, ForbiddenException, NotFoundException, UnauthorizedException
from app.core.security import create_access_token, hash_password, verify_password
from app.domain.models import Comment, Pin, User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin


class AuthService:
    def __init__(self, user_repo: IUserRepository) -> None:
        self._user_repo = user_repo

    def register(self, data: UserCreate) -> User:
        existing = self._user_repo.get_by_email(data.correo)
        if existing:
            raise ConflictException(detail="El correo ya esta registrado")
        user = User(
            nombre=data.nombre,
            correo=data.correo,
            clave_hash=hash_password(data.clave),
            fecha_nacimiento=data.fecha_nacimiento,
        )
        return self._user_repo.create(user)

    def login(self, data: UserLogin) -> tuple[User, Token]:
        user = self._user_repo.get_by_email(data.correo)
        if not user or not verify_password(data.clave, user.clave_hash):
            log_login_failure(data.correo)
            raise UnauthorizedException(detail="Credenciales invalidas")
        log_login_success(user.id, user.correo)
        token = create_access_token(subject=user.id)
        return user, Token(access_token=token)


class PinService:
    def __init__(
        self, pin_repo: IPinRepository, storage: IStorageService
    ) -> None:
        self._pin_repo = pin_repo
        self._storage = storage

    def create(
        self, titulo: str, file_name: str, file_content: bytes,
        content_type: str, autor_id: int, descripcion: str = None,
        categoria: str = None
    ) -> Pin:
        object_key = self._storage.upload(file_name, file_content, content_type)
        pin = Pin(
            titulo=titulo,
            url_imagen=object_key,
            autor_id=autor_id,
            descripcion=descripcion,
            categoria=categoria,
        )
        return self._pin_repo.create(pin)

    def get_by_id(self, pin_id: int) -> Pin:
        pin = self._pin_repo.get_by_id(pin_id)
        if not pin:
            raise NotFoundException(detail="Pin no encontrado")
        return pin

    def get_all(self, q: str = None, autor_id: int = None, offset: int = 0, limit: int = 20) -> tuple[List[Pin], int]:
        return self._pin_repo.get_all(q=q, autor_id=autor_id, offset=offset, limit=limit)

    def resolve_url(self, object_key: str) -> str:
        return self._storage.get_presigned_url(object_key)

    def delete(self, pin_id: int, user: User) -> None:
        pin = self.get_by_id(pin_id)
        if pin.autor_id != user.id and not user.es_admin:
            log_unauthorized_delete_attempt(user.id, pin_id)
            raise ForbiddenException(detail="No tienes permiso para eliminar este pin")
        log_delete_pin(user.id, pin_id, user.es_admin)
        self._storage.delete(pin.url_imagen)
        self._pin_repo.delete(pin)

    def get_likes_count(self, pin_id: int) -> int:
        return self._pin_repo.count_likes(pin_id)

    def get_saves_count(self, pin_id: int) -> int:
        return self._pin_repo.count_saves(pin_id)


class CommentService:
    def __init__(
        self, comment_repo: ICommentRepository, pin_repo: IPinRepository
    ) -> None:
        self._comment_repo = comment_repo
        self._pin_repo = pin_repo

    def create(self, texto: str, pin_id: int, autor_id: int) -> Comment:
        pin = self._pin_repo.get_by_id(pin_id)
        if not pin:
            raise NotFoundException(detail="Pin no encontrado")
        comment = Comment(texto=texto, pin_id=pin_id, autor_id=autor_id)
        return self._comment_repo.create(comment)

    def get_by_pin_id(self, pin_id: int) -> List[Comment]:
        return self._comment_repo.get_by_pin_id(pin_id)

    def delete(self, comment_id: int, user: User) -> None:
        comment = self._comment_repo.get_by_id(comment_id)
        if not comment:
            raise NotFoundException(detail="Comentario no encontrado")
        if comment.autor_id != user.id and not user.es_admin:
            raise ForbiddenException(detail="No tienes permiso para eliminar este comentario")
        self._comment_repo.delete(comment)


class LikeService:
    def __init__(self, like_repo: ILikeRepository) -> None:
        self._like_repo = like_repo

    def toggle(self, user_id: int, pin_id: int) -> tuple[bool, int]:
        return self._like_repo.toggle(user_id, pin_id)

    def is_liked(self, user_id: int, pin_id: int) -> bool:
        return self._like_repo.is_liked(user_id, pin_id)


class SaveService:
    def __init__(self, save_repo: ISaveRepository) -> None:
        self._save_repo = save_repo

    def toggle(self, user_id: int, pin_id: int) -> bool:
        return self._save_repo.toggle(user_id, pin_id)

    def get_saved_pin_ids(self, user_id: int) -> List[int]:
        return self._save_repo.get_saved_pin_ids(user_id)
