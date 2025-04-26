import uuid
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, UploadFile, status

from ams.background_tasks.tasks import process_student_csv
from ams.schemas.users import Student, StudentUpdate
from ams.services.student_services import student_mgr
import os
from ams.utils.utilities import PROGRESS_TRACKER

router = APIRouter()


@router.post("/create/")
async def create_student(student: Student):
    try:
        result = await student_mgr.add_student_to_db(student)
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert student into the database",
            )
        return {"message": "Student Added Successfully"}
    except Exception as e:
        raise (e)


@router.get("/")
async def get_students():
    try:
        student_data= await student_mgr.get_all_students()
        return student_data
    except Exception as e:
        raise (e)


@router.get("/{user_id}/")
async def get_student(user_id: str):
    try:
        student_data = await student_mgr.get_student_by_user_id(user_id)
        return student_data
    except Exception as e:
        raise (e)


@router.patch("/{student_id}/")
async def update_student(student_id: str, student: StudentUpdate):
    try:
        result = await student_mgr.update_student_by_student_id(student_id, student)
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found",
            )
        return student
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating student: {str(e)}"
        )


@router.get("/batch/{batch_id}/")
async def get_students_by_batch(batch_id):
    try:
        student_data = await student_mgr.get_students_by_batch(batch_id)
        return student_data
    except Exception as e:
        raise e


@router.get("/batch/faculty")
async def get_faulty_in_charge(user_id: str = Query(...)):
    try:
        data = await student_mgr.get_faculty_in_charge_from_students(user_id)
        return data
    except Exception as e:
        raise e


@router.post("/upload/")
async def upload_students(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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
        "failed":0
    }

    background_tasks.add_task(process_student_csv, file_path, file_id)
    return {"message": "File is saved for processing"}
