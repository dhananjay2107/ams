from fastapi import APIRouter, HTTPException, Query, status
from ams.schemas.leave import Leave, LeaveApproval
from ams.services.leave_services import leave_mgr


router = APIRouter()


@router.get("/student")
async def get_leave_by_student(student_id: str):
    try:
        leave_data = await leave_mgr.get_leave_by_student(student_id)
        return leave_data
    except Exception as e:
        raise e


@router.get("/faculty")
async def get_leave_by_faculty(user_id: str = Query(...)):
    try:
        leave_data = await leave_mgr.get_leave_by_faculty(user_id)
        return leave_data
    except Exception as e:
        raise e


@router.post("/submit-leave/")
async def submit_leave(leave: Leave):
    try:
        result = await leave_mgr.submit_leave(leave)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error Submitting Leave")
        return {"message": "Leave submitted successfully!"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Error Submitting Leave {str(e)}")


@router.patch("/approve-leave/")
async def approve_leave(data: LeaveApproval):
    try:
        result = await leave_mgr.approve_leave(data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error Approving Leave")
        return {"message": "Leave approved successfully!"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Error Approving Leave {str(e)}")


@router.get("/{leave_id}/")
async def get_leave_by_id(leave_id: str):
    try:
        leave_data = await leave_mgr.get_leave_by_id(leave_id)
        if not leave_data:
            raise HTTPException(status_code=404, detail="Leave not found")
        return leave_data
    except HTTPException as e:
        raise e
