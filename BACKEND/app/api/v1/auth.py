from fastapi import APIRouter, Depends, Request, Response

from app.application.services import AuthService
from app.core.config import settings
from app.core.dependencies import get_current_user, get_user_repository
from app.infrastructure.repositories import UserRepository
from app.core.limiter import limiter
from app.schemas.user import UserCreate, UserLogin, UserPublicRead

router = APIRouter(prefix="/auth", tags=["Auth"])

COOKIE_KWARGS = dict(
    key="access_token",
    httponly=True,
    secure=True,
    samesite="none",
    path="/",
)


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(user_repo)


@router.post("/register", response_model=UserPublicRead, status_code=201)
@limiter.limit("5/minute")
def register(
    request: Request,
    data: UserCreate,
    service: AuthService = Depends(get_auth_service),
) -> UserPublicRead:
    user = service.register(data)
    return UserPublicRead(
        id=user.id,
        nombre=user.nombre,
        correo=user.correo,
        fecha_nacimiento=user.fecha_nacimiento,
        creado_en=user.creado_en,
    )


@router.post("/login", status_code=200)
@limiter.limit("10/minute")
def login(
    request: Request,
    response: Response,
    data: UserLogin,
    service: AuthService = Depends(get_auth_service),
) -> dict:
    _user, token_obj = service.login(data)
    response.set_cookie(
        value=token_obj.access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **COOKIE_KWARGS,
    )
    return {"message": "Login exitoso"}


@router.post("/logout", status_code=200)
def logout(response: Response, _: object = Depends(get_current_user)) -> dict:
    response.delete_cookie(**COOKIE_KWARGS)
    return {"message": "Sesión cerrada"}
