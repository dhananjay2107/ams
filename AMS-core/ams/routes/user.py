from fastapi import APIRouter, HTTPException, Query, status

from ams.schemas.users import User
from ams.services.user_services import user_mgr


router = APIRouter()

@router.post("/create")
async def create_user(user: User):
    try:
        result = await user_mgr.add_user_to_db(user)
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert usert into the database",
            )
        return {"message": "User Added Successfully"}
    except Exception as e:
        raise (e)

@router.get("/")
async def get_users():
    try:
        user_data = await user_mgr.get_all_users()
        return user_data
    except Exception as e:
        raise e