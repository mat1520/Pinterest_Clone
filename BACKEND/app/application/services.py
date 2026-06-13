from typing import List

from app.application.interfaces import (
    ICommentRepository,
    IPinRepository,
    IStorageService,
    IUserRepository,
)
from app.core.exceptions import ConflictException, NotFoundException, UnauthorizedException
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

    def login(self, data: UserLogin) -> Token:
        user = self._user_repo.get_by_email(data.correo)
        if not user or not verify_password(data.clave, user.clave_hash):
            raise UnauthorizedException(detail="Credenciales invalidas")
        token = create_access_token(subject=user.id)
        return Token(access_token=token)


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

    def get_all(self, q: str = None, autor_id: int = None) -> List[Pin]:
        return self._pin_repo.get_all(q=q, autor_id=autor_id)

    def resolve_url(self, object_key: str) -> str:
        return self._storage.get_presigned_url(object_key)

    def delete(self, pin_id: int, user: User) -> None:
        pin = self.get_by_id(pin_id)
        if pin.autor_id != user.id and not user.es_admin:
            raise UnauthorizedException(detail="No tienes permiso para eliminar este pin")
        self._storage.delete(pin.url_imagen)
        self._pin_repo.delete(pin)


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
