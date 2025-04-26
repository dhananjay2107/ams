import { Faculty, PaginatedResponse, Student, User } from "@/interfaces/Interfaces";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL
type CurrentState = { success: boolean; error: boolean; message: string };

export const addStudent = async (student: any) => {
    try {
        const response = await fetch(`${API_URL}/student/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(student),
        });

        if (response.ok) {
            const data = await response.json()
            return data.message
            //return await response.json()
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

export const addFaculty = async (faculty: any) => {
    try {
        const response = await fetch(`${API_URL}/faculty/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(faculty),
        });

        if (response.ok) {
            const data = await response.json()
            return data.message
            //return await response.json()
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

export const getStudents = async ()=> {
    try {
        const response = await axios.get(`${API_URL}/student/`)
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

export const getFaculties = async () => {
    try {
        const response = await axios.get(`${API_URL}/faculty/`)
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

export const addUser = async (user: any) => {
    try {
        const response = await fetch(`${API_URL}/user/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
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
        throw Error(error.detail)
    }
}

export const getUsers = async ()=> {
    try {
        const response = await axios.get(`${API_URL}/user/`)
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

export const getStudent = async (user_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/student/${user_id}/`)
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

export const getStudentsByBatch = async (batch_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/student/batch/${batch_id}/`)
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
        else {
            throw Error("Unknown Error")
        }
    }
}

export const getFacultyInCharge = async (user_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/student/batch/faculty`, {
            params: { user_id },
        })
        return response.data
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        }
        else {
            throw Error("Unknown Error")
        }
    }
}

export const importStudents = async (currentState: CurrentState, formData: FormData) => {
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

        const response = await axios.post('http://localhost:8000/student/upload/', axiosFormData, {
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

export const importFaculties = async (currentState: CurrentState, formData: FormData) => {
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

        const response = await axios.post('http://localhost:8000/faculty/upload/', axiosFormData, {
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