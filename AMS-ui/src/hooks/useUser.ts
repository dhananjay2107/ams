import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export const useUser = () => {
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        const token = Cookies.get('access_token')
        if (token) {
            try {
                const decodedToken: any = jwtDecode(token)
                setUser(decodedToken);
            }
            catch (error: any) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    return user;
};