
export interface Course {
    _id?: string
    course_code: string
    course_name: string
    semester: number
    program_id?: string
    created_at?: string | null
    updated_at?: string | null
    program?: Program
    assignedFaculty?: Faculty[]
}

export interface Student {
    _id?: string
    user_id?: string | null
    first_name: string
    middle_name?: string | null
    last_name?: string | null
    email: string
    phone_no: string
    adm_year: string
    gender?: "Male" | "Female" | "Others" | null
    dob?: string | null
    adm_no: string
    reg_no?: string | null
    batch_id?: string | null
    program_id: string
    join_date?: string | null
    end_date?: string | null
    status: "Active" | "Discontinued" | "Completed"
    created_at?: string | null
    updated_at?: string | null
    program?: Program
    batch?: Batch
}


export interface Faculty {
    _id?: string
    user_id?: string | null
    first_name: string
    middle_name?: string
    last_name?: string
    email: string
    phone_no: string
    gender?: "Male" | "Female" | "Others" | null
    dob?: string | null
    program_id: string
    join_date?: string | null
    end_date?: string | null
    status: "Active" | "Resigned"
    created_at?: string | null
    updated_at?: string | null
    program?: Program
}

export interface User {
    _id?: string
    first_name: string
    middle_name?: string | null
    last_name?: string | null
    email: string
    role: "admin" | "faculty" | "student"
    status: "Active" | "Inactive"
    created_at?: string | null
    updated_at?: string | null
}

export interface Program {
    _id?: string
    program_name: string
    created_at?: string | null
    updated_at?: string | null
}

export interface Batch {
    _id?: string
    batch_name: string
    faculty_in_charge: string
    semester: number
    program_id?: string | null
    start_date?: string | null
    status: "Active" | "Inactive"
    end_date?: string | null
    created_at?: string | null
    updated_at?: string | null
    program?: Program
    faculty?: Faculty
}

export interface AssignCourse {
    _id?: string
    course_id: string
    batch_id?: string | null
    faculty_id: string
    assigned_date?: string | null
}

export interface Timetable {
    _id?: string
    name: string
    batch_id: string
    notes?: string | null
}

export interface PeriodAssignment {
    timetable_id: string
    batch_id: string
    day: string
    period_number: number
    course_id: string
    faculty_id: string
}

export interface Attendance {
    student_id: string
    schedule_id: string
    course_id: string
    faculty_id: string
    isPresent: boolean
    isLate: boolean
    date: string
    period: number
}

export interface Leave {
    student_id: string
    leave_date: string
    leave_reason: string
    faculty_id: string
    status: "Submitted" | "Approved" | "Rejected"
}

export interface day_attendance {
    _id?: string
    date: string
    student_id: string
    student?: Student
    day_attendance: number
    leave_form_required: "Not-Required" | "Required" | "Submitted"
}

export interface PaginatedResponse<T> {
    data: T[];
    page_no: number;
    limit: number;
    total: number;
}

export interface PeriodTiming{
    _id?: string
    name:string
    is_default: boolean
    timing: Period[]
}

interface Period{
    period: number
    start_time: string
    end_time: string
    is_break: boolean
}