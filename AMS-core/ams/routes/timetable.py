from fastapi import APIRouter, HTTPException, Query, status
from ams.schemas.timetable import PeriodTimingStructure, PermanentTimetable, ScheduleRequest, TemporaryTimetable
from ams.services.timetable_services import timetable_mgr


router = APIRouter()


# @router.get("/timetable/{batch_id}")
# async def get_weekly_timetable(batch_id: str, start_date: str):
#     try:
#         result = await timetable_mgr.get_weekly_timetables(batch_id, start_date)
#         return result
#     except Exception as e:
#         raise e


@router.post("/permanent_timetable/create/")
async def create_permanent_timetable(data: PermanentTimetable):
    try:
        result = await timetable_mgr.create_permanent_timetable(data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create timetable in the database",
            )
        return {"message": "Timetable created Successfully"}
    except Exception as e:
        raise e


@router.post("/temporary_timetable/create/")
async def create_temporary_timetable(data: TemporaryTimetable):
    try:
        result = await timetable_mgr.create_temporary_timetable(data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create timetable in the database",
            )
        return {"message": "Temporary Timetable created Successfully"}
    except Exception as e:
        raise e


@router.post("/period_timings/create/")
async def create_timing_structure(data: PeriodTimingStructure):
    try:
        result = await timetable_mgr.create_timing_structure(data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create timing structure in the database",
            )
        return {"message": "Timing structure created Successfully"}
    except Exception as e:
        raise e


@router.delete("/period_timings/{timing_id}")
async def delete_period_timing(timing_structure_id: str):
    try:
        result = await timetable_mgr.delete_timing_structure(timing_structure_id)
        if result == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Timing structure not found",
            )
        return {"message": "Timing Structure deleted successfully"}
    except Exception as e:
        raise e


@router.get("/period_timings/")
async def get_period_timings():
    try:
        result = await timetable_mgr.get_period_timings()
        return result
    except Exception as e:
        raise e


@router.get("/permanent_timetable/")
async def get_permanent_timetables():
    try:
        result = await timetable_mgr.get_all_permanent_timetables()
        return result
    except Exception as e:
        raise e


@router.get("/temporary_timetable/")
async def get_temporary_timetable():
    try:
        result = await timetable_mgr.get_all_temporary_timetables()
        return result
    except Exception as e:
        raise e


@router.post("/timetable/schedule/")
async def generate_schedule(data: ScheduleRequest):
    try:
        result = await timetable_mgr.generate_schedule(data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate schedule",
            )
        return {"message": "Successfull generated schedule"}
    except Exception as e:
        raise e


@router.get("/timetable/schedule/{batch_id}/")
async def get_timetable_schedule(batch_id: str):
    try:
        result = await timetable_mgr.fetch_timetable_schedule(batch_id)
        return result
    except Exception as e:
        raise Exception(f"An error occurred, {str(e)}")

@router.get("/timetable/faculty-schedule/{user_id}/")
async def get_faculty_schedule(user_id: str, date: str = Query(...)):
    try:
        result = await timetable_mgr.fetch_faculty_schedule(user_id, date)
        return result
    except Exception as e:
        raise e