from datetime import datetime
from fastapi import HTTPException, status
from pydantic import ValidationError
from ams.db.database import DatabaseConnection
from ams.schemas.course import Course
from ams.schemas.mappings import CourseAssignment
from ams.services.program_services import program_mgr
from ams.services.mapping_services import mapping_mgr
from ams.services.faculty_services import faculty_mgr
from bson import ObjectId
from ams.core.logging_config import app_logger
import pandas as pd

from ams.utils.utilities import PROGRESS_TRACKER


class CourseMgr:
    def __init__(self):
        self.db = None
        self.course_collection = None

    def initialize(self):
        self.db = DatabaseConnection()
        self.course_collection = self.db.get_collection("courses")

    async def check_course_code_exists(self, course_code: str):
        try:
            course = await self.course_collection.find_one({'course_code': course_code})
            return course
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error checking course code. {str(e)}")

    async def add_course_to_db(self, course: Course):
        try:
            course_data = course.model_dump(exclude_none=True)
            existing_course = await self.check_course_code_exists(course_data['course_code'])
            if existing_course:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail=f"Course code already exists")
            course_data["created_at"] = datetime.now()
            course_data["updated_at"] = datetime.now()
            result = await self.course_collection.insert_one(course_data)
            return result
        except HTTPException as e:
            app_logger.error(str(e))
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error adding course. {str(e)} ")

    async def get_all_courses(self):
        try:
            courses = await self.course_collection.find().to_list(length=None)
            for course in courses:
                course["_id"] = str(course["_id"])
                program = None
                if course.get("program_id") is not None:
                    program = await program_mgr.get_program_by_id(course["program_id"])
                course["program"] = program
            return courses
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.WS_1011_INTERNAL_ERROR,
                                detail=f"Error retrieving course data{str(e)}")

    async def delete_course_in_db(self, course_id: str):
        try:
            course_object_id = ObjectId(course_id)
            result = await self.course_collection.delete_one({"_id": course_object_id})
            return result
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error deleting course. {str(e)} ")

    async def update_course_in_db(self, course_id: str, course: Course):
        try:
            course_object_id = ObjectId(course_id)
        
            updated_data = course.model_dump(exclude_unset=True)
            if updated_data["program_id"] is None:
                updated_data.pop('program_id', None)
            updated_data["updated_at"] = datetime.now()
            result = await self.course_collection.update_one({"_id": course_object_id}, {"$set": updated_data})

            return result.modified_count
        except Exception:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=400, detail="Invalid course ID format")
    
    async def get_course_by_id(self, course_id: str):
        try:
            course_object_id = ObjectId(course_id)
            course = await self.course_collection.find_one({"_id": course_object_id})
            if course is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
            course["_id"] = str(course["_id"])
            program = None
            if course.get("program_id") is not None:
                program = await program_mgr.get_program_by_id(course["program_id"])
            course["program"] = program
            return course
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error in getting course, {str(e)} ")

    async def assign_course(self, course_id, assignment_data: CourseAssignment):
        try:
            course_object_id = ObjectId(course_id)
            course = await self.course_collection.find_one({"_id": course_object_id})
            if course is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

            # Add to active assignment
            result = await mapping_mgr.add_course_assignment(assignment_data)
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to insert course assignment into the database",)

            # Save to assignment history
            dict_data = assignment_data.model_dump(exclude_none=True)
            dict_data["status"] = "Assigned"
            dict_data["assigned_date"] = datetime.now()
            result = await mapping_mgr.save_course_assignment(dict_data)
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to save in assignment history",)
            return result
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error Assigning Course. {str(e)}")

    async def get_courses_with_faculty(self, semester: int, batch_id: str):
        try:
            courses = await self.course_collection.find(
                {"semester": semester}).to_list(length=None)

            course_ids = [str(course["_id"]) for course in courses]
            assignments = await mapping_mgr.get_course_assignments_of_courses_ids(
                course_ids)

            faculty_ids = list(
                set(assignment["faculty_id"] for assignment in assignments))
            faculties = await faculty_mgr.get_faculties_by_user_ids(faculty_ids)
            faculty_dict = {
                str(fac["user_id"]): f"{fac.get('first_name')} {fac.get('middle_name', '')} {fac.get('last_name','')}".strip() 
                for fac in faculties
            }
            final_courses = []
            for course in courses:
                course_id = str(course["_id"])

                course_assignments = [
                    assignment for assignment in assignments if assignment["course_id"] == course_id
                ]

                assigned_faculty = None
                for assignment in course_assignments:
                    if not hasattr(assignment, "batch_id") or assignment["batch_id"] is None:
                        assigned_faculty = assignment["faculty_id"]
                        break
                    elif assignment["batch_id"] == batch_id:
                        assigned_faculty = assignment["faculty_id"]

                faculty_name = faculty_dict.get(
                    assigned_faculty, None) if assigned_faculty else None

                final_courses.append({
                    "_id": course_id,
                    "semester": course["semester"],
                    "course_name": course["course_name"],
                    "course_code": course["course_code"],
                    "faculty_id": assigned_faculty,
                    "faculty_name": faculty_name
                })

            return final_courses
        except Exception as e:
            app_logger.error(str(e))
            raise e

    async def process_course_csv(self, file_path: str, task_id: str):
        try:
            df = pd.read_csv(file_path)
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
                    course = Course(**raw)
                    await self.add_course_to_db(course)
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
        

course_mgr = CourseMgr()
