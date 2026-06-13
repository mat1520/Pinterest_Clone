from datetime import date
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine, select

from app.core.config import settings
from app.domain.models import User
from app.core.security import hash_password

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def create_tables() -> None:
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        statement = select(User).where(User.correo == "admin@pinterest.ec")
        admin = session.exec(statement).first()
        if not admin:
            admin_user = User(
                nombre="Administrador",
                correo="admin@pinterest.ec",
                clave_hash=hash_password("admin202610"),
                fecha_nacimiento=date(2000, 1, 1),
                es_admin=True,
            )
            session.add(admin_user)
            session.commit()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
