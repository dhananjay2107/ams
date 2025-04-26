from typing import Literal, Optional
from pydantic import BaseModel


class Batch(BaseModel):
    batch_name: str
    faculty_in_charge: str
    program_id: Optional[str] = None
    semester: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Literal["Active", "Inactive"] = "Active"
