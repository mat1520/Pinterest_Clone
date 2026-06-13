from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.models import Comment, Pin, User


class IUserRepository(ABC):
    @abstractmethod
    def create(self, user: User) -> User: ...

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]: ...

    @abstractmethod
    def get_by_email(self, correo: str) -> Optional[User]: ...


class IPinRepository(ABC):
    @abstractmethod
    def create(self, pin: Pin) -> Pin: ...

    @abstractmethod
    def get_by_id(self, pin_id: int) -> Optional[Pin]: ...

    @abstractmethod
    def get_all(self, q: Optional[str] = None, autor_id: Optional[int] = None) -> List[Pin]: ...

    @abstractmethod
    def delete(self, pin: Pin) -> None: ...


class ICommentRepository(ABC):
    @abstractmethod
    def create(self, comment: Comment) -> Comment: ...

    @abstractmethod
    def get_by_pin_id(self, pin_id: int) -> List[Comment]: ...


class IStorageService(ABC):
    @abstractmethod
    def upload(self, file_name: str, file_content: bytes, content_type: str) -> str:
        ...

    @abstractmethod
    def get_presigned_url(self, object_key: str) -> str:
        ...

    @abstractmethod
    def delete(self, object_key: str) -> None:
        ...
