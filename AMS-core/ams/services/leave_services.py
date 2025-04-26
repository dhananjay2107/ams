from datetime import datetime

from bson import ObjectId
from fastapi import HTTPException, status
from ams.db.database import DatabaseConnection
from ams.schemas.leave import Leave, LeaveApproval
from ams.services.attendance_services import attendance_mgr
from ams.services.faculty_services import faculty_mgr
from ams.services.batch_services import batch_mgr
from ams.services.student_services import student_mgr
from ams.core.logging_config import app_logger


class LeaveMgr:
    def __init__(self):
        self.db = None
        self.leave_collection = None

    def initialize(self):
        self.db = DatabaseConnection()
        self.leave_collection = self.db.get_collection("leaves")

    async def submit_leave(self, leave: Leave):
        try:
            leave_data = leave.model_dump()
            leave_data['created_at'] = datetime.now()
            leave_data['updated_at'] = datetime.now()
            leave_record = await self.leave_collection.insert_one(leave_data)
            await attendance_mgr.update_leave_form_required(leave_data["student_id"], leave_data["leave_date"], leave_data["status"])
            return leave_record.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error adding leave to database, {str(e)}")

    async def approve_leave(self, data: LeaveApproval):
        try:
            leave = await self.leave_collection.find_one({"_id": ObjectId(data.leave_id)})
            if not leave:
                raise HTTPException(
                    status_code=404, detail=f"Leave request not found")
            updated_leave = await self.leave_collection.update_one(
                {"_id": leave["_id"]},
                {"$set": {
                    "status": data.leave_status,
                    "updated_at": datetime.now()
                }}
            )
            return updated_leave.matched_count
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error Approving leave{str(e)}")

    async def get_leave_by_faculty(self, faculty_id: str):
        try:
            batches = await batch_mgr.get_batch_by_faculty_in_charge(faculty_id)
            if batches is None:
                return {"submitted": [], "pending_required": [], "all_leave": []}
            batch_ids = [b["_id"] for b in batches]

            students = await student_mgr.get_students_of_multiple_batches(batch_ids)
            if not students:
                return {"submitted": [], "pending_required": [], "all_leave": []}
            student_ids = [s["user_id"] for s in students]
            student_map = {s["user_id"]: s for s in students}

            leave_apps = await self.leave_collection.find({
                "student_id": {"$in": student_ids},
                "status": "Submitted"
            }).to_list(length=None)
            for leave in leave_apps:
                leave["_id"] = str(leave["_id"])
            submitted = [
                {
                    **leave,
                    "student": student_map.get(leave["student_id"], {})
                } for leave in leave_apps
            ]

            pending = await attendance_mgr.get_summary_by_student_ids(student_ids)
            pending_required = []
            if pending is None:
                pending_required = []
            else:
                pending_required = [
                    {
                        "_id": p["_id"],
                        "student_id": p["student_id"],
                        "date": p["date"],
                        "day_attendance": p["day_attendance"],
                        "student": student_map.get(p["student_id"], {})
                    } for p in pending
                ]

            all_leave_apps = await self.leave_collection.find({
                "student_id": {"$in": student_ids}
            }).to_list(length=None)
            for leave in all_leave_apps:
                leave["_id"] = str(leave["_id"])
            all_leave = [
                {
                    **leave,
                    "student": student_map.get(leave["student_id"], {})
                } for leave in all_leave_apps
            ]
            return {
                "submitted": submitted,
                "pending_required": pending_required,
                "all_leave": all_leave
            }

        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching leave data, {str(e)}")

    async def get_leave_by_student(self, student_id: str):
        try:
            leave_data = await self.leave_collection.find({"student_id": student_id}).to_list(length=None)
            for leave in leave_data:
                leave['_id'] = str(leave['_id'])
            return leave_data
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching leave data, {str(e)}")

    async def get_leave_by_id(self, leave_id: str):
        try:
            leave_data = await self.leave_collection.find_one({"_id": ObjectId(leave_id)})
            if leave_data:
                leave_data['_id'] = str(leave_data['_id'])
                faculty_name = None
                faculty = await faculty_mgr.get_faculty_by_user_id(leave_data["faculty_id"])
                if faculty:
                    first_name = faculty.get("first_name", "").strip()
                    middle_name = faculty.get("middle_name", "").strip()
                    last_name = faculty.get("last_name", "").strip()

                    name_parts = [first_name, middle_name, last_name]
                    faculty_name = " ".join(
                        part for part in name_parts if part)

                leave_data['faculty_name'] = faculty_name
            return leave_data
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching leave data, {str(e)}")


leave_mgr = LeaveMgr()
