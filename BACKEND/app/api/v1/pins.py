from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status, Query

from app.application.interfaces import IStorageService
from app.application.services import PinService
from app.core.dependencies import get_current_user, get_pin_repository, get_storage_service
from app.domain.models import User
from app.infrastructure.repositories import PinRepository
from app.schemas.pin import PinRead

router = APIRouter(prefix="/pins", tags=["Pins"])

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"GIF87a": "image/gif",
    b"GIF89a": "image/gif",
    b"RIFF": "image/webp",
}


def get_pin_service(
    pin_repo: PinRepository = Depends(get_pin_repository),
    storage: IStorageService = Depends(get_storage_service),
) -> PinService:
    return PinService(pin_repo, storage)


def _to_read(pin, service: PinService, autor_nombre: str) -> PinRead:
    return PinRead(
        id=pin.id,
        titulo=pin.titulo,
        descripcion=pin.descripcion,
        categoria=pin.categoria,
        url_imagen=service.resolve_url(pin.url_imagen),
        autor_id=pin.autor_id,
        creado_en=pin.creado_en,
        autor_nombre=autor_nombre,
    )


def validate_image_file(archivo: UploadFile) -> tuple[bytes, str]:
    content = archivo.file.read()

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

    detected_mime = None
    for signature, mime in MAGIC_BYTES.items():
        if content.startswith(signature):
            detected_mime = mime
            break

    if detected_mime is None or detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="El contenido del archivo no corresponde a una imagen válida.",
        )

    return content, detected_mime


@router.get("", response_model=List[PinRead])
def list_pins(
    q: Annotated[Optional[str], Query(max_length=100)] = None,
    autor_id: Optional[int] = None,
    service: PinService = Depends(get_pin_service),
) -> List[PinRead]:
    pins = service.get_all(q=q, autor_id=autor_id)
    return [
        _to_read(pin, service, pin.autor.nombre if pin.autor else "")
        for pin in pins
    ]


@router.get("/{pin_id}", response_model=PinRead)
def get_pin(
    pin_id: int, service: PinService = Depends(get_pin_service)
) -> PinRead:
    pin = service.get_by_id(pin_id)
    return _to_read(pin, service, pin.autor.nombre if pin.autor else "")


@router.post("", response_model=PinRead, status_code=201)
def create_pin(
    titulo: str = Form(...),
    descripcion: Optional[str] = Form(None),
    categoria: Optional[str] = Form(None),
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
    pin_id: int,
    current_user: User = Depends(get_current_user),
    service: PinService = Depends(get_pin_service),
) -> None:
    service.delete(pin_id=pin_id, user=current_user)
