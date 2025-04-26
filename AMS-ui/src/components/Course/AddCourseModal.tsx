'use client'
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem } from '@heroui/react'
import { useEffect, useState } from 'react'
import Loader from '../Loader/Loader'
import { Course, Program } from '@/interfaces/Interfaces'
import { createCourse } from '@/services/api/course'
import { toast } from 'react-toastify'
import { getPrograms } from '@/services/api/program'

interface AddCourseModalProps {
    isOpen: boolean
    onOpenChange: () => void
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onOpenChange }) => {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [programs, setPrograms] = useState<Program[]>([])
    const [formData, setFormData] = useState<Course>({
        course_code: "",
        course_name: "",
        semester: 0,
        program_id: ""
    })

    const getProgramsList = async () => {
        const program_data = await getPrograms()
        setPrograms(program_data)
    }

    useEffect(() => {
        if (isOpen) { getProgramsList() }
    }, [isOpen])

    const handleReset = () => {
        
    }

    const filterEmptyFields = (data: Course): Record<string, any> => {
        const filteredData: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== '' && value !== null && value !== undefined) {
                filteredData[key] = value;
            }
        }
        return filteredData;
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        if (name == 'semester') {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value === "" ? 0 : Number(value),
            }));
        }
        else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: any) => {
        e.preventDefault();
        setIsLoading(true)
        const filteredData = filterEmptyFields(formData)
        try {
            const response = await createCourse(filteredData)
            if (response) {
                toast.success(response, {
                    autoClose: 2000,
                    position: "top-right"
                })
                handleReset()
                onClose()
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
        }
        onClose()
    }

    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size='xl' scrollBehavior='inside'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Add New Course</ModalHeader>
                        <ModalBody>
                            <Form
                                validationBehavior='native'
                                onReset={handleReset}
                                onSubmit={(e) => handleSubmit(e, onClose)}
                            >
                                <div className='flex flex-col gap-5 w-full'>
                                    <Input
                                        label="Course Code:"
                                        variant="bordered"
                                        type='text'
                                        placeholder='Enter course code'
                                        name='course_code'
                                        isRequired
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Course Name"
                                        placeholder='Enter course name'
                                        variant="bordered"
                                        name='course_name'
                                        isRequired
                                        type='text'
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Semester"
                                        variant="bordered"
                                        placeholder='Enter semester'
                                        type='number'
                                        name='semester'
                                        isRequired
                                        onChange={handleChange}
                                    />
                                    <Select
                                        className="max-w-xs"
                                        items={programs}
                                        label="Program"
                                        placeholder="Select Program"
                                        variant='bordered'
                                        name='program_id'
                                        onChange={handleChange}
                                    >
                                        {(program) => <SelectItem key={program._id}>{program.program_name}</SelectItem>}
                                    </Select>
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

export default AddCourseModal