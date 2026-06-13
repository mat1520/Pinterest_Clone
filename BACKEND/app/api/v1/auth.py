from fastapi import APIRouter, Depends

from app.application.services import AuthService
from app.core.dependencies import get_user_repository
from app.infrastructure.repositories import UserRepository
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserRead

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(user_repo)


@router.post("/register", response_model=UserRead, status_code=201)
def register(
    data: UserCreate, service: AuthService = Depends(get_auth_service)
) -> UserRead:
    user = service.register(data)
    return UserRead(
        id=user.id,
        nombre=user.nombre,
        correo=user.correo,
        fecha_nacimiento=user.fecha_nacimiento,
        creado_en=user.creado_en,
    )


@router.post("/login", response_model=Token)
def login(
    data: UserLogin, service: AuthService = Depends(get_auth_service)
) -> Token:
    return service.login(data)
