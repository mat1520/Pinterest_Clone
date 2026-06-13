from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.domain.models import User
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
