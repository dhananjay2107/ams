from datetime import date
from typing import Annotated, Literal, Optional
from pydantic import BaseModel, EmailStr, constr


class Student(BaseModel):
    user_id: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    phone_no: Annotated[str, constr(min_length=10, max_length=10)]
    gender: Optional[Literal["Male", "Female", "Others"]] = None
    dob: Optional[str] = None
    adm_no: str
    reg_no: Optional[str] = None
    batch_id: Optional[str] = None
    adm_year: str
    program_id: str
    join_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Literal["Active", "Discontinued", "Completed"] = "Active"

class StudentUpdate(BaseModel):
    user_id: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[str] = None
    adm_no: Optional[str] = None
    reg_no: Optional[str] = None
    gender: Optional[Literal["Male","Female","Other"]] = None
    email: Optional[EmailStr] = None
    phone_no: Optional[Annotated[None, constr(min_length=10, max_length=10)]]
    join_date: Optional[str] = None
    end_date: Optional[str] = None
    program_id: Optional[str] = None
    adm_year: Optional[str] = None
    batch_id: Optional[str] = None
    status: Optional[Literal["Active","Discontinued","completed"]] = None


class Faculty(BaseModel):
    user_id: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    phone_no: Annotated[str, constr(min_length=10, max_length=10)]
    gender: Optional[Literal["Male", "Female", "Others"]] = None
    dob: Optional[date] = None
    program_id: str
    join_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Literal["Active", "Resigned"] = "Active"


class User(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    role: Literal["admin", "faculty", "student"]
    status: Literal["Active", "Inactive"]
