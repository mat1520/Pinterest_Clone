from datetime import datetime
from pydantic import BaseModel, Field

class CommentCreate(BaseModel):
    texto: str = Field(..., min_length=1, max_length=500, strip_whitespace=True)

class CommentRead(BaseModel):
    id: int
    texto: str
    pin_id: int
    autor_id: int
    creado_en: datetime
    autor_nombre: str
