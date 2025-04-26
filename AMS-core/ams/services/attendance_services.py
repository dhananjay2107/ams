from collections import defaultdict
from typing import List
from fastapi import HTTPException, status
from ams.db.database import DatabaseConnection
from ams.schemas.attendance import Attendance, AttendanceRequest
from ams.services.timetable_services import timetable_mgr
from ams.services.student_services import student_mgr
from ams.services.batch_services import batch_mgr
from ams.services.semester_services import semester_mgr
from ams.core.logging_config import app_logger


class AttendanceMgr:
    def __init__(self):
        self.db = None
        self.attendance_collection = None
        self.day_attendance_summary = None

    def initialize(self):
        self.db = DatabaseConnection()
        self.attendance_collection = self.db.get_collection("attendance")
        self.day_attendance_summary = self.db.get_collection(
            "day_attendance_summary")

    async def check_attendance_document_exists(self, attendance: Attendance):
        try:
            existing_document = await self.attendance_collection.find_one({
                "student_id": attendance.student_id,
                "date": attendance.date,
                "period": attendance.period
            })
            return existing_document
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error checking attendance, {str(e)}")

    async def save_attendance_in_db(self, attendances: AttendanceRequest):
        try:
            schedule_id = attendances.attendanceData[0].schedule_id
            for attendance in attendances.attendanceData:
                existing_document = await self.check_attendance_document_exists(attendance)
                if existing_document:
                    await self.attendance_collection.update_one({"_id": existing_document["_id"]}, {"$set": {
                        "student_id": attendance.student_id,
                        "schedule_id": attendance.schedule_id,
                        "course_id": attendance.course_id,
                        "faculty_id": attendance.faculty_id,
                        "isPresent": attendance.isPresent,
                        "isLate": attendance.isLate,
                        "date": attendance.date,
                        "period": attendance.period
                    }})
                else:
                    await self.attendance_collection.insert_one(attendance.model_dump())

            await timetable_mgr.update_timetable_schedule_status(schedule_id)

            return {"message": "Attendance saved successfully!"}
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error saving attendance, {str(e)}")

    async def fetch_attendance_by_schedule(self, schedule_id: str):
        try:
            attendance_data = await self.attendance_collection.find({"schedule_id": schedule_id}).to_list(length=None)
            for attendance in attendance_data:
                attendance["_id"] = str(attendance["_id"])
            return attendance_data
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching attendance data, {str(e)}")

    async def calculate_day_attendance(self, student_id: str, date: str):
        try:
            pipeline = [
                {"$match": {"student_id": student_id, "date": date}},
                {"$group": {
                    "_id": "$student_id",
                    "attendance": {"$push": "$isPresent"}
                }}
            ]
            period_attendance_data = await self.attendance_collection.aggregate(pipeline).to_list(length=None)
            if period_attendance_data:
                attendance_status = period_attendance_data[0]["attendance"]
                absent_count = attendance_status.count(False)
                if absent_count == 0:
                    day_attendance = 1
                    leave_status = "Not-Required"
                elif absent_count == 1:
                    day_attendance = 0.5
                    leave_status = "Not-Required"
                else:
                    day_attendance = 0
                    leave_status = "Required"
                await self.day_attendance_summary.update_one(
                    {"student_id": student_id, "date": date},
                    {"$set": {
                        "day_attendance": day_attendance,
                        "leave_form_required": leave_status
                    }},
                    upsert=True
                )
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error calculating dayattendance,{str(e)}")

    async def update_leave_form_required(self, student_id: str, leave_date: str, leave_status: str):
        try:
            await self.day_attendance_summary.update_one(
                {"student_id": student_id, "date": leave_date},
                {"$set": {"leave_form_required": leave_status}}
            )
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error updating leave form status, {str(e)}")

    async def get_semester_attendance(self, user_id: str):
        try:
            semester, adm_year = await student_mgr.get_student_info(user_id)
            if not semester or not adm_year:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail=f"Student detail not found")

            semester_boundary = await semester_mgr.get_semester_boundary_by_year_and_semester(semester, adm_year)
            if not semester_boundary:
                raise HTTPException(
                    status_code=404, detail="Semester boundary not found")

            attendance_records = await self.day_attendance_summary.find({
                "student_id": user_id,
                "date": {"$gte": semester_boundary["start_date"], "$lte": semester_boundary["end_date"]}
            }).to_list(length=None)

            total_days = len(attendance_records)
            present_days = sum(record["day_attendance"]
                               for record in attendance_records)
            percentage = (present_days / total_days * 100) if total_days else 0

            return {
                "user_id": user_id,
                "semester": semester,
                "start_date": semester_boundary["start_date"],
                "end_date": semester_boundary["end_date"],
                "present_days": present_days,
                "total_days": total_days,
                "percentage": round(percentage, 2)
            }
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching semester attendance, {str(e)}")

    async def day_attendance_in_range(self, user_id: str, start_date: str, end_date: str):
        try:
            records = await self.day_attendance_summary.find({
                "student_id": user_id,
                "date": {"$gte": start_date, "$lte": end_date}
            }).to_list(length=None)
            if not records:
                return None
            for record in records:
                record["_id"] = str(record["_id"])
            return records
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching attendance records, {str(e)}")

    async def get_monthly_attendance(self, user_id: str):
        try:
            semester, adm_year = await student_mgr.get_student_info(user_id)
            if not semester or not adm_year:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail=f"Student detail not found")
            boundary = await semester_mgr.get_semester_boundary_by_year_and_semester(semester, adm_year)
            if not boundary:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail=f"Semester boundary not found")
            attendance_records = await self.day_attendance_in_range(user_id, boundary["start_date"], boundary["end_date"])
            if not attendance_records:
                return None

            monthly_summary = defaultdict(lambda: {"present": 0, "total": 0})
            for record in attendance_records:
                month = record["date"][:7]
                monthly_summary[month]["present"] += record["day_attendance"]
                monthly_summary[month]["total"] += 1

            result = []
            for month, data in monthly_summary.items():
                present = data["present"]
                total = data["total"]
                percentage = (present / total * 100) if total else 0
                result.append({
                    "month": month,
                    "present_days": present,
                    "total_days": total,
                    "percentage": round(percentage, 2)
                })

            return result
        except HTTPException as e:
            app_logger.error(str(e))
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching monthly attendance, {str(e)}")

    async def get_day_wise_attendance(self, user_id: str):
        try:
            semester, adm_year = await student_mgr.get_student_info(user_id)
            if not semester or not adm_year:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail=f"Student detail not found")
            boundary = await semester_mgr.get_semester_boundary_by_year_and_semester(semester, adm_year)
            if not boundary:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail=f"Semester boundary not found")
            attendance_records = await self.day_attendance_in_range(user_id, boundary["start_date"], boundary["end_date"])
            if not attendance_records:
                return None

            return attendance_records
        except HTTPException as e:
            app_logger.error(str(e))
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching day-wise attendance, {str(e)}")

    async def get_period_wise_attendance_with_day_summary(self, user_id: str):
        try:
            semester, adm_year = await student_mgr.get_student_info(user_id)
            if not semester or not adm_year:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail=f"Student detail not found")
            boundary = await semester_mgr.get_semester_boundary_by_year_and_semester(semester, adm_year)
            if not boundary:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail=f"Semester boundary not found")

            attendance_records = await self.attendance_collection.find({
                "student_id": user_id,
                "date": {"$gte": boundary["start_date"], "$lte": boundary["end_date"]}
            }).to_list(length=None)

            day_attendance_summaries = await self.day_attendance_summary.find({
                "student_id": user_id,
                "date": {"$gte": boundary["start_date"], "$lte": boundary["end_date"]}
            }).to_list(None)

            day_summary_map = {
                record["date"]: record.get("day_attendance") for record in day_attendance_summaries
            }

            # Reshaping the data
            data = {}
            for record in attendance_records:
                date = record["date"]
                period = record["period"]

                if date not in data:
                    data[date] = {}

                # Include both isPresent and isLate in the response
                data[date][period] = {
                    "isPresent": record["isPresent"],
                    "isLate": record["isLate"]
                }

            reshaped_data = [
                {"date": date, "periods": periods, "day_attendance": day_summary_map.get(date)} for date, periods in sorted(data.items())
            ]
            return reshaped_data
        except HTTPException as e:
            app_logger.error(str(e))
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching period-wise attendance, {str(e)}")

    async def get_summary_by_student_ids(self, student_ids: List[str]):
        try:
            datas = await self.day_attendance_summary.find({
                "student_id": {"$in": student_ids},
                "leave_form_required": "Required"
            }).to_list(length=None)

            if not datas:
                return None
            for data in datas:
                data["_id"] = str(data["_id"])
            return datas

        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching summary, {str(e)}")

    async def fetch_days_by_leave_form_status(self,student_id, status: str):
        if status not in ["Not-Required", "Required", "Submitted"]:
            raise Exception(f"Invalid status")
        try:
            print("test")
            days = await self.day_attendance_summary.find({
                "leave_form_required": status
            }).to_list(length=None)
            for day in days:
                day["_id"] = str(day["_id"])
            return days
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching days,{str(e)}")


attendance_mgr = AttendanceMgr()
