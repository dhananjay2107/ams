from fastapi import APIRouter, HTTPException, status
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from ams.schemas.timetable import ScheduleProcess
from ams.services.schedule_services import schedule_mgr


router = APIRouter()
scheduler = AsyncIOScheduler


@router.post("/create/")
async def create_schedule(data: ScheduleProcess):
    try:
        result = await schedule_mgr.create_schedule_in_db(data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create schedule into the database",
            )
        return{"message": "Schedule created"}
    except Exception as e:
        raise e

@router.put("/{schedule_id}/toggle/")
async def toggle_schedule(schedule_id: str, enabled: bool):
    try:
        result = await schedule_mgr.toggle_schedule(schedule_id, enabled)
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unable to find schedule")
        return {"message": f"Schedule {'enabled' if enabled else 'disabled'} successfully"}
    except Exception as e:
        raise e


@router.put("/{schedule_id}/update/")
async def update_schedule(schedule_id: str, data: dict):
    try:
        result = await schedule_mgr.update_schedule(schedule_id, data)
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unable to find schedule")
        return {"message": "Schedule updated successfully"}
    except Exception as e:
        raise e


@router.delete("/{schedule_id}/")
async def delete_schedule(schedule_id: str):
    try:
        result = await schedule_mgr.delete_schedule(schedule_id)
        if not result.deleted_count == 1:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return {"message": "Schedule deleted successfully"}
    except Exception as e:
        raise e