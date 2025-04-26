from datetime import datetime, timedelta
from fastapi import HTTPException, status
from ams.db.database import DatabaseConnection
from ams.core.logging_config import app_logger
from ams.schemas.auth import UserLogin
from ams.schemas.users import User
from ams.utils.utilities import util_mgr
from ams.services.auth_services import create_access_token
from ams.core.config import config


class UserMgr:
    def __init__(self):
        self.db = None
        self.user_collection = None

    def initialize(self):
        self.db = DatabaseConnection()
        self.user_collection = self.db.get_collection("users")

    async def add_user_to_db(self, user: User):
        try:
            existing_user = await self.check_email_exists(user.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
            user_data = user.model_dump(exclude_none=True)
            password = util_mgr.generate_random_string(10)
            user_data["password"] = password
            user_data["created_at"] = datetime.now()
            user_data["updated_at"] = datetime.now()
            result = await self.user_collection.insert_one(user_data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise e

    async def check_email_exists(self, email: str):
        try:
            existingData = await self.user_collection.find_one({'email': email})
            return existingData
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"An error occurred while checking email {str(e)}")

    async def get_all_users(self):
        try:
            users = await self.user_collection.find().to_list(length=None)
            for user in users:
                user["_id"] = str(user["_id"])
            return users
        except Exception as e:
            app_logger.error(str(e))
            raise e

    async def verify_user_login(self, form_data: UserLogin):
        try:
            user = await self.user_collection.find_one({"email": form_data.email})
            if not user:
                app_logger.error(f"User not found {form_data.email}")
                raise HTTPException(status_code=401, detail="User not found")
            # if not util_mgr.verify_password(form_data.password, user["password"]):
            if form_data.password.strip() != user["password"].strip():
                app_logger.error(f"Incorrect password for user {form_data.email}")
                raise HTTPException(
                    status_code=401, detail="Incorrect password")
            if user["status"] == "Inactive":
                return None, None, "Inactive"

            access_token_expires = timedelta(
                minutes=float(config.ACCESS_TOKEN_EXPIRE_MINUTES))
            user_dict = {
                "_id": str(user["_id"]),
                "first_name": user["first_name"],
                "middle_name": user.get("middle_name", ""),
                "last_name": user.get("last_name", ""),
                "email": user["email"],
                "role": user["role"]
            }
            role = user["role"]

            token = create_access_token(
                data=user_dict, expires_delta=access_token_expires)
            return token, role, "Active"
        except HTTPException as e:
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail="An error occurred while verifying login")

    async def change_password(self, new_password: str, email: str):
        try:
            user = await self.user_collection.find_one({"email": email})
            if not user:
                app_logger.error(f"User not found {email}")
                raise HTTPException(status_code=404, detail="User not found")

            # hashed_new_password = util_mgr.hash_password(new_password)
            result = await self.user_collection.update_one({"email": email}, {"$set": {"password": new_password, "status": "Active"}})
            return result
        except HTTPException as e:
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail="An error occurred while changing password")


user_mgr = UserMgr()

