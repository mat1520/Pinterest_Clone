from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.application.interfaces import IStorageService
from app.application.services import PinService
from app.core.dependencies import get_current_user, get_pin_repository, get_storage_service
from app.domain.models import User
from app.infrastructure.repositories import PinRepository
from app.schemas.pin import PinRead

router = APIRouter(prefix="/pins", tags=["Pins"])


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


@router.get("", response_model=List[PinRead])
def list_pins(
    q: str = None,
    autor_id: int = None,
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
    content = archivo.file.read()
    content_type = archivo.content_type or "image/jpeg"
    pin = service.create(
        titulo=titulo,
        descripcion=descripcion,
        categoria=categoria,
        file_name=archivo.filename or "upload.jpg",
        file_content=content,
        content_type=content_type,
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
