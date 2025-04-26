import { Course, PaginatedResponse } from "@/interfaces/Interfaces";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

type CurrentState = { success: boolean; error: boolean; message: string };

export const createCourse = async (course: any) => {
    try {
        const response = await fetch(`${API_URL}/course/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(course),
        });
        if (response.ok) {
            const data = await response.json()
            return data.message
        }
        else {
            const errorData = await response.json()
            throw new Error(errorData.detail)
        }
    }
    catch (error: any) {
        throw Error(error.message)
    }
}

export const getCourses = async ()=> {
    try {
        const response = await axios.get(`${API_URL}/course/`,)
        return response.data
    }
    catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
        else {
            throw Error("Unknown Error")
        }
    }
}

export const updateCourse = async (course_id: any, course: any) => {
    try {
        const response = await fetch(`${API_URL}/course/${course_id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(course),

        });
        if (response.ok) {
            const data = await response.json()
            return data.message
        }
        else {
            const errorData = await response.json()
            throw new Error(errorData.detail)
        }
    }
    catch (error: any) {
        throw Error(error.message)
    }
}

export const getCourseById = async (course_id: any) => {
    try {
        const response = await fetch(`${API_URL}/course/${course_id}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.ok) {
            const data = await response.json()
            return data
        }
        else {
            const errorData = await response.json()
            throw new Error(errorData.detail)
        }
    }
    catch (error: any) {
        throw Error(error.message)
    }
}

export const assignCourse = async (data: any) => {
    try {
        const response = await fetch(`${API_URL}/course/${data.course_id}/assign/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            const data = await response.json()
            return data.message
        }
        else {
            const errorData = await response.json()
            throw new Error(errorData.detail)
        }
    }
    catch (error: any) {
        throw Error(error.message)
    }
}

export const getCoursesWithAssignments = async (semester: number, batch_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/course/course-with-faculty`, {
            params: {
                semester: semester,
                batch_id: batch_id
            }
        });
        return response.data
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const fetchCourseAssigned = async (course_id: string) => {
    try {
        const reponse = await axios.get(`${API_URL}/course/course_assigned`, {
            params: { course_id }
        })
        return reponse.data
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const deleteCourse = async (currentState: CurrentState, data: FormData) => {

    const course_id = data.get("id")
    try {
        const response = await axios.delete(`${API_URL}/course/${course_id}/`)
        return { success: true, error: false, message: response.data.message }
    }
    catch (err) {
        if (err instanceof Error){
            return { success: false, error: true, message: err.message }
        }
        else{
            return { success: false, error: true, message: "Unknown Error" }
        }
    }
}

export const importCourses = async (currentState: CurrentState, formData: FormData) => {
    const file = formData.get('file') as File
    if (!file) {
        return {
            success: false,
            error: true,
            message: 'No file selected.',
        }
    }
    try {
        const buffer = await file.arrayBuffer()
        const blob = new Blob([buffer], { type: file.type })

        const axiosFormData = new FormData()
        axiosFormData.append('file', blob, file.name)

        const response = await axios.post(`${API_URL}/course/upload/`, axiosFormData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return {
            success: true,
            error: false,
            message: response.data.message,
        }

    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                error: true,
                message: error.message,
            }
        }
        else {
            return {
                success: false,
                error: true,
                message: "Unknown Error Occurred",
            }
        }
    }
}