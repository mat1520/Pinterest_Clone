from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class PinRead(BaseModel):
    id: int
    titulo: str
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    url_imagen: str
    autor_id: int
    creado_en: datetime
    autor_nombre: str
    likes_count: int = 0
    saves_count: int = 0

class PinListResponse(BaseModel):
    items: List[PinRead]
    total: int
    offset: int
    limit: int
