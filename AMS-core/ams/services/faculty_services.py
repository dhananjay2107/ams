from datetime import datetime
from pydantic import ValidationError
from ams.db.database import DatabaseConnection
from fastapi import HTTPException, status
from bson import ObjectId
from ams.services.program_services import program_mgr
from ams.services.user_services import user_mgr
from ams.schemas.users import Faculty, User
from ams.core.logging_config import app_logger
import pandas as pd

from ams.utils.utilities import PROGRESS_TRACKER


class FacultyMgr:
    def __init__(self):
        self.db = None
        self.faculty_collection = None

    def initialize(self):
        self.db = DatabaseConnection()
        self.faculty_collection = self.db.get_collection("faculties")

    async def get_all_faculties(self):
        try:
            faculties = await self.faculty_collection.find().to_list(length=None)
            for faculty in faculties:
                faculty["_id"] = str(faculty["_id"])
                program = None
                program = await program_mgr.get_program_by_id(faculty.get("program_id"))
                faculty["program"] = program
            return faculties
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error occurred while retrieving faculty data. {str(e)} "
            )

    async def check_email_exists(self, email: str):
        try:
            existingData = await self.faculty_collection.find_one({'email': email})
            return existingData
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"An error occurred while checking email. {str(e)}")

    async def get_faculty_by_id(self, faculty_id: str):
        try:
            faculty_object_id = ObjectId(faculty_id)
            faculty = await self.faculty_collection.find_one({"_id": faculty_object_id})
            if faculty:
                faculty["_id"] = str(faculty["_id"])
            return faculty
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"An error occurred while retrieving faculty data. {str(e)}")

    async def get_faculty_by_user_id(self, user_id: str):
        try:
            faculty = await self.faculty_collection.find_one({"user_id": user_id})
            if faculty:
                faculty["_id"] = str(faculty["_id"])
            return faculty
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"An error occurred while retrieving faculty data {str(e)}")

    async def add_faculty_to_db(self, faculty: Faculty):
        try:
            existing_user = await self.check_email_exists(faculty.email)
            if existing_user:
                app_logger.error(f'Email already registered {faculty.email}')
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
            faculty_data = faculty.model_dump(exclude_none=True)

            faculty_user: User = User(
                first_name=faculty.first_name,
                middle_name=faculty.middle_name if faculty.middle_name else None,
                last_name=faculty.last_name if faculty.last_name else None,
                email=faculty.email,
                role="faculty",
                status="Inactive")
            user_result = await user_mgr.add_user_to_db(faculty_user)
            if not user_result.inserted_id:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to insert user into the database",
                )
            faculty_data["user_id"] = str(user_result.inserted_id)
            faculty_data["created_at"] = datetime.now()
            faculty_data["updated_at"] = datetime.now()
            result = await self.faculty_collection.insert_one(faculty_data)
            return result
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error adding faculty. {str(e)}")

    async def get_faculties_by_user_ids(self, faculty_ids):
        try:
            faculties = await self.faculty_collection.find({"user_id": {"$in": faculty_ids}}).to_list(length=None)
            return faculties
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching faculties{str(e)}")

    async def process_faculty_csv(self, file_path: str, task_id: str):
        try:
            df = pd.read_csv(file_path, dtype={"phone_no": str})
            total_rows = len(df)
            PROGRESS_TRACKER[task_id]["total"] = total_rows
            program_map = {
                p["program_name"]: p["_id"] for p in await program_mgr.get_all_programs()
            }
            errors = []

            for i, (_, row) in enumerate(df.iterrows()):
                raw = row.to_dict()

                pname = raw.get("program_name")
                if not pname or pname not in program_map:
                    errors.append({**raw, "error": "Program name not found"})
                    continue
                raw["program_id"] = program_map[pname]
                raw.pop("program_name")

                try:
                    faculty = Faculty(**raw)
                    await self.add_faculty_to_db(faculty)
                    PROGRESS_TRACKER[task_id]["successfull"] += 1
                except ValidationError as ve:
                    err_msg = "; ".join(
                        [f"{e['loc'][0]}: {e['msg']}" for e in ve.errors()])
                    errors.append({**raw, "error": err_msg})
                except Exception as db_ex:
                    errors.append({**raw, "error": str(db_ex)})

                PROGRESS_TRACKER[task_id]["processed"] = i + 1
                PROGRESS_TRACKER[task_id]["progress"] = int(
                    ((i + 1) / total_rows) * 100)

            if errors:
                error_path = file_path.replace(".csv", "_errors.csv")
                pd.DataFrame(errors).to_csv(error_path, index=False)
                PROGRESS_TRACKER[task_id]["error_file"] = error_path
                PROGRESS_TRACKER[task_id]["failed"] = len(errors)

            PROGRESS_TRACKER[task_id]["status"] = "completed"
            app_logger.info(PROGRESS_TRACKER[task_id])

        except Exception as e:
            PROGRESS_TRACKER[task_id]["status"] = f"failed: {str(e)}"


faculty_mgr = FacultyMgr()
