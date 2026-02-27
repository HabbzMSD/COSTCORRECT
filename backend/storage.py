"""
File storage abstraction for CostCorrect.
Local storage for development; GCS-ready interface for production.
"""

import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile

from config import UPLOAD_DIR, STORAGE_BACKEND


class LocalStorage:
    """Stores uploaded files on the local filesystem."""

    def __init__(self, base_dir: str = UPLOAD_DIR):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def save(self, file: UploadFile) -> str:
        """Save the uploaded file and return the stored path."""
        ext = Path(file.filename or "upload").suffix
        unique_name = f"{uuid.uuid4().hex}{ext}"
        dest = self.base_dir / unique_name

        with open(dest, "wb") as f:
            shutil.copyfileobj(file.file, f)

        return str(dest)

    def get_path(self, filename: str) -> Path:
        return self.base_dir / filename


class GCSStorage:
    """
    Placeholder for Google Cloud Storage backend.
    Pre-configured for POPIA-compliant SA regions.
    """

    def __init__(self, bucket: str, region: str = "africa-south1"):
        self.bucket = bucket
        self.region = region
        # In production, initialise the GCS client here:
        # from google.cloud import storage
        # self.client = storage.Client()
        # self.bucket_obj = self.client.bucket(bucket)

    async def save(self, file: UploadFile) -> str:
        raise NotImplementedError(
            "GCS storage is not yet implemented. "
            "Set STORAGE_BACKEND=local for development."
        )


def get_storage():
    """Factory function — returns the active storage backend."""
    if STORAGE_BACKEND == "gcs":
        from config import GCS_BUCKET, GCS_REGION
        return GCSStorage(bucket=GCS_BUCKET, region=GCS_REGION)
    return LocalStorage()
