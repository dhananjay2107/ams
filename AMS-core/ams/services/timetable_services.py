from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from ams.db.database import DatabaseConnection
from bson import ObjectId
from ams.schemas.timetable import PeriodTimingStructure, PermanentTimetable, ScheduleRequest, TemporaryTimetable
from ams.core.logging_config import app_logger


class TimetableMgr:
    def __init__(self):
        self.db = None
        self.permanent_timetable_collection = None
        self.period_timings_collection = None
        self.temporary_timetable_collection = None
        self.schedule_collection = None

    def initialize(self):
        self.db = DatabaseConnection()
        self.permanent_timetable_collection = self.db.get_collection(
            "permanent_timetable")
        self.temporary_timetable_collection = self.db.get_collection(
            "temporary_timetable")
        self.period_timings_collection = self.db.get_collection(
            "period_timings")
        self.schedule_collection = self.db.get_collection("timetable-schedule")

    async def create_permanent_timetable(self, data: PermanentTimetable):
        try:
            dict_data = data.model_dump(exclude_none=True)
            result = await self.permanent_timetable_collection.insert_one(dict_data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error creating permanenet Timetable {str(e)}")

    async def create_temporary_timetable(self, data: TemporaryTimetable):
        try:
            dict_data = data.model_dump(exclude_none=True)
            dict_data["date"] = dict_data["date"].strftime("%Y-%m-%d")
            result = await self.temporary_timetable_collection.insert_one(dict_data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error creating Temporary Timetable {str(e)}")

    async def create_timing_structure(self, data: PeriodTimingStructure):
        try:
            dict_data = data.model_dump(exclude_none=True)
            result = await self.period_timings_collection.insert_one(dict_data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error creating timing structure {str(e)}")

    async def delete_timing_structure(self, timing_structure_id: str):
        try:
            result = await self.period_timings_collection.delete_one({"_id": ObjectId(timing_structure_id)})
            return result.deleted_count
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error deleting timing structure{str(e)}")

    async def get_period_timings(self) -> List[PeriodTimingStructure]:
        try:
            documents = await self.period_timings_collection.find().to_list(length=None)
            for doc in documents:
                doc["_id"] = str(doc["_id"])
            return documents
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching period timing structures {str(e)}")

    async def get_all_permanent_timetables(self) -> List[PermanentTimetable]:
        try:
            documents = await self.permanent_timetable_collection.find().to_list(length=None)
            for doc in documents:
                doc["_id"] = str(doc["_id"])
            return documents
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching permanent timetables {str(e)}")

    async def get_all_temporary_timetables(self) -> List[TemporaryTimetable]:
        try:
            documents = await self.temporary_timetable_collection.find().to_list(length=None)
            for doc in documents:
                doc["_id"] = str(doc["_id"])
            return documents
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching temporary timetables {str(e)}")


    async def generate_schedule(self, data: ScheduleRequest):
        try:
            start_date_obj = datetime.strptime(data.start_date, "%Y-%m-%d")

            schedule_to_insert = []

            for batch_id in data.batches:
                perm_timetable = await self.permanent_timetable_collection.find_one(
                    {"batch_id": batch_id}, {"_id": 0}
                )
                if not perm_timetable:
                    raise HTTPException(
                        status_code=404, detail="Permanent timetable not found"
                    )
                temp_timetable = await self.temporary_timetable_collection.find_one({
                    "batch_id": batch_id,
                    "date": data.start_date,
                }, {"_id": 0})

                default_timing_structure = await self.period_timings_collection.find_one(
                    {"is_default": True}, {"_id": 0}
                )
                if not default_timing_structure:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="No default timing structure found",
                    )
                date_str = start_date_obj.strftime("%Y-%m-%d")
                weekday_name = start_date_obj.strftime("%A")

                temp_day = temp_timetable
                if weekday_name in ["Saturday", "Sunday"] and not temp_day and weekday_name not in perm_timetable.get("days", {}):
                    continue
                if temp_day and temp_day.get("timing_structure_id"):
                    timing_structure = await self.period_timings_collection.find_one(
                        {"_id": ObjectId(temp_day["timing_structure_id"])}, {
                            "_id": 0}
                    )
                else:
                    timing_structure = default_timing_structure

                if not timing_structure:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Timing structure not found",
                    )

                timings = timing_structure.get("timings", [])

                periods = (
                    temp_day["periods_override"]
                    if temp_day and temp_day.get("periods_override")
                    else perm_timetable.get("days", {}).get(weekday_name, [])
                )
                if not periods:
                    continue

                period_index = 0
                for timing in timings:
                    # Skip the break periods (if any)
                    if timing["is_break"]:
                        schedule_to_insert.append({
                            "date": date_str,
                            "day": weekday_name,
                            "batch_id": batch_id,
                            "period": None,
                            "course_id": None,
                            "faculty_id": None,
                            "start_time": timing["start_time"],
                            "end_time": timing["end_time"],
                            "is_break": timing["is_break"]
                        })
                    else:
                        period_data = (
                            periods[period_index] if period_index < len(
                                periods) else {}
                        )
                        # Prepare the schedule to insert into the MongoDB 'schedule' collection
                        schedule_to_insert.append({
                            "date": date_str,
                            "day": weekday_name,
                            "batch_id": batch_id,
                            "period": period_data.get("period", timing["period"]),
                            "start_time": timing["start_time"],
                            "end_time": timing["end_time"],
                            "course_id": period_data.get("course_id", None),
                            "faculty_id": period_data.get("faculty_id", None),
                            "is_break": timing["is_break"],
                            "is_attendance_marked": False
                        })
                        period_index += 1

            if schedule_to_insert:
                result = await self.schedule_collection.insert_many(schedule_to_insert)
                return result.inserted_ids
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unable to generate schedule: {str(e)}"
            )

    async def fetch_timetable_schedule(self, batch_id: str):
        try:
            pipeline = [
                {"$match": {"batch_id": batch_id}},
                {
                    "$lookup": {  # Convert batch_id (string) to ObjectId and join with batches collection
                        "from": "batches",
                        "let": {"batchId": {"$toObjectId": "$batch_id"}},
                        "pipeline": [
                            {"$match": {
                                "$expr": {"$eq": ["$_id", "$$batchId"]}}},
                            # Only fetch name field
                            {"$project": {"batch_name": 1}}
                        ],
                        "as": "batch_info"
                    }
                },
                {
                    "$lookup": {  # Convert course_id (string) to ObjectId and join with courses collection
                        "from": "courses",
                        "let": {"courseId": {"$toObjectId": "$course_id"}},
                        "pipeline": [
                            {"$match": {
                                "$expr": {"$eq": ["$_id", "$$courseId"]}}},
                            {"$project": {"course_name": 1}}
                        ],
                        "as": "course_info"
                    }
                },
                {
                    "$lookup": {
                        "from": "faculties",
                        "let": {"facultyId": "$faculty_id"},
                        "pipeline": [
                            {"$match": {
                                "$expr": {"$eq": ["$user_id", "$$facultyId"]}}},
                            {
                                "$project": {
                                    "full_name": {
                                        "$concat": [
                                            "$first_name",  # Always include first_name
                                            " ",  # Add a space between first_name and middle_name
                                            # If middle_name is null, use an empty string
                                            {"$ifNull": ["$middle_name", ""]},
                                            " ",  # Add a space between middle_name and last_name
                                            # If last_name is null, use an empty string
                                            {"$ifNull": ["$last_name", ""]}
                                        ]
                                    }
                                }
                            }
                        ],
                        "as": "faculty_info"
                    }
                },
                {
                    "$project": {  # Format the final response
                        "_id": {"$toString": "$_id"},
                        "date": 1,
                        "start_time": 1,
                        "end_time": 1,
                        "batch": {"$arrayElemAt": ["$batch_info.batch_name", 0]},
                        "course": {"$arrayElemAt": ["$course_info.course_name", 0]},
                        "faculty": {"$arrayElemAt": ["$faculty_info.full_name", 0]}
                    }
                }
            ]

            schedules = await self.schedule_collection.aggregate(pipeline).to_list(length=None)
            if not schedules:
                return
            return schedules
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching timetable schedule{str(e)}")

    async def fetch_faculty_schedule(self, user_id: str, date: str):
        try:
            pipeline = [
                {"$match": {
                    "date": date,
                    "faculty_id": user_id
                }},
                {
                    "$lookup": {
                        "from": "batches",
                        "let": {"batchId": {"$toObjectId": "$batch_id"}},
                        "pipeline": [
                            {"$match": {
                                "$expr": {"$eq": ["$_id", "$$batchId"]}}},

                            {"$project": {"batch_name": 1}}
                        ],
                        "as": "batch_info"
                    }
                },
                {
                    "$lookup": {
                        "from": "courses",
                        "let": {"courseId": {"$toObjectId": "$course_id"}},
                        "pipeline": [
                            {"$match": {
                                "$expr": {"$eq": ["$_id", "$$courseId"]}}},
                            {"$project": {"course_name": 1}}
                        ],
                        "as": "course_info"
                    }
                },
                {
                    "$project": {
                        "_id": {"$toString": "$_id"},
                        "date": 1,
                        "start_time": 1,
                        "end_time": 1,
                        "faculty_id": 1,
                        "batch_id": 1,
                        "course_id": 1,
                        "period": 1,
                        "is_attendance_marked": 1,
                        "batch_name": {"$arrayElemAt": ["$batch_info.batch_name", 0]},
                        "course_name": {"$arrayElemAt": ["$course_info.course_name", 0]},
                    }
                }
            ]
            schedules = await self.schedule_collection.aggregate(pipeline).to_list(length=None)
            if not schedules:
                return
            return schedules

        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching faculty schedule, {str(e)}")

    async def update_timetable_schedule_status(self, schedule_id: str):
        try:
            schedule_object_id = ObjectId(schedule_id)
            result = await self.schedule_collection.update_one({"_id": schedule_object_id}, {"$set": {"is_attendance_marked": True}})
            return result.modified_count
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error updating status,{str(e)}")


timetable_mgr = TimetableMgr()
