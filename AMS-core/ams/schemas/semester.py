from typing import Optional
from pydantic import BaseModel


class SemesterBoundary(BaseModel):
    program_id: str
    semester: int
    start_date:str
    end_date: Optional[str] = None
    adm_year: str