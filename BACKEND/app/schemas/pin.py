from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class PinCreate(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=100, strip_whitespace=True)
    descripcion: Optional[str] = Field(None, max_length=500)
    categoria: Optional[str] = Field(None, max_length=50)

class PinRead(BaseModel):
    id: int
    titulo: str
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    url_imagen: str
    autor_id: int
    creado_en: datetime
    autor_nombre: str
