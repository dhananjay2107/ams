'use client'
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import Loader from '../Loader/Loader'
import { day_attendance, Faculty, Leave } from '@/interfaces/Interfaces'
import { getFacultyInCharge } from '@/services/api/users'
import { getFullName } from '@/utilities/utils'
import { submitLeave } from '@/services/api/leave'
import { toast } from 'react-toastify'
import { fetchDaysByLeaveFormStatus } from '@/services/api/attendance'

interface ApplyLeaveModalProps {
    isOpen: boolean
    onOpenChange: () => void
    user: any
}

const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onOpenChange, user }) => {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [faculty, setFaculty] = useState<Faculty>()
    const [days, setDays] = useState<day_attendance[]>([])
    const [leaveFormData, setLeaveFormData] = useState<Leave>({
        student_id: "",
        leave_date: "",
        leave_reason: "",
        faculty_id: "",
        status: "Submitted",
    })

    useEffect(() => {
        const fetchFaculty = async () => {
            if (user && user._id) {
                const faculty_in_charge = await getFacultyInCharge(user._id);
                setFaculty(faculty_in_charge)
            }
        }
        const getDayAttendance = async () => {
            if (user && user._id) {
                const dayAttendance = await fetchDaysByLeaveFormStatus(user._id, "Required");
                setDays(dayAttendance)
            }
        }
        if (user) {
            fetchFaculty()
            getDayAttendance()
        }
    }, [user])


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
        e.preventDefault()
        setIsLoading(true)
        leaveFormData.faculty_id = faculty?.user_id ?? ""
        leaveFormData.student_id = user._id
        try {
            const response = await submitLeave(leaveFormData)
            if (response) {
                toast.success(response, {
                    autoClose: 2000,
                    position: "top-right"
                })
                handleReset()
                onClose()
            }
        } catch (error: any) {
            toast.error(error.message, {
                autoClose: 2000,
                position: "top-right"
            })
        }
        finally {
            setIsLoading(false)
        }
    }
    const handleReset = () => {
    }
    const handleChange = (e: any) => {
        setLeaveFormData({
            ...leaveFormData,
            [e.target.name]: e.target.value
        });
    }

    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size='xl' scrollBehavior='inside'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Apply for a leave</ModalHeader>
                        <ModalBody>
                            <Form
                                validationBehavior='native'
                                onReset={handleReset}
                                onSubmit={(e) => handleSubmit(e, onClose)}
                            >
                                <div className='flex flex-col gap-5 w-full'>
                                    <Select
                                        placeholder='Select Date'
                                        variant='bordered'
                                        className="max-w-xs"
                                        name="leave_date"
                                        isRequired
                                        label="Date"
                                        onChange={handleChange}
                                    >
                                        {days.map((day) =>
                                            <SelectItem key={day.date}>{day.date}</SelectItem>
                                        )}
                                    </Select>
                                    <Input
                                        label="Leave Discription"
                                        variant="bordered"
                                        type='text'
                                        name='leave_reason'
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label='Faculty'
                                        variant='bordered'
                                        isReadOnly
                                        type='text'
                                        value={getFullName(faculty?.first_name ?? "", faculty?.middle_name, faculty?.last_name)}
                                    />
                                    <div className='flex w-full justify-end gap-3 p-2'>
                                        <Button color="danger" variant='light' type='reset'>
                                            Reset
                                        </Button>
                                        <Button color="primary" type='submit'>
                                            Submit
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </ModalBody>
                        {isLoading && (
                            <div className="absolute w-full h-full bg-white bg-opacity-50 flex justify-center items-center">
                                <Loader />
                            </div>
                        )}
                    </>
                )}
            </ModalContent>
        </Modal >
    )
}

export default ApplyLeaveModal