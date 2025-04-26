import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const Home = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) {
        return redirect('/login');
    }
    const decoded_token: any = jwtDecode(token)
    if (decoded_token.role == 'admin') {
        return redirect('/admin/dashboard');
    }
    else if (decoded_token.role == 'faculty') {
        return redirect('/faculty/dashboard');
    }
    else if (decoded_token.role == 'student') {
        return redirect('/student/dashboard');
    }
    else{
        return null
    }
}

export default Home