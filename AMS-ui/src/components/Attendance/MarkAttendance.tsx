"use client"

import { useUser } from '@/hooks/useUser'
import { fetchFacultySchedule } from '@/services/api/timetableschedule'
import { Button, CalendarDate, DatePicker, DateValue, Select, SelectItem } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import Loader from '../Loader/Loader'
import { getAttendanceMarked, saveAttendance } from '@/services/api/attendance'
import { getStudentsByBatch } from '@/services/api/users'
import { toast } from 'react-toastify'
import { Attendance, Student } from '@/interfaces/Interfaces'
import { getFullName } from '@/utilities/utils'
import { FaCheck } from "react-icons/fa";

const MarkAttendance = () => {

    const [schedules, setSchedules] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null)
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
    const [attendanceData, setAttendanceData] = useState<Attendance[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [disabledScheduleIds, setDisabledScheduleIds] = useState<any[]>([])
    const user = useUser()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [markAllPresent, setMarkAllPresent] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setSchedules([])
                setSelectedSchedule(null)
                if (!selectedDate) return
                const result = await fetchFacultySchedule(user?._id, selectedDate.toString());
                if (!result) {
                    toast.error("No schedule for the selected date")
                    return
                }
                setSchedules(result);
            } catch (error: any) {
                toast.error(error.message)
            }
        };
        fetchData();
    }, [selectedDate])

    useEffect(() => {
        const disabledIds = schedules
            .filter((schedule) => !isScheduleSelectable(schedule))
            .map((schedule) => schedule._id);
        setDisabledScheduleIds(disabledIds)
    }, [schedules])

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                if (!selectedSchedule) return;
                const studentList = await getStudentsByBatch(selectedSchedule.batch_id)
                setStudents(studentList)

                if (selectedSchedule.is_attendance_marked) {
                    const attendanceList = await getAttendanceMarked(selectedSchedule._id)
                    const updatedAttendance = studentList.map((student: Student) => {
                        const existingAttendance = attendanceList.find(
                            (attendance: any) => attendance.student_id === student.user_id
                        );

                        return {
                            student_id: student.user_id,
                            faculty_id: user._id,
                            course_id: selectedSchedule.course_id,
                            schedule_id: selectedSchedule._id,
                            isPresent: existingAttendance.isPresent,
                            isLate: existingAttendance.isLate,
                            period: selectedSchedule.period,
                            date: selectedSchedule.date
                        };
                    });

                    setAttendanceData(updatedAttendance);
                }
                else {
                    const initialAttendance = studentList.map((student: Student) => ({
                        student_id: student.user_id,
                        faculty_id: user._id,
                        course_id: selectedSchedule.course_id,
                        schedule_id: selectedSchedule._id,
                        isPresent: false,
                        isLate: false,
                        period: selectedSchedule.period,
                        date: selectedSchedule.date
                    }));
                    setAttendanceData(initialAttendance);
                }
            } catch (error: any) {
                toast.error(error.message)
            }
        }
        fetchStudents()
    }, [selectedSchedule])

    const toggleLate = (student_id: string) => {
        setAttendanceData(prev =>
            prev.map(entry =>
                entry.student_id === student_id
                    ? { ...entry, isLate: !entry.isLate }
                    : entry
            )
        );
    }

    const togglePresent = (student_id: string) => {
        setAttendanceData(prev =>
            prev.map(entry =>
                entry.student_id === student_id
                    ? { ...entry, isPresent: !entry.isPresent }
                    : entry
            )
        );
    }
    const resetAttendance = () => {
        setMarkAllPresent(false)
        setAttendanceData(prev =>
            prev.map(entry => ({
                ...entry,
                isPresent: false,
                isLate: false
            }))
        );
    };

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const response = await saveAttendance(attendanceData)
            if (response) {
                toast.success(response.message)
                setMarkAllPresent(false)
                setSelectedSchedule(null)
                setAttendanceData([])
            }
        }
        catch (error: any) {
            toast.error(error.message)
        }
        finally {
            setIsLoading(false)
        }
    }
    const handleDateChange = (value: DateValue | null) => {
        if (value) {
            setSelectedDate(value as CalendarDate);
        }
    };
    const handleMarkAllPresent = () => {
        setMarkAllPresent(prev => !prev);
        setAttendanceData(prevData =>
            prevData.map(attendance => ({
                ...attendance,
                isPresent: !markAllPresent,
            }))
        );
    };

    const isScheduleSelectable = (schedule: any) => {
        const currentTime = new Date();
        const scheduleStartTime = new Date(`${schedule.date}T${schedule.start_time}`);
        return currentTime > scheduleStartTime;
    };

    return (
        <>
            <div className='flex flex-col gap-3'>
                <div className='flex flex-row gap-3'>
                    <DatePicker isRequired className="max-w-[200px]" label="Select Date" onChange={handleDateChange} />
                    {selectedDate && (
                        <Select
                            className="max-w-[200px]"
                            label="Schedule"
                            variant='bordered'
                            name='schedule_id'
                            disabledKeys={disabledScheduleIds}
                            onChange={(selectedItem: any) => {
                                const selected = schedules.find((schedule) => String(schedule._id) === String(selectedItem.target.value));
                                setSelectedSchedule(selected || null);
                            }}
                        >
                            {schedules.map((schedule) => (
                                <SelectItem key={schedule._id} textValue={schedule.course_name} className={schedule.is_attendance_marked ? "bg-green-200" : ""} endContent={schedule.is_attendance_marked ? <FaCheck className='text-green-600' /> : null}>
                                    <div className="flex flex-col">
                                        <span className="text-small">{schedule.course_name}</span>
                                        <span className="text-tiny text-default-400">{schedule.batch_name} | {schedule.start_time} - {schedule.end_time}</span>
                                    </div>
                                </SelectItem>
                            )
                            )}
                        </Select>)}
                </div>
                {selectedSchedule &&
                    <div>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border p-2">Roll No</th>
                                    <th className="border p-2">Student Name</th>
                                    <th className="border p-2">
                                        <div className="flex items-center justify-center gap-2">
                                            Present/Absent
                                            <input
                                                type="checkbox"
                                                checked={markAllPresent}
                                                onChange={handleMarkAllPresent}
                                            />
                                        </div>
                                    </th>
                                    <th className="border p-2">Late/Not Late</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((entry, index) => {
                                    const student = students.find(s => s.user_id === entry.student_id);
                                    if (student) {
                                        return (
                                            <tr key={entry.student_id} className="text-center">
                                                <td className="border p-2">{index + 1}</td>
                                                <td className="border p-2">{getFullName(student.first_name, student.middle_name || '', student.last_name || '')}</td>
                                                <td className="border p-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.isPresent}
                                                        onChange={() => togglePresent(entry.student_id)}
                                                    />
                                                </td>
                                                <td className="border p-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={entry.isLate}
                                                        disabled={!entry.isPresent}
                                                        onChange={() => toggleLate(entry.student_id)}
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    }
                                })}
                            </tbody>
                        </table>
                        <div className="mt-4 flex gap-2">
                            <Button variant='light' onPress={resetAttendance}>Reset</Button>
                            <Button variant='solid' color='primary' onPress={handleSave}>Save</Button>
                        </div>
                    </div>}
                {isLoading && (
                    <div className="absolute w-full h-full bg-white bg-opacity-50 flex justify-center items-center">
                        <Loader />
                    </div>
                )}
            </div>
        </>

    )
}

export default MarkAttendance