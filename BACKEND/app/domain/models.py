from datetime import date, datetime, timezone
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    correo: str = Field(max_length=255, unique=True, index=True)
    clave_hash: str
    fecha_nacimiento: date
    es_admin: bool = Field(default=False)
    creado_en: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    pines: List["Pin"] = Relationship(back_populates="autor")
    comentarios: List["Comment"] = Relationship(back_populates="autor")


class Pin(SQLModel, table=True):
    __tablename__ = "pins"

    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=200)
    descripcion: Optional[str] = Field(default=None)
    categoria: Optional[str] = Field(default=None, max_length=50)
    url_imagen: str
    autor_id: int = Field(foreign_key="users.id")
    creado_en: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    autor: Optional[User] = Relationship(back_populates="pines")
    comentarios: List["Comment"] = Relationship(
        back_populates="pin", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class Comment(SQLModel, table=True):
    __tablename__ = "comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    texto: str
    pin_id: int = Field(foreign_key="pins.id")
    autor_id: int = Field(foreign_key="users.id")
    creado_en: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    pin: Optional[Pin] = Relationship(back_populates="comentarios")
    autor: Optional[User] = Relationship(back_populates="comentarios")
