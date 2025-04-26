import Card from '@/components/Cards/Card'
import Table from '@/components/Table/Table';
import getUser from '@/hooks/getUser';
import { getCurrentSemesterAttendanceSummary, getStudentPeriodWiseAttendance } from '@/services/api/attendance';
import Link from 'next/link';
import React from 'react'
import { FaBook, FaCheck, FaClock, FaTimes } from 'react-icons/fa'

const columns = [
    { key: "date", label: "Date" },
    { key: "period_1", label: "Period 1" },
    { key: "period_2", label: "Period 2" },
    { key: "period_3", label: "Period 3" },
    { key: "period_4", label: "Period 4" },
    { key: "period_5", label: "Period 5" },
    { key: "period_6", label: "Period 6" },
    { key: "day_attendance", label: "Day Attendance" },
]

const AttendancePage = async () => {

    const user: any = await getUser()

    const current_sem_attendance_summary = await getCurrentSemesterAttendanceSummary(user._id)

    const attendance_data = await getStudentPeriodWiseAttendance(user._id)

    const renderRow = (row: any) => {
        return (
            <>
                <tr
                    key={row._id}
                    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
                >
                    <td className="px-4 py-2 font-medium">{row.date}</td>
                    {[1, 2, 3, 4, 5, 6].map((period) => {
                        const info = row.periods[period];
                        if (!info) {
                            return <td key={period} className="px-4 py-2 text-gray-400">-</td>;
                        }
                        return (
                            <td key={period} className="px-4 py-2">
                                {info.isPresent ? (
                                    info.isLate ? (
                                        <span className="text-yellow-500 flex items-center gap-1">
                                            <FaClock className="inline" /> Late
                                        </span>
                                    ) : (
                                        <span className="text-green-500 flex items-center gap-1">
                                            <FaCheck className="inline" /> Present
                                        </span>
                                    )
                                ) : (
                                    <span className="text-red-500 flex items-center gap-1">
                                        <FaTimes className="inline" /> Absent
                                    </span>
                                )}
                            </td>
                        );
                    })}
                    <td className="px-4 py-2 font-medium">{row.day_attendance ?? "-"}</td>
                </tr >
            </>
        );
    };


    return (
        <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
            <div className='flex gap-3 items-center p-2'>
                <h2 className='font-bold text-3xl'>Attendance</h2>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                <Card icon={<FaBook className='h-6 w-6' />} title={`Current Semester: ${current_sem_attendance_summary.semester}`} value={current_sem_attendance_summary.percentage + "%"} />
            </div>
            <div>
                <Table columns={columns} renderRow={renderRow} data={attendance_data} />
            </div>
        </div>
    )
}

export default AttendancePage