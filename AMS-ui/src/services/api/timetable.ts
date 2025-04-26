import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const saveTimetable = async (timetableData: any) => {
    try {
        const response = await axios.post(`${API_URL}/permanent_timetable/create/`, timetableData)
        return response.data
    }
    catch (error: any) {
        throw Error(error.message)
    }
}

export const generateSchedule = async (formData: any) => {
    try {
        const response = await axios.post(`${API_URL}/timetable/schedule/`, formData)
        return response.data
    }
    catch (error: any) {
        throw Error(error.message)
    }
}

export const fetchPermanentTimetable = async () => {
    try {
        const response = await axios.get(`${API_URL}/permanent_timetable/`)
        return response.data
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const fetchTemporaryTimetables = async()=>{
    try {
        const response = await axios.get(`${API_URL}/temporary_timetable/`)
        return response.data
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const fetchPeriodTiming = async () => {
    try {
        const response = await axios.get(`${API_URL}/period_timings/`)
        return response.data
    } catch (error: any) {
        throw Error(error.message)
    }
}
