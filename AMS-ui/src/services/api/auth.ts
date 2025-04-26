import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const verifyLogin = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login/`, { email, password })
        return response.data
    }
    catch (error: any) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred';
            const errorStatus = error.response?.status || 'Unknown status';
            
            // Throw a detailed error with status and message
            throw new Error(`Error ${errorStatus}: ${errorMessage}`);
        }
        else{
            throw new Error('An unexpected error occurred');
        }
    }
}

export const changePassword = async (email: string, password: string) => {
    try{
        const response = await axios.post(`${API_URL}/auth/change-password/`, {password,  email})
        return response.data
    }
    catch (error: any) {
        throw Error(error.message)
    }
}