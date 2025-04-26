from datetime import datetime
from typing import Dict, List
from fastapi import HTTPException, status
from ams.db.database import DatabaseConnection
from ams.schemas.mappings import CourseAssignment
from ams.services.faculty_services import faculty_mgr
from ams.core.logging_config import app_logger


class MappingMgr:
    def __init__(self):
        self.db = None
        self.course_assignment = None
        self.course_assignment_history = None

    def initialize(self):
        self.db = DatabaseConnection()
        self.course_assignment = self.db.get_collection("course_assignment")
        self.course_assignment_history = self.db.get_collection(
            "course_assignment_history")

    async def add_course_assignment(self, assignment_data: CourseAssignment):
        try:
            data = assignment_data.model_dump(exclude_none=True)
            data["assigned_date"] = datetime.now()
            result = await self.course_assignment.insert_one(data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: " + str(e))

    async def save_course_assignment(self, assignment_data: dict):
        try:
            result = await self.course_assignment_history.insert_one(assignment_data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error Saving course assignment in history, {str(e)}")

    async def get_course_assignments_of_courses_ids(self, course_ids) -> List[Dict]:
        try:
            assignments_cursor = self.course_assignment.find(
                {"course_id": {"$in": course_ids}}
            )
            assignments = await assignments_cursor.to_list(length=None)
            return assignments
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching assignments, {str(e)}")

    async def get_course_assignments(self, course_id: str):
        try:
            assignments = await self.course_assignment.find(
                {"course_id": course_id}).to_list(length=None)
            if not assignments:
                return None

            for assignment in assignments:
                assignment["_id"] = str(assignment["_id"])
                faculty = None
                faculty = await faculty_mgr.get_faculty_by_user_id(assignment.get("faculty_id"))
                if faculty:
                    assignment["faculty"] = faculty
            return assignments
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching courseAssignments, {str(e)}")


mapping_mgr = MappingMgr()
