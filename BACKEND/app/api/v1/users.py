from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session

from app.core.dependencies import get_current_user, get_session
from app.core.exceptions import ForbiddenException
from app.domain.models import Pin, User
from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead(
        id=current_user.id,
        nombre=current_user.nombre,
        correo=current_user.correo,
        fecha_nacimiento=current_user.fecha_nacimiento,
        es_admin=current_user.es_admin,
        creado_en=current_user.creado_en,
    )


class PinSeedItem(BaseModel):
    titulo: str
    url_imagen: str
    autor_id: int
    descripcion: Optional[str] = None
    categoria: Optional[str] = None


@router.post("/admin/seed-pins", status_code=201)
def seed_pins(
    items: List[PinSeedItem],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> dict:
    if not current_user.es_admin:
        raise ForbiddenException()
    inserted = 0
    for item in items:
        pin = Pin(
            titulo=item.titulo,
            url_imagen=item.url_imagen,
            autor_id=item.autor_id,
            descripcion=item.descripcion,
            categoria=item.categoria,
        )
        session.add(pin)
        inserted += 1
    session.commit()
    return {"inserted": inserted}
