from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.models import Comment, Like, Pin, Save, User


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
    def get_all(self, q: Optional[str] = None, autor_id: Optional[int] = None, offset: int = 0, limit: int = 20) -> tuple[List[Pin], int]: ...

    @abstractmethod
    def get_categories(self) -> List[str]: ...

    @abstractmethod
    def delete(self, pin: Pin) -> None: ...

    @abstractmethod
    def count_likes(self, pin_id: int) -> int: ...

    @abstractmethod
    def count_saves(self, pin_id: int) -> int: ...


class ICommentRepository(ABC):
    @abstractmethod
    def create(self, comment: Comment) -> Comment: ...

    @abstractmethod
    def get_by_pin_id(self, pin_id: int) -> List[Comment]: ...

    @abstractmethod
    def get_by_id(self, comment_id: int) -> Optional[Comment]: ...

    @abstractmethod
    def delete(self, comment: Comment) -> None: ...


class ILikeRepository(ABC):
    @abstractmethod
    def toggle(self, user_id: int, pin_id: int) -> tuple[bool, int]: ...

    @abstractmethod
    def is_liked(self, user_id: int, pin_id: int) -> bool: ...


class ISaveRepository(ABC):
    @abstractmethod
    def toggle(self, user_id: int, pin_id: int) -> bool: ...

    @abstractmethod
    def is_saved(self, user_id: int, pin_id: int) -> bool: ...

    @abstractmethod
    def get_saved_pin_ids(self, user_id: int) -> List[int]: ...


class IStorageService(ABC):
    @abstractmethod
    def upload(self, file_name: str, file_content: bytes, content_type: str) -> str: ...

    @abstractmethod
    def get_presigned_url(self, object_key: str) -> str: ...

    @abstractmethod
    def delete(self, object_key: str) -> None: ...
