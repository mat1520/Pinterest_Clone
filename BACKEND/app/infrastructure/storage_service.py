import uuid

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import settings
from app.core.exceptions import ConflictException


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

    def get_file_extension(self, file_name: str) -> str:
        if "." in file_name:
            return file_name.rsplit(".", 1)[-1].lower()
        return "jpg"

    def upload(self, file_name: str, file_content: bytes, content_type: str = "image/jpeg") -> str:
        extension = self.get_file_extension(file_name)
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
            raise ConflictException(detail="Error al subir la imagen al servidor")

    def get_presigned_url(self, object_key: str) -> str:
        try:
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": object_key},
                ExpiresIn=self.expiration,
            )
        except ClientError:
            raise ConflictException(detail="Error al obtener la imagen")

    def delete(self, object_key: str) -> None:
        try:
            self.client.delete_object(Bucket=self.bucket, Key=object_key)
        except ClientError:
            raise ConflictException(detail="Error al eliminar la imagen")
