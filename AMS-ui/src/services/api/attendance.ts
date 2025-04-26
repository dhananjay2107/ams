import { Attendance } from "@/interfaces/Interfaces"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const getAttendanceMarked = async (schedule_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/attendance/schedule/${schedule_id}/`)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
    }
}

export const saveAttendance = async (attendanceData: any) => {
    try {
        const response = await axios.post(`${API_URL}/attendance/save/`, {
            attendanceData
        })
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
    }
}

export const getStudentMonthlyAttendance = async (user_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/attendance/monthly`, {
            params: { user_id },
        })
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
    }
}

export const getStudentPeriodWiseAttendance = async (user_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/attendance/period-wise`, {
            params: { user_id },
        })
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
    }
}

export const getCurrentSemesterAttendanceSummary = async (user_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/attendance/current-semester`, {
            params: { user_id },
        })
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
    }
}

export const fetchDaysByLeaveFormStatus = async (student_id: string, status: "Required" | "Not-Required" | "Submitted") => {
    try {
        const response = await axios.get(`${API_URL}/attendance/leave_form_required`, {
            params: { student_id, status },
        })
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
    }
}