from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import date
from bson import ObjectId


# Permanenet timetable
class Period(BaseModel):
    period: int
    course_id: Optional[str] = None
    faculty_id: Optional[str] = None


class PermanentTimetable(BaseModel):
    name: str
    batch_id: str
    semester: int
    days: Dict[str, List[Period]]


class TemporaryTimetable(BaseModel):
    name: str
    batch_id: Optional[str]
    date: date
    periods_override: Optional[List[Period]] = None
    timing_structure_id: Optional[str] = None  


class PeriodTiming(BaseModel):
    period: Optional[int] = None # none if is_break is True
    start_time: str  # Format: "HH:MM"
    end_time: str  # Format: "HH:MM"
    is_break: bool = False

class PeriodTimingStructure(BaseModel):
    name: str
    is_default: bool = False
    timings: List[PeriodTiming]


class ScheduleRequest(BaseModel):
    batches: List[str]
    start_date: str
    
class ScheduleProcess(BaseModel):
    name: str  # Unique name for the schedule
    description: Optional[str] = None
    enabled: bool = False
    execution_time: str  # Format: "HH:MM"
    batches: List[str]