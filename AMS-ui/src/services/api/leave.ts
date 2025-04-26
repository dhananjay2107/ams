import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const fetchLeave = async (student_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/leave/student`, {
            params: { student_id },
        })
        return response.data
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const fetchLeaveSubmitted = async (faculty_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/leave/faculty/`, {
            params: { faculty_id },
        })
        return response.data
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const submitLeave = async (leaveData: any) => {
    try {
        const response = await axios.post(`${API_URL}/leave/submit-leave/`, leaveData)
        return response.data
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const approveLeave = async (leave_id: string, leave_status: string) => {
    try {
        const response = await axios.patch(`${API_URL}/leave/approve-leave/`, {
            leave_id,
            leave_status,
        })
        return response.data
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const fetchLeaveById = async (leave_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/leave/${leave_id}/`)
        return response.data
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const getLeavesForFaculty = async (user_id: string) => {
    try {
        const reponse = await axios.get(`${API_URL}/leave/faculty`, {
            params: { user_id }
        })
        return reponse.data
    } catch (error: any) {
        throw Error(error.message)
    }
}