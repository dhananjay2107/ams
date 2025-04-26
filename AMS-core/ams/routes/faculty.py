from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, UploadFile, status
from ams.background_tasks.tasks import process_faculty_csv
from ams.schemas.users import Faculty
from ams.services.faculty_services import faculty_mgr
import os
import uuid

from ams.utils.utilities import PROGRESS_TRACKER

router = APIRouter()


@router.get("/")
async def get_faculties():
    try:
        faculty_data = await faculty_mgr.get_all_faculties()
        return faculty_data
    except Exception as e:
        raise (e)


@router.post("/create/")
async def create_faculty(faculty: Faculty):
    try:
        result = await faculty_mgr.add_faculty_to_db(faculty)
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert faculty into the database",
            )
        return {"message": "Faculty Added Successfully"}
    except Exception as e:
        raise (e)


@router.post("/upload/")
async def upload_faculties(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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

    background_tasks.add_task(process_faculty_csv, file_path, file_id)
    return {"message": "File is saved for processing"}
