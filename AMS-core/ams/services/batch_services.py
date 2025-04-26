from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
import pandas as pd
from pydantic import ValidationError

from ams.db.database import DatabaseConnection
from ams.schemas.batch import Batch
from ams.services.program_services import program_mgr
from ams.services.faculty_services import faculty_mgr
from ams.core.logging_config import app_logger
from ams.utils.utilities import PROGRESS_TRACKER


class BatchMgr:
    def __init__(self):
        self.db = None
        self.batch_collection = None

    def initialize(self):
        self.db = DatabaseConnection()
        self.batch_collection = self.db.get_collection("batches")

    async def create_batch_in_db(self, batch: Batch):
        try:
            batch_data = batch.model_dump(exclude_none=True)
            batch_data["created_at"] = datetime.now()
            batch_data["updated_at"] = datetime.now()
            result = await self.batch_collection.insert_one(batch_data)
            return result
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error creating batch. {str(e)}")

    async def get_all_batches(self):
        try:
            batches = await self.batch_collection.find().to_list(length=None)
            for batch in batches:
                batch["_id"] = str(batch["_id"])
                faculty = None
                if batch.get("faculty_in_charge") is not None:
                    faculty = await faculty_mgr.get_faculty_by_user_id(batch["faculty_in_charge"])
                batch["faculty"] = faculty
                program = None
                if batch.get("program_id") is not None:
                    program = await program_mgr.get_program_by_id(batch["program_id"])
                batch["program"] = program
            return batches
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Database error occurred while retrieving batch data. {str(e)}")

    async def get_batch_by_id(self, batch_id: str):
        try:
            batch = await self.batch_collection.find_one({"_id": ObjectId(batch_id)})
            if batch:
                batch["_id"] = str(batch["_id"])
            return batch
        except HTTPException as e:
            app_logger.error(str(e))
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching batch information,{str(e)}")

    async def get_batch_by_faculty_in_charge(self, faculty_id: str):
        try:
            batches = await self.batch_collection.find({"faculty_in_charge": faculty_id}).to_list(length=None)
            if not batches:
                return None
            for batch in batches:
                batch["_id"] = str(batch["_id"])
            return batches
        except HTTPException as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching batches,{str(e)}")

    async def delete_batch_from_db(self, batch_id: str):
        try:
            batch_object_id = ObjectId(batch_id)
            result = await self.batch_collection.delete_one({"_id": batch_object_id})
            return result.deleted_count

        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=500, detail=f"Error deleting batch, {str(e)}")

    async def process_batch_csv(self, file_path: str, task_id: str):
        try:
            df = pd.read_csv(file_path)
            total_rows = len(df)
            PROGRESS_TRACKER[task_id]["total"] = total_rows
            program_map = {
                p["program_name"]: p["_id"] for p in await program_mgr.get_all_programs()
            }
            faculty_map = {}
            faculties = await faculty_mgr.get_all_faculties()
            
            for f in faculties:
                name_parts = [f.get("first_name"), f.get("middle_name"), f.get("last_name")]
                full_name = " ".join(filter(None, name_parts)).strip()

                faculty_map[full_name] = f["user_id"]

            errors = []

            for i, (_, row) in enumerate(df.iterrows()):
                raw = row.to_dict()

                pname = raw.get("program_name")
                if not pname or pname not in program_map:
                    errors.append({**raw, "error": "Program name not found"})
                    continue
                raw["program_id"] = program_map[pname]
                raw.pop("program_name")
                
                fname = raw.get("faculty_name")
                if not fname or fname not in faculty_map:
                    errors.append({**raw, "error": "Faculty name not found"})
                    continue

                try:
                    batch = Batch(**raw)
                    await self.create_batch_in_db(batch)
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

    def updateBatch(self, batch_id: str, batch: Batch):
        print("Updated")


batch_mgr = BatchMgr()
