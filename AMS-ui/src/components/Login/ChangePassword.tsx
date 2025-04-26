'use client'
import ChangePasswordPage from '@/app/(login)/change-password/page'
import { changePassword } from '@/services/api/auth'
import { Input } from '@heroui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect } from 'react'
import { MdLockOutline } from 'react-icons/md'
import { toast } from 'react-toastify'

const ChangePasswordForm = () => {

    const router = useRouter()
    const searchParams = useSearchParams()

    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [errorMessage, setErrorMessage] = React.useState('')

    useEffect(() => {
        const emailFromURL = searchParams.get('email');
        if (emailFromURL) {
            setEmail(emailFromURL);
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match')
            return
        }
        try {
            const response = await changePassword(email, password)
            toast.success(response.message, {
                autoClose: 2000,
                position: "top-right"
            })
            router.push("/login")
        }
        catch (error: any) {
            toast.error(error.detail, {
                autoClose: 2000,
                position: "top-right"
            })
        }
    }
    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Change Password
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={handleSubmit} method="POST" className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                Password
                            </label>
                            <div className="mt-2">
                                <Input
                                    type='password'
                                    placeholder='Enter your password'
                                    isRequired
                                    variant='flat'
                                    size='lg'
                                    onChange={(e) => setPassword(e.target.value)}
                                    startContent={<MdLockOutline />}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    Conifrm Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <Input
                                    isRequired
                                    placeholder='Confirm Password'
                                    type='password'
                                    variant='flat'
                                    size='lg'
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    startContent={<MdLockOutline />}
                                />
                                {errorMessage && <p>{errorMessage}</p>}
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-lg bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-600 duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

const SuspenseWrapper = () => {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ChangePasswordPage />
      </Suspense>
    );
  };

export default SuspenseWrapper