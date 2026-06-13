from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Path, Query, Request, UploadFile, status

from app.application.interfaces import IStorageService
from app.application.services import LikeService, PinService, SaveService
from app.core.dependencies import get_current_user, get_like_repository, get_pin_repository, get_save_repository, get_storage_service
from app.core.limiter import limiter
from app.domain.models import User
from app.infrastructure.repositories import LikeRepository, PinRepository, SaveRepository
from app.schemas.pin import PinListResponse, PinRead

router = APIRouter(prefix="/pins", tags=["Pins"])

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def _detect_mime(content: bytes) -> Optional[str]:
    if content[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if content[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if content[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return "image/webp"
    return None


def get_pin_service(
    pin_repo: PinRepository = Depends(get_pin_repository),
    storage: IStorageService = Depends(get_storage_service),
) -> PinService:
    return PinService(pin_repo, storage)


def get_like_service(
    like_repo: LikeRepository = Depends(get_like_repository),
) -> LikeService:
    return LikeService(like_repo)


def get_save_service(
    save_repo: SaveRepository = Depends(get_save_repository),
) -> SaveService:
    return SaveService(save_repo)


def _to_read(pin, service: PinService, autor_nombre: str, likes_count: int = 0, saves_count: int = 0) -> PinRead:
    return PinRead(
        id=pin.id,
        titulo=pin.titulo,
        descripcion=pin.descripcion,
        categoria=pin.categoria,
        url_imagen=service.resolve_url(pin.url_imagen),
        autor_id=pin.autor_id,
        creado_en=pin.creado_en,
        autor_nombre=autor_nombre,
        likes_count=likes_count,
        saves_count=saves_count,
    )


def validate_image_file(archivo: UploadFile) -> tuple[bytes, str]:
    content = archivo.file.read(MAX_FILE_SIZE_BYTES + 1)

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="La imagen no puede superar los 10 MB.",
        )

    file_name = archivo.filename or "upload.jpg"
    extension = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else ""

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Extensión no permitida. Formatos aceptados: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    detected_mime = _detect_mime(content)

    if detected_mime is None or detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="El contenido del archivo no corresponde a una imagen válida.",
        )

    return content, detected_mime


@router.get("", response_model=PinListResponse)
def list_pins(
    q: Annotated[Optional[str], Query(max_length=100)] = None,
    autor_id: Annotated[Optional[int], Query(gt=0)] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    service: PinService = Depends(get_pin_service),
) -> PinListResponse:
    pins, total = service.get_all(q=q, autor_id=autor_id, offset=offset, limit=limit)
    items = [
        _to_read(
            pin, service, pin.autor.nombre if pin.autor else "",
            likes_count=service.get_likes_count(pin.id),
            saves_count=service.get_saves_count(pin.id),
        )
        for pin in pins
    ]
    return PinListResponse(items=items, total=total, offset=offset, limit=limit)


@router.get("/saved", response_model=PinListResponse)
def get_saved_pins(
    current_user: User = Depends(get_current_user),
    save_service: SaveService = Depends(get_save_service),
    pin_service: PinService = Depends(get_pin_service),
) -> PinListResponse:
    saved_ids = save_service.get_saved_pin_ids(current_user.id)
    pins = []
    for pid in saved_ids:
        pin = pin_service.find_by_id(pid)
        if pin:
            pins.append(_to_read(
                pin, pin_service, pin.autor.nombre if pin.autor else "",
                likes_count=pin_service.get_likes_count(pin.id),
                saves_count=pin_service.get_saves_count(pin.id),
            ))
    return PinListResponse(items=pins, total=len(pins), offset=0, limit=len(pins))


@router.get("/{pin_id}", response_model=PinRead)
def get_pin(
    pin_id: Annotated[int, Path(gt=0)],
    service: PinService = Depends(get_pin_service),
) -> PinRead:
    pin = service.get_by_id(pin_id)
    return _to_read(
        pin, service, pin.autor.nombre if pin.autor else "",
        likes_count=service.get_likes_count(pin.id),
        saves_count=service.get_saves_count(pin.id),
    )


@router.post("", response_model=PinRead, status_code=201)
@limiter.limit("10/minute")
def create_pin(
    request: Request,
    titulo: Annotated[str, Form(min_length=1, max_length=100)],
    descripcion: Annotated[Optional[str], Form(max_length=500)] = None,
    categoria: Annotated[Optional[str], Form(max_length=50)] = None,
    archivo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: PinService = Depends(get_pin_service),
) -> PinRead:
    file_content, detected_mime = validate_image_file(archivo)
    pin = service.create(
        titulo=titulo,
        descripcion=descripcion,
        categoria=categoria,
        file_name=archivo.filename or "upload.jpg",
        file_content=file_content,
        content_type=detected_mime,
        autor_id=current_user.id,
    )
    return _to_read(pin, service, current_user.nombre)


@router.delete("/{pin_id}", status_code=204)
def delete_pin(
    pin_id: Annotated[int, Path(gt=0)],
    current_user: User = Depends(get_current_user),
    service: PinService = Depends(get_pin_service),
) -> None:
    service.delete(pin_id=pin_id, user=current_user)


@router.post("/{pin_id}/like")
def toggle_like(
    pin_id: Annotated[int, Path(gt=0)],
    current_user: User = Depends(get_current_user),
    service: LikeService = Depends(get_like_service),
) -> dict:
    liked, count = service.toggle(current_user.id, pin_id)
    return {"liked": liked, "likes_count": count}


@router.get("/{pin_id}/likes")
def get_likes(
    pin_id: Annotated[int, Path(gt=0)],
    current_user: User = Depends(get_current_user),
    like_service: LikeService = Depends(get_like_service),
    pin_service: PinService = Depends(get_pin_service),
) -> dict:
    return {
        "liked": like_service.is_liked(current_user.id, pin_id),
        "likes_count": pin_service.get_likes_count(pin_id),
    }


@router.get("/{pin_id}/save")
def get_save_status(
    pin_id: Annotated[int, Path(gt=0)],
    current_user: User = Depends(get_current_user),
    service: SaveService = Depends(get_save_service),
) -> dict:
    return {"saved": service.is_saved(current_user.id, pin_id)}


@router.post("/{pin_id}/save")
def toggle_save(
    pin_id: Annotated[int, Path(gt=0)],
    current_user: User = Depends(get_current_user),
    save_service: SaveService = Depends(get_save_service),
    pin_service: PinService = Depends(get_pin_service),
) -> dict:
    saved = save_service.toggle(current_user.id, pin_id)
    saves_count = pin_service.get_saves_count(pin_id)
    return {"saved": saved, "saves_count": saves_count}
