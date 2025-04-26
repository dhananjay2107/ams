from typing import Literal
from xmlrpc.client import boolean
from pydantic import BaseModel


class Attendance(BaseModel):
    student_id: str
    schedule_id: str
    course_id: str
    faculty_id: str
    isPresent: boolean
    isLate: boolean
    period: int
    date: str


class AttendanceRequest(BaseModel):
    attendanceData: list[Attendance]


class DayAttendance(BaseModel):
    date: str
    student_id: str
    day_attendance: int
    leave_form_required: Literal["Required", "Not-Required", "Submitted"]