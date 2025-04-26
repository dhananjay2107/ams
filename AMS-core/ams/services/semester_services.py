from datetime import datetime
from fastapi import HTTPException, status
from ams.db.database import DatabaseConnection
from ams.schemas.semester import SemesterBoundary
from ams.core.logging_config import app_logger


class SemesterMgr:
    def __init__(self):
        self.db = None
        self.semester_collection = None
        
    def initialize(self):
        self.db = DatabaseConnection()
        self.semester_collection = self.db.get_collection("semester_boundaries")
    
    async def get_semester_boundaries(self):
        try:
            semesters = await self.semester_collection.find().to_list(length = None)
            for semester in semesters:
                semester["_id"] = str(semester["_id"])
            return semesters
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching semester boundaries: {str(e)}")
    
    async def add_semester_boundary(self, semester_boundary: SemesterBoundary):
        try:
            semester_data = semester_boundary.model_dump(exclude_none=True)
            result = await self.semester_collection.insert_one(semester_data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error adding semester boundary: {str(e)}")
    
    async def get_semester_boundary_by_year_and_semester(self, semester: int, adm_year:str):
        try:
            semester_boundary = await self.semester_collection.find_one({"semester": semester, "adm_year": adm_year})
            if semester_boundary:
                semester_boundary["_id"] = str(semester_boundary["_id"])
                if "end_date" not in semester_boundary or semester_boundary["end_date"] is None:
                    semester_boundary["end_date"] = datetime.now().strftime("%Y-%m-%d")
            return semester_boundary
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching semester boundary: {str(e)}")

semester_mgr = SemesterMgr()