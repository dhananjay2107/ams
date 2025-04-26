import os
import uuid
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, UploadFile, status
from ams.background_tasks.tasks import process_course_csv
from ams.schemas.course import Course
from ams.schemas.mappings import CourseAssignment
from ams.services.course_services import course_mgr
from ams.services.mapping_services import mapping_mgr
from ams.utils.utilities import PROGRESS_TRACKER


router = APIRouter()


@router.post("/create/")
async def create_course(course: Course):
    try:
        result = await course_mgr.add_course_to_db(course)
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert course into the database",
            )
        return {"message": "Course Added Successfully"}
    except Exception as e:
        raise (e)


@router.get("/")
async def get_courses():
    try:
        course_data = await course_mgr.get_all_courses()
        return course_data
    except Exception as e:
        raise (e)


@router.put("/{course_id}/")
async def update_course(course_id: str, course: Course):
    try:
        result = await course_mgr.update_course_in_db(course_id, course)
        if result == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return {"message": "Course Updated Successfully"}
    except Exception as e:
        raise (e)

@router.delete("/{course_id}/")
async def delete_program(course_id: str):
    try:
        result = await course_mgr.delete_course_in_db(course_id)
        if not result.deleted_count == 1:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return {"message": "Course Deleted Successfully"}
    except Exception as e:
        raise (e)

@router.get("/{course_id}/")
async def get_course_by_id(course_id: str):
    try:
        course_data = await course_mgr.get_course_by_id(course_id)
        return course_data
    except Exception as e:
        raise (e)


@router.post("/{course_id}/assign/")
async def assign_course(course_id: str, assignment_data: CourseAssignment):
    try:
        result = await course_mgr.assign_course(course_id, assignment_data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to assign course in database",
            )
        return {"message": "Course Assigned Successfully"}
    except Exception as e: 
        raise (e)


@router.get("/course-with-faculty")
async def get_courses_with_faculty(semester: int, batch_id: str):
    try:
        result = await course_mgr.get_courses_with_faculty(semester, batch_id)
        return result
    except Exception as e:
        raise e

@router.get("/course_assigned")
async def get_course_assignment(course_id:str):
    try:
        result = await mapping_mgr.get_course_assignments(course_id)
        return result
    except Exception as e:
        raise e

@router.post("/upload/")
async def upload_courses(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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

    background_tasks.add_task(process_course_csv, file_path, file_id)
    return {"message": "File is saved for processing"}