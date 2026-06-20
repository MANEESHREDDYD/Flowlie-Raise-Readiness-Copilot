from pathlib import Path

from fastapi import UploadFile

from ..utils.file_extractors import extract_text
from .document_classifier import classify_document


async def ingest_upload(upload: UploadFile, upload_dir: Path) -> dict:
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(upload.filename or "upload.txt").name
    destination = upload_dir / safe_name
    destination.write_bytes(await upload.read())
    text = extract_text(destination)
    return {"file_name": safe_name, "text": text, **classify_document(text, safe_name)}
