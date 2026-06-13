from typing import List, Optional

from sqlmodel import Session, select

from app.application.interfaces import ICommentRepository, IPinRepository, IUserRepository
from app.domain.models import Comment, Pin, User


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

    def get_all(self, q: Optional[str] = None, autor_id: Optional[int] = None) -> List[Pin]:
        statement = select(Pin)
        if q:
            from sqlmodel import or_
            statement = statement.where(
                or_(
                    Pin.titulo.ilike(f"%{q}%"),
                    Pin.descripcion.ilike(f"%{q}%"),
                    Pin.categoria.ilike(f"%{q}%")
                )
            )
        if autor_id:
            statement = statement.where(Pin.autor_id == autor_id)
        statement = statement.order_by(Pin.id.desc())
        return list(self._session.exec(statement).all())

    def delete(self, pin: Pin) -> None:
        self._session.delete(pin)
        self._session.commit()


class CommentRepository(ICommentRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, comment: Comment) -> Comment:
        self._session.add(comment)
        self._session.commit()
        self._session.refresh(comment)
        return comment

    def get_by_pin_id(self, pin_id: int) -> List[Comment]:
        statement = select(Comment).where(Comment.pin_id == pin_id)
        return list(self._session.exec(statement).all())
