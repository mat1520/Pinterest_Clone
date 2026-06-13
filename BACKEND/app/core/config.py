import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Pinterest Clone API"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    AWS_S3_BUCKET: str
    PRESIGNED_URL_EXPIRATION: int = 3600

    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,https://pinterest-clone-pi-snowy.vercel.app"

    @property
    def allowed_origins_list(self) -> List[str]:
        v = self.ALLOWED_ORIGINS.strip()
        if v.startswith("["):
            try:
                origins = json.loads(v)
            except json.JSONDecodeError:
                origins = [v]
        else:
            origins = [o.strip() for o in v.split(",") if o.strip()]
        return [o.rstrip("/") for o in origins]

    class Config:
        env_file = ".env"


settings = Settings()
