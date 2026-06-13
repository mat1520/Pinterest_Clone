from datetime import date, datetime
from pydantic import BaseModel, Field, EmailStr

class UserCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    clave: str = Field(..., min_length=6)
    fecha_nacimiento: date

class UserLogin(BaseModel):
    correo: EmailStr
    clave: str = Field(..., min_length=1)

class UserRead(BaseModel):
    id: int
    nombre: str
    correo: EmailStr
    fecha_nacimiento: date
    es_admin: bool
    creado_en: datetime
