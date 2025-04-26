from datetime import datetime, timedelta
from bson import ObjectId
from fastapi import HTTPException, status
from ams.db.database import DatabaseConnection
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from ams.schemas.timetable import ScheduleProcess, ScheduleRequest
from ams.services.timetable_services import timetable_mgr
from ams.core.logging_config import app_logger


class ScheduleMgr:
    def __init__(self):
        self.db = None
        self.schedule_collection = None
        self.scheduler = None

    def initialize(self):
        self.db = DatabaseConnection()
        self.scheduler = AsyncIOScheduler()
        self.scheduler.start()
        self.schedule_collection = self.db.get_collection("schedule_settings")

    async def schedule_jobs(self):
        try:
            self.scheduler.remove_all_jobs()
            schedules = await self.schedule_collection.find({"enabled": True}).to_list(length=None)
            if not schedules:
                return

            for schedule in schedules:
                exec_time = schedule.get(
                    "execution_time", "00:00")  # Format: "HH:MM"
                hour, minute = map(int, exec_time.split(":"))

                self.scheduler.add_job(
                    self.generate_schedule,
                    CronTrigger(hour=hour, minute=minute),
                    args=[str(schedule["_id"])],
                    id=str(schedule["_id"]),
                )
        except Exception as e:
            app_logger.error(str(e))
            raise e

    async def generate_schedule(self, schedule_id: str):
        try:
            schedule = await self.schedule_collection.find_one({"_id": ObjectId(schedule_id)})
            if not schedule:
                return

            batches = schedule["batches"]
            if not batches:
                print(f"No batches assigned for schedule {schedule_id}.")
                return
            print(
                f"Generating timetable schedule for batches: {batches} at {datetime.now()}")
            tomorrow = datetime.now().date() + timedelta(days=1)
            data = ScheduleRequest(
                start_date=tomorrow.strftime("%Y-%m-%d"),
                batches=batches
            )
            await timetable_mgr.generate_schedule(data)
            print(f"Timetable-schedule generation completed.")
            return

        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error occurred in generate schedule, {str(e)}")


    async def create_schedule_in_db(self, data: ScheduleProcess):
        try:
            schedule_data = data.model_dump()
            schedule_data["created_at"] = datetime.now()
            schedule_data["updated_at"] = datetime.now()
            result = await self.schedule_collection.insert_one(schedule_data)
            await self.schedule_jobs()
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error creating schedule, {str(e)}")

    async def toggle_schedule(self, schedule_id: str, enabled: bool):
        try:
            result = await self.schedule_collection.update_one({"_id": ObjectId(schedule_id)}, {"$set": {"enabled": enabled}})
            await self.schedule_jobs()
            return result
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error in updating schedule status, {str(e)}")

    async def update_schedule(self, schedule_id: str, data: dict):
        try:
            data["updated_at"] = datetime.now()
            result = await self.schedule_collection.update_one({"_id": ObjectId(schedule_id)}, {"$set": data})
            await self.schedule_jobs()
            return result
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error in updating schedule, {str(e)}")

    async def delete_schedule(self, schedule_id: str):
        try:
            result = await self.schedule_collection.delete_one({"_id": ObjectId(schedule_id)})
            self.scheduler.remove_job(str(schedule_id))
            return result
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error deleting schedule, {str(e)}")


schedule_mgr = ScheduleMgr()
