from datetime import date, datetime, timedelta, timezone

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    clave: str = Field(..., min_length=8, max_length=128)
    fecha_nacimiento: date

    @field_validator("clave")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("La contrasena debe tener al menos una mayuscula")
        if not any(c.islower() for c in v):
            raise ValueError("La contrasena debe tener al menos una minuscula")
        if not any(c.isdigit() for c in v):
            raise ValueError("La contrasena debe tener al menos un numero")
        if not any(c in "!@#$%^&*()_+-=[]{}|;':\",./<>?`~" for c in v):
            raise ValueError("La contrasena debe tener al menos un caracter especial")
        return v

    @field_validator("fecha_nacimiento")
    @classmethod
    def validate_age(cls, v: date) -> date:
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError("Debes tener al menos 18 anos para registrarte")
        if age > 100:
            raise ValueError("La fecha de nacimiento no es valida (maximo 100 anos)")
        return v


class UserLogin(BaseModel):
    correo: EmailStr
    clave: str = Field(..., min_length=1, max_length=128)


class UserPublicRead(BaseModel):
    id: int
    nombre: str
    correo: EmailStr
    fecha_nacimiento: date
    creado_en: datetime


class UserRead(UserPublicRead):
    es_admin: bool
