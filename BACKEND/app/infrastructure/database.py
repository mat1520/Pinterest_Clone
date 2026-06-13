from datetime import date
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine, select

from app.core.config import settings
from app.core.security import hash_password
from app.domain.models import User

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def create_tables() -> None:
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        statement = select(User).where(User.correo == settings.ADMIN_EMAIL)
        admin = session.exec(statement).first()
        if not admin:
            admin_user = User(
                nombre="Administrador",
                correo=settings.ADMIN_EMAIL,
                clave_hash=hash_password(settings.ADMIN_PASSWORD),
                fecha_nacimiento=date(2000, 1, 1),
                es_admin=True,
            )
            session.add(admin_user)
            session.commit()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
