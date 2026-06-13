from typing import List, Optional

import sqlalchemy as sa
from sqlmodel import Session, select

from app.application.interfaces import ICommentRepository, ILikeRepository, IPinRepository, ISaveRepository, IUserRepository
from app.domain.models import Comment, Like, Pin, Save, User


class UserRepository(IUserRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        self._session.refresh(user)
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self._session.get(User, user_id)

    def get_by_email(self, correo: str) -> Optional[User]:
        statement = select(User).where(User.correo == correo)
        return self._session.exec(statement).first()


class PinRepository(IPinRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, pin: Pin) -> Pin:
        self._session.add(pin)
        self._session.commit()
        self._session.refresh(pin)
        return pin

    def get_by_id(self, pin_id: int) -> Optional[Pin]:
        return self._session.get(Pin, pin_id)

    def get_all(self, q: Optional[str] = None, autor_id: Optional[int] = None, offset: int = 0, limit: int = 20) -> tuple[List[Pin], int]:
        statement = select(Pin)
        count_statement = select(sa.func.count(Pin.id))
        if q:
            from sqlmodel import or_
            like_filter = or_(
                Pin.titulo.ilike(f"%{q}%"),
                Pin.descripcion.ilike(f"%{q}%"),
                Pin.categoria.ilike(f"%{q}%")
            )
            statement = statement.where(like_filter)
            count_statement = count_statement.where(like_filter)
        if autor_id:
            statement = statement.where(Pin.autor_id == autor_id)
            count_statement = count_statement.where(Pin.autor_id == autor_id)
        total = self._session.exec(count_statement).one()
        statement = statement.order_by(Pin.id.desc()).offset(offset).limit(limit)
        return list(self._session.exec(statement).all()), total

    def delete(self, pin: Pin) -> None:
        self._session.delete(pin)
        self._session.commit()

    def count_likes(self, pin_id: int) -> int:
        return self._session.exec(
            select(sa.func.count(Like.id)).where(Like.pin_id == pin_id)
        ).one()

    def count_saves(self, pin_id: int) -> int:
        return self._session.exec(
            select(sa.func.count(Save.id)).where(Save.pin_id == pin_id)
        ).one()


class CommentRepository(ICommentRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, comment: Comment) -> Comment:
        self._session.add(comment)
        self._session.commit()
        self._session.refresh(comment)
        return comment

    def get_by_pin_id(self, pin_id: int) -> List[Comment]:
        statement = select(Comment).where(Comment.pin_id == pin_id).order_by(Comment.creado_en.asc())
        return list(self._session.exec(statement).all())

    def get_by_id(self, comment_id: int) -> Optional[Comment]:
        return self._session.get(Comment, comment_id)

    def delete(self, comment: Comment) -> None:
        self._session.delete(comment)
        self._session.commit()


class LikeRepository(ILikeRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def toggle(self, user_id: int, pin_id: int) -> tuple[bool, int]:
        existing = self._session.exec(
            select(Like).where(Like.user_id == user_id, Like.pin_id == pin_id)
        ).first()
        if existing:
            self._session.delete(existing)
            self._session.commit()
            liked = False
        else:
            self._session.add(Like(user_id=user_id, pin_id=pin_id))
            self._session.commit()
            liked = True
        count = self._session.exec(
            select(sa.func.count(Like.id)).where(Like.pin_id == pin_id)
        ).one()
        return liked, count

    def is_liked(self, user_id: int, pin_id: int) -> bool:
        return self._session.exec(
            select(Like).where(Like.user_id == user_id, Like.pin_id == pin_id)
        ).first() is not None


class SaveRepository(ISaveRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def toggle(self, user_id: int, pin_id: int) -> bool:
        existing = self._session.exec(
            select(Save).where(Save.user_id == user_id, Save.pin_id == pin_id)
        ).first()
        if existing:
            self._session.delete(existing)
            saved = False
        else:
            self._session.add(Save(user_id=user_id, pin_id=pin_id))
            saved = True
        self._session.commit()
        return saved

    def is_saved(self, user_id: int, pin_id: int) -> bool:
        return self._session.exec(
            select(Save).where(Save.user_id == user_id, Save.pin_id == pin_id)
        ).first() is not None

    def get_saved_pin_ids(self, user_id: int) -> List[int]:
        return list(self._session.exec(
            select(Save.pin_id).where(Save.user_id == user_id).order_by(Save.creado_en.desc())
        ).all())
