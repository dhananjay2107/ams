from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from ams.background_tasks.tasks import calculate_day_attendance
from ams.schemas.attendance import AttendanceRequest
from ams.services.attendance_services import attendance_mgr


router = APIRouter()


@router.post("/save/")
async def save_attendance(attendances: AttendanceRequest, background_tasks: BackgroundTasks):
    try:
        result = await attendance_mgr.save_attendance_in_db(attendances)
        if result:
            background_tasks.add_task(calculate_day_attendance, attendances)
            return {"message": "Attendance saved successfully"}
    except Exception as e:
        raise e


@router.get("/schedule/{schedule_id}/")
async def fetch_attendance(schedule_id: str):
    try:
        result = await attendance_mgr.fetch_attendance_by_schedule(schedule_id)
        return result
    except Exception as e:
        raise e


@router.get("/current-semester")
async def get_semester_attendance(user_id: str = Query(...)):
    try:
        result = await attendance_mgr.get_semester_attendance(user_id)
        return result
    except Exception as e:
        raise e


@router.get("/monthly")
async def get_monthly_attendance(user_id: str = Query(...)):
    try:
        result = await attendance_mgr.get_monthly_attendance(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/daywise/")
async def get_daywise_attendance(user_id: str):
    try:
        result = await attendance_mgr.get_day_wise_attendance(user_id)
        return result
    except Exception as e:
        raise e


@router.get("/period-wise")
async def get_period_wise_attendance(user_id: str = Query(...)):
    try:
        result = await attendance_mgr.get_period_wise_attendance_with_day_summary(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leave_form_required")
async def fetch_attendance_days(student_id: str= Query(...), status: str = Query(...)):
    try:
        result = await attendance_mgr.fetch_days_by_leave_form_status(student_id, status)
        return result
    except Exception as e:
        raise e
