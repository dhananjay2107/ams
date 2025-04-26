'use client'
import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem } from '@heroui/react'
import Loader from '../Loader/Loader'
import { Course, Program } from '@/interfaces/Interfaces'
import { getPrograms } from '@/services/api/program'
import { toast } from 'react-toastify'
import { updateCourse } from '@/services/api/course'

interface EditCourseModalProps {
    isOpen: boolean
    onOpenChange: () => void
    courseData: Course
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ isOpen, onOpenChange, courseData }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [programs, setPrograms] = useState<Program[]>([])
    const [course, setCourse] = useState(courseData)

    const getProgramsList = async () => {
        const program_data = await getPrograms()
        setPrograms(program_data)
    }

    useEffect(() => {
        if (isOpen) {
            getProgramsList()
            setCourse(courseData)
        }
    }, [isOpen, courseData])

    const handleReset = () => {

    }

    const filterEmptyFields = (data: Course): Record<string, any> => {
        const filteredData: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            if (value == '') {
                filteredData[key] = null;
            }
            else {
                filteredData[key] = value;
            }

        }
        return filteredData;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
        e.preventDefault();
        setIsLoading(true)
        const course_data: Course = {
            course_code: course.course_code,
            course_name: course.course_name,
            semester: course.semester,
            program_id: course.program_id
        }
        const filteredData = filterEmptyFields(course_data)
        try {
            const response = await updateCourse(course._id, filteredData)
            if (response) {
                toast.success(response, {
                    autoClose: 2000,
                    position: "top-right"
                })
                handleReset()
            }
        }
        catch (error: any) {
            toast.error(error.message, {
                autoClose: 2000,
                position: "top-right"
            })
        }
        finally {
            setIsLoading(false);
            onClose()
        }
    }

    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size='xl' scrollBehavior='inside'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Edit Course</ModalHeader>
                        <ModalBody>
                            <Form
                                validationBehavior='native'
                                onReset={handleReset}
                                onSubmit={(e) => handleSubmit(e, onClose)}
                            >
                                <div className='flex flex-col gap-5 w-full'>
                                    <Input
                                        label="Course Code"
                                        variant="bordered"
                                        type='text'
                                        name='course_code'
                                        isRequired
                                        value={course.course_code}
                                        onChange={(e) => setCourse({ ...course, course_code: e.target.value })}
                                    />
                                    <Input
                                        label="Course Name"
                                        variant="bordered"
                                        name='name'
                                        type='text'
                                        isRequired
                                        value={course.course_name}
                                        onChange={(e) => setCourse({ ...course, course_name: e.target.value })}
                                    />
                                    <Input
                                        label="Semester"
                                        variant="bordered"
                                        type='number'
                                        name='semester'
                                        value={course.semester.toString()}
                                        onChange={(e) => setCourse({ ...course, semester: parseInt(e.target.value) })}
                                    />

                                    <Select
                                        className="max-w-xs"
                                        label="Program"
                                        placeholder="Select Program"
                                        variant='bordered'
                                        name='program_id'
                                        value={course.program_id || ''}
                                        onChange={(e) => setCourse({ ...course, program_id: e.target.value })}
                                    >
                                        {programs.map((program) => (<SelectItem key={program._id}>{program.program_name}</SelectItem>))}
                                    </Select>

                                    <div className='flex w-full justify-end gap-3 p-2'>
                                        <Button color="danger" variant='light' type='reset'>
                                            Reset
                                        </Button>
                                        <Button color="primary" type='submit'>
                                            Save
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

export default EditCourseModal