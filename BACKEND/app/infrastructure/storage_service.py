import re
import uuid

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import settings
from app.core.exceptions import StorageException

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}


_s3_instance: "AWSS3StorageService | None" = None


def get_storage_service() -> "AWSS3StorageService":
    global _s3_instance
    if _s3_instance is None:
        _s3_instance = AWSS3StorageService()
    return _s3_instance


class AWSS3StorageService:
    def __init__(self) -> None:
        self.client = boto3.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
        )
        self.bucket = settings.AWS_S3_BUCKET
        self.expiration = settings.PRESIGNED_URL_EXPIRATION

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
        try:
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": object_key},
                ExpiresIn=self.expiration,
            )
        except ClientError:
            raise StorageException(detail="El servicio de almacenamiento no está disponible.")

    def delete(self, object_key: str) -> None:
        try:
            self.client.delete_object(Bucket=self.bucket, Key=object_key)
        except ClientError:
            raise StorageException(detail="El servicio de almacenamiento no está disponible.")
