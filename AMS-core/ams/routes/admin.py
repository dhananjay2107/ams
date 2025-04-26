from fastapi import APIRouter, Depends
from ams.utils.dependencies import require_role


router = APIRouter()

@router.get("/dashboard")
async def admin_dashboard(user: dict = Depends(require_role("admin"))):
    return {"message": "Welcome to the admin dashboard!"}
