import os
import uuid
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, UploadFile, status

from ams.background_tasks.tasks import process_batch_csv
from ams.schemas.batch import Batch
from ams.services.batch_services import batch_mgr
from ams.utils.utilities import PROGRESS_TRACKER


router = APIRouter()


@router.post("/create/")
async def create_batch(batch: Batch):
    try:
        result = await batch_mgr.create_batch_in_db(batch)
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create batch in the db",
            )
        return {"message": "Batch Created Successfully"}
    except Exception as e:
        raise (e)


@router.get("/")
async def get_batches():
    try:
        batch_data = await batch_mgr.get_all_batches()
        return batch_data
    except Exception as e:
        raise (e)


@router.delete("/{batch_id}/")
async def delete_batch(batch_id: str):
    try:
        result = await batch_mgr.delete_batch_from_db(batch_id)
        if not result:
            raise HTTPException(
                status_code=500, detail=f"Error deleting batch")
        return {"message": "Batch deleted Successfully"}
    except Exception as e:
        raise e


@router.post("/upload/")
async def upload_batches(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(
            status_code=400, detail="Only CSV or Excel files are supported"
        )

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOADS_DIR = os.path.join(BASE_DIR, "..", "uploads")
    UPLOADS_DIR = os.path.abspath(UPLOADS_DIR)

    os.makedirs(UPLOADS_DIR, exist_ok=True)

    file_id = uuid.uuid4().hex
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOADS_DIR, filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    PROGRESS_TRACKER[file_id] = {
        "progress": 0,
        "status": "processing",
        "error_file": None,
        "total": 0,
        "processed": 0,
        "successfull": 0,
        "failed": 0
    }

    background_tasks.add_task(process_batch_csv, file_path, file_id)
    return {"message": "File is saved for processing"}
