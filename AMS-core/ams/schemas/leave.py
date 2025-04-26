from typing import Literal
from pydantic import BaseModel


class Leave(BaseModel):
    student_id: str
    leave_date: str
    leave_reason: str
    faculty_id: str
    status: Literal["Submitted", "Approved", "Rejected"]

class LeaveApproval(BaseModel):
    leave_id: str
    leave_status: Literal["Approved","Rejected"]