from ams.schemas.attendance import AttendanceRequest
from ams.services.attendance_services import attendance_mgr
from ams.services.student_services import student_mgr
from ams.core.logging_config import app_logger
from ams.services.faculty_services import faculty_mgr
from ams.services.course_services import course_mgr
from ams.services.batch_services import batch_mgr
from ams.services.program_services import program_mgr


async def calculate_day_attendance(attendances: AttendanceRequest):
    app_logger.info(f'Background Process: Calculating day attendance')
    for attendance in attendances.attendanceData:
        await attendance_mgr.calculate_day_attendance(attendance.student_id, attendance.date)
    app_logger.info(f'Background Process: Calculating day attendance completed')


async def process_student_csv(file_path: str, file_id: str):
    app_logger.info(f'Background Process: Processing Student csv file')
    await student_mgr.process_student_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Student csv file completed')

async def process_faculty_csv(file_path: str, file_id: str):
    app_logger.info(f'Background Process: Processing Faculty csv file')
    await faculty_mgr.process_faculty_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Faculty csv file completed')
    
async def process_course_csv(file_path: str, file_id: str):
    app_logger.info(f'Background Process: Processing Course csv file')
    await course_mgr.process_course_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Course csv file completed')
    
async def process_batch_csv(file_path: str, file_id: str):
    app_logger.info(f'Background Process: Processing Batch csv file')
    await batch_mgr.process_batch_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Batch csv file completed')

async def process_program_csv(file_path: str, file_id: str):
    app_logger.info(f'Background Process: Processing Program csv file')
    await program_mgr.process_program_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Program csv file completed')