from typing import List

from fastapi import APIRouter, Depends

from app.application.services import CommentService
from app.core.dependencies import get_comment_repository, get_current_user, get_pin_repository
from app.domain.models import User
from app.infrastructure.repositories import CommentRepository, PinRepository
from app.schemas.comment import CommentCreate, CommentRead

router = APIRouter(prefix="/pins/{pin_id}/comments", tags=["Comments"])


def get_comment_service(
    comment_repo: CommentRepository = Depends(get_comment_repository),
    pin_repo: PinRepository = Depends(get_pin_repository),
) -> CommentService:
    return CommentService(comment_repo, pin_repo)


@router.post("", response_model=CommentRead, status_code=201)
def create_comment(
    pin_id: int,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    service: CommentService = Depends(get_comment_service),
) -> CommentRead:
    comment = service.create(
        texto=data.texto, pin_id=pin_id, autor_id=current_user.id
    )
    return CommentRead(
        id=comment.id,
        texto=comment.texto,
        pin_id=comment.pin_id,
        autor_id=comment.autor_id,
        creado_en=comment.creado_en,
        autor_nombre=current_user.nombre,
    )


@router.get("", response_model=List[CommentRead])
def list_comments(
    pin_id: int,
    service: CommentService = Depends(get_comment_service),
) -> List[CommentRead]:
    comments = service.get_by_pin_id(pin_id)
    return [
        CommentRead(
            id=c.id,
            texto=c.texto,
            pin_id=c.pin_id,
            autor_id=c.autor_id,
            creado_en=c.creado_en,
            autor_nombre=c.autor.nombre if c.autor else "",
        )
        for c in comments
    ]
