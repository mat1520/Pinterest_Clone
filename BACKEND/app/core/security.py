from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError

from app.core.config import settings

_ALLOWED_ALGORITHMS = {"HS256"}


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8")
    )


def create_access_token(subject: int, expires_delta: Optional[timedelta] = None) -> str:
    if settings.ALGORITHM not in _ALLOWED_ALGORITHMS:
        raise ValueError(f"Algoritmo JWT no permitido: {settings.ALGORITHM}")
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    now = datetime.now(timezone.utc)
    payload = {"sub": str(subject), "exp": expire, "iat": now}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        subject: Optional[str] = payload.get("sub")
        if subject is None:
            return None
        return int(subject)
    except (InvalidTokenError, ValueError):
        return None
