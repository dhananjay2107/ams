'use client'
import { Batch, AssignCourse, Faculty, Course } from '@/interfaces/Interfaces'
import { getFaculties } from '@/services/api/users'
import { getFullName } from '@/utilities/utils'
import { Button, Divider, Form, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import Loader from '../Loader/Loader'
import { getBatches } from '@/services/api/batch'
import { toast } from 'react-toastify'
import { assignCourse } from '@/services/api/course'

interface AssignCourseModalProps {
    isOpen: boolean
    onClose: () => void
    data: Course
}

const AssignCourseModal: React.FC<AssignCourseModalProps> = ({ isOpen, onClose, data }) => {
    const [faculties, setFaculties] = useState<Faculty[]>([])
    const [batches, setBatches] = useState<Batch[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [courseData, setCourseData] = useState<Course>(data)
    const [formData, setFormData] = useState<AssignCourse>({
        course_id: '',
        faculty_id: '',
        batch_id: ''
    })

    const getFacultyList = async () => {
        const faculty_data = await getFaculties()
        setFaculties(faculty_data)
    }
    const getBatchList = async () => {
        const batch_data = await getBatches()
        setBatches(batch_data)
    }

    useEffect(() => {
        if (isOpen) {
            getFacultyList()
            getBatchList()
        }
        setCourseData(data)
    }, [isOpen, data])

    const filterEmptyFields = (data: AssignCourse): Record<string, any> => {
        const filteredData: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== '' && value !== null && value !== undefined) {
                filteredData[key] = value;
            }
        }
        return filteredData;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose:any) => {
        e.preventDefault()
        setIsLoading(true)
        formData.course_id = courseData._id!
        console.log(formData)
        const filteredData = filterEmptyFields(formData)
        try {
            const response = await assignCourse(filteredData)
            if (response) {
                toast.success(response)
                handleReset()
                onClose()
            }
            else {
                toast.error('Failed to assign course')
            }
        }
        catch (error: any) {
            toast.error(error.message)
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => { 
        onClose()
    }

    return (
        <Modal isOpen={isOpen} placement="top-center" onClose={onClose} size='xl' scrollBehavior='inside'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Assign Course</ModalHeader>
                        <ModalBody>
                            <Form
                                validationBehavior='native'
                                onReset={handleReset}
                                onSubmit={(e) => handleSubmit(e, onClose)}
                            >
                                <div className='w-full p-2'>
                                    <div className='mb-2'>
                                        <h1>Course code: {courseData.course_code}</h1>
                                    </div>
                                    <Divider />
                                    <div className='flex flex-col gap-2 my-3'>
                                        <div className='flex gap-2 items-center'>
                                            <label className='min-w-[100px] flex justify-end p-1'>Name</label>
                                            <label className='flex justify-start p-1'>{courseData.course_name}</label>
                                        </div>

                                        <div className='flex gap-2 items-center'>
                                            <label className='min-w-[100px] flex justify-end p-1'>Program</label>
                                            <label className='flex justify-start p-1'>{courseData.program?.program_name}</label>
                                        </div>
                                        <div className='flex gap-2 items-center'>
                                            <label className='min-w-[100px] flex justify-end p-1'>Faculty</label>
                                            <Select
                                                isRequired
                                                className="max-w-xs"
                                                label="Select Faculty"
                                                items={faculties}
                                                variant='bordered'
                                                name='faculty_id'
                                                onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                                            >
                                                {(faculty) => <SelectItem key={faculty.user_id}>{getFullName(faculty.first_name, faculty.middle_name, faculty.last_name)}</SelectItem>}
                                            </Select>
                                        </div>
                                        <div className='flex gap-2 items-center'>
                                            <label className='min-w-[100px] flex justify-end p-1'>Batch</label>
                                            <Select
                                                className="max-w-xs"
                                                items={batches}
                                                label="Select Batch"
                                                variant='bordered'
                                                name='batch_id'
                                                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                                            >
                                                {(batch) => <SelectItem key={batch._id}>{batch.batch_name}</SelectItem>}
                                            </Select>
                                        </div>
                                    </div>

                                    <Divider />
                                    <div className='flex justify-between p-2'>
                                        <Button variant='light' type='reset'>Cancel</Button>
                                        <Button variant='solid' color='primary' type='submit'>Assign</Button>
                                    </div>
                                </div>

                            </Form >
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

export default AssignCourseModal