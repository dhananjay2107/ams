import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const fetchTimetableSchedule = async (batch_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/timetable/schedule/${batch_id}/`)
        return response.data
    }
    catch (error: any) {
        throw Error(error.message)
    }
}

export const fetchFacultySchedule = async (user_id: string, date: string) => {
    try{
        const response = await axios.get(`${API_URL}/timetable/faculty-schedule/${user_id}/`,{
            params: { date: date }
        })
        return response.data
    }
    catch(error:any){
        throw Error(error.message)
    }
}