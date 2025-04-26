'use client'
import { verifyLogin } from '@/services/api/auth';
import { Input } from '@heroui/react'
import { useRouter } from 'next/navigation';
import { useState } from 'react'
import { MdMailOutline, MdLockOutline } from "react-icons/md";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const LoginForm = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleReset = () => {

  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await verifyLogin(email, password)
      if (response.status === "Inactive") {
        toast.success(response.message, {
          autoClose: 3000,
          position: "top-right"
        })
        router.push(`/change-password?email=${email}`)
        return
      }
      else {
        toast.success(response.message, {
          autoClose: 2000,
          position: "top-right"
        })
        const expiresInMinutes = 30;
        Cookies.set('access_token', response.access_token, {
          expires: expiresInMinutes / 1440,
          path: '/',
          secure: true,
          sameSite: 'Strict',
        });
        router.push("/")
      }
    }
    catch (error: any) {
      toast.error(error.message, {
        autoClose: 3000,
        position: "top-right"
      })
    }
  }
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} method="POST" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <Input
                  type='email'
                  placeholder='Enter your email'
                  isRequired
                  isClearable
                  variant='flat'
                  size='lg'
                  onChange={(e) => setEmail(e.target.value)}
                  startContent={<MdMailOutline />}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <Input
                  isRequired
                  isClearable
                  placeholder='Enter your password'
                  type='password'
                  variant='flat'
                  size='lg'
                  onChange={(e) => setPassword(e.target.value)}
                  startContent={<MdLockOutline />}
                />
              </div>
            </div>
            <div className="text-sm flex items-end">
              <a href="#" className="font-semibold text-primary-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-600 duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default LoginForm