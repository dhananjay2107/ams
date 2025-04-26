import { Batch, PaginatedResponse } from "@/interfaces/Interfaces";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

type CurrentState = { success: boolean; error: boolean; message: string };

export const createBatch = async (batch: any) => {
    try {
        const response = await fetch(`${API_URL}/batch/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(batch),
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

export const getBatches = async () => {
    try {
        const response = await axios.get(`${API_URL}/batch/`)
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

export const getBatch = async (user_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/batch/${user_id}`)
        return response.data
    }
    catch (error: any) {
        throw Error(error.message)
    }
}

export const deleteBatch = async (currentState: CurrentState, data: FormData) => {

    const batch_id = data.get("id")
    try {
        const response = await axios.delete(`${API_URL}/batch/${batch_id}/`)
        return { success: true, error: false, message: response.data.message }
    }
    catch (err: any) {
        return { success: false, error: true, message: err.message }
    }
}

export const importBatches = async (currentState: CurrentState, formData: FormData) => {
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

        const response = await axios.post('http://localhost:8000/batch/upload/', axiosFormData, {
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