import re
import time
import uuid

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import settings
from app.core.exceptions import StorageException

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}
URL_CACHE_BUFFER_SECONDS = 300
_MAX_CACHE_SIZE = 2000


class AWSS3StorageService:
    _instance: "AWSS3StorageService | None" = None

    def __new__(cls) -> "AWSS3StorageService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return
        self.client = boto3.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
        )
        self.bucket = settings.AWS_S3_BUCKET
        self.expiration = settings.PRESIGNED_URL_EXPIRATION
        self._url_cache: dict[str, tuple[str, float]] = {}
        self._initialized = True

    def _evict_expired(self) -> None:
        now = time.time()
        expired = [
            k for k, (_, ts) in self._url_cache.items()
            if now - ts >= (self.expiration - URL_CACHE_BUFFER_SECONDS)
        ]
        for k in expired:
            del self._url_cache[k]
        if len(self._url_cache) > _MAX_CACHE_SIZE:
            oldest = sorted(self._url_cache, key=lambda k: self._url_cache[k][1])
            for k in oldest[:len(self._url_cache) - _MAX_CACHE_SIZE]:
                del self._url_cache[k]

    def get_safe_extension(self, file_name: str) -> str:
        if "." not in file_name:
            return "jpg"
        raw_extension = file_name.rsplit(".", 1)[-1].lower()
        clean_extension = re.sub(r"[^a-z0-9]", "", raw_extension)
        if clean_extension not in ALLOWED_EXTENSIONS:
            return "jpg"
        return clean_extension

    def upload(self, file_name: str, file_content: bytes, content_type: str) -> str:
        extension = self.get_safe_extension(file_name)
        object_key = f"pins/{uuid.uuid4()}.{extension}"

        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=object_key,
                Body=file_content,
                ContentType=content_type,
            )
            return object_key
        except ClientError:
            raise StorageException(detail="El servicio de almacenamiento no está disponible.")

    def get_presigned_url(self, object_key: str) -> str:
        self._evict_expired()
        cached_url, cached_at = self._url_cache.get(object_key, (None, 0))
        url_age = time.time() - cached_at
        if cached_url and url_age < (self.expiration - URL_CACHE_BUFFER_SECONDS):
            return cached_url

        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": object_key},
                ExpiresIn=self.expiration,
            )
            self._url_cache[object_key] = (url, time.time())
            return url
        except ClientError:
            raise StorageException(detail="El servicio de almacenamiento no está disponible.")

    def delete(self, object_key: str) -> None:
        self._url_cache.pop(object_key, None)
        try:
            self.client.delete_object(Bucket=self.bucket, Key=object_key)
        except ClientError:
            raise StorageException(detail="El servicio de almacenamiento no está disponible.")
