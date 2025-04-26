from fastapi import APIRouter, HTTPException, status

from ams.schemas.semester import SemesterBoundary
from ams.services.semester_services import semester_mgr


router = APIRouter()

@router.post("/create/")
async def add_semester_boundary(semester_boundary: SemesterBoundary):
    try:
        result = await semester_mgr.add_semester_boundary(semester_boundary)
        if not result:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add semester boundary")
        return {"message": "Semester Boundary Added Successfully"}
    except Exception as e:
        raise e

@router.get("/")
async def get_semester_boundary():
    try:
        result = await semester_mgr.get_semester_boundaries()
        return result
    except Exception as e:
        raise e

