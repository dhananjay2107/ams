from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from ams.db.database import DatabaseConnection
from ams.utils.request_logging_middleware import RequestLoggingMiddleware
from ams.core.logging_config import app_logger
from ams.services.program_services import program_mgr
from ams.services.course_services import course_mgr
from ams.services.batch_services import batch_mgr
from ams.services.student_services import student_mgr
from ams.services.faculty_services import faculty_mgr
from ams.services.mapping_services import mapping_mgr
from ams.services.user_services import user_mgr
from ams.services.timetable_services import timetable_mgr
from ams.services.schedule_services import schedule_mgr
from ams.services.attendance_services import attendance_mgr
from ams.services.semester_services import semester_mgr
from ams.services.leave_services import leave_mgr
from ams.routes import attendance, auth, admin, course, faculty, leave, program, schedule, semester, student, batch, timetable, user

db = DatabaseConnection()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app_logger.info("FastAPI app started")
    await db.connect()
    schedule_mgr.initialize()
    await schedule_mgr.schedule_jobs()
    program_mgr.initialize()
    course_mgr.initialize()
    batch_mgr.initialize()
    student_mgr.initialize()
    faculty_mgr.initialize()
    mapping_mgr.initialize()
    user_mgr.initialize()
    timetable_mgr.initialize()
    attendance_mgr.initialize()
    semester_mgr.initialize()
    leave_mgr.initialize()
    app_logger.info("App Startup Complete")
    yield
    db.close()
    app_logger.info("FastAPI app stopped")

app = FastAPI(
    lifespan=lifespan
)


@app.options("/{path:path}")
async def options_handler(path_str):
    return Response()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(program.router, prefix="/program", tags=["Program"])
app.include_router(course.router, prefix="/course", tags=["Course"])
app.include_router(student.router, prefix="/student", tags=["Student"])
app.include_router(faculty.router, prefix="/faculty", tags=["Faculty"])
app.include_router(batch.router, prefix="/batch", tags=["Batch"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(timetable.router, tags=["Timetables"])
app.include_router(schedule.router, prefix="/schedule", tags=["Schedules"])
app.include_router(attendance.router, prefix="/attendance",
                   tags=["Attendance"])
app.include_router(leave.router, prefix="/leave", tags=["Leave"])
app.include_router(semester.router, prefix="/semester",
                   tags=["Semester-Boundaries"])


@app.get("/")
async def root():
    return {"message": "Welcome to the Attendance Management Backend"}
