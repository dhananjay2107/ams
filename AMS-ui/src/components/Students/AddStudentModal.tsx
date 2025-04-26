'use client'
import { addStudent } from '@/services/api/users';
import { Button, DateInput, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, Radio, RadioGroup, Select, SelectItem } from '@heroui/react';
import { DateValue } from "@internationalized/date";
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import Loader from '../Loader/Loader';
import { getPrograms } from '@/services/api/program';
import { Batch, Program, Student } from '@/interfaces/Interfaces';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { getBatches } from '@/services/api/batch';

interface AddStudentModalProps {
    isOpen: boolean
    onOpenChange: () => void
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onOpenChange }) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [programs, setPrograms] = useState<Program[]>([])
    const [batches, setBatches] = useState<Batch[]>()
    const [showOptionalFields, setShowOptionalFields] = useState(false)
    const [joinDate, setJoinDate] = useState<DateValue | null>();
    const [endDate, setEndDate] = useState<DateValue | null>();
    const [dob, setDob] = useState<DateValue | null>();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
    const initialFormData: Student = {
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_no: "",
        gender: null,
        dob: "",
        adm_no: "",
        reg_no: "",
        batch_id: "",
        program_id: "",
        join_date: "",
        end_date: "",
        status: "Active",
        adm_year: ""
    };
    const [formData, setFormData] = useState<Student>(initialFormData)

    useEffect(() => {
        if (isOpen) {
            getBatches().then(setBatches)
        }
    }, [isOpen])

    const getProgramsList = async () => {
        const program_data = await getPrograms()
        setPrograms(program_data)
    }

    useEffect(() => {
        if (isOpen) {
            getProgramsList()
        }
    }, [isOpen])

    const handleReset = () => {
        setFormData(initialFormData);
        setJoinDate(null)
        setEndDate(null)
        setDob(null)
    }

    const filterEmptyFields = (data: Student): Record<string, any> => {
        const filteredData: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== '' && value !== null && value !== undefined) {
                filteredData[key] = value;
            }
        }
        return filteredData;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
        e.preventDefault();
        setIsLoading(true)
        formData.join_date = joinDate?.toString()
        formData.end_date = endDate?.toString()
        formData.dob = dob?.toString()
        const filteredData = filterEmptyFields(formData);
        console.log(filteredData)
        try {
            const response = await addStudent(filteredData)
            if (response) {
                toast.success(response, {
                    autoClose: 2000,
                    position: "top-right"
                })
                handleReset()
                setShowOptionalFields(false)
                onClose()
            }
        } catch (error: any) {
            toast.error(error.message, {
                autoClose: 2000,
                position: "top-right"
            })
        }
        finally {
            setShowOptionalFields(!showOptionalFields)
            setIsLoading(false);
        }
    }

    const toggleOptionalFields = () => {
        setShowOptionalFields(!showOptionalFields)
    }
    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size='xl' scrollBehavior='inside'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Add New Student</ModalHeader>
                        <ModalBody>
                            <Form
                                validationBehavior='native'
                                onReset={handleReset}
                                onSubmit={(e) => handleSubmit(e, onClose)}
                            >
                                <div className='flex flex-col gap-5 w-full'>
                                    <Input
                                        label="First Name"
                                        variant="bordered"
                                        type='text'
                                        isRequired
                                        name='first_name'
                                        value={formData.first_name}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        variant="bordered"
                                        isRequired
                                        name='email'
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Phone Number"
                                        type='number'
                                        variant="bordered"
                                        maxLength={10}
                                        isRequired
                                        name='phone_no'
                                        value={formData.phone_no}
                                        onChange={handleChange}
                                    />
                                    <Select
                                        className="max-w-xs"
                                        label="Admission year"
                                        variant='bordered'
                                        name='adm_year'
                                        placeholder="Select Yearm"
                                        isRequired
                                        value={formData.adm_year}
                                        onChange={handleChange}
                                    >
                                        {years.map((year) => (
                                            <SelectItem key={year.toString()}>{year.toString()}</SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        className="max-w-xs"
                                        items={programs}
                                        label="Program"
                                        placeholder="Select Program"
                                        variant='bordered'
                                        name='program_id'
                                        isRequired
                                        value={formData.program_id}
                                        onChange={handleChange}
                                    >
                                        {(program) => <SelectItem key={program._id}>{program.program_name}</SelectItem>}
                                    </Select>
                                    <Input
                                        label="Admission Number"
                                        variant="bordered"
                                        type='text'
                                        name='adm_no'
                                        isRequired
                                        value={formData.adm_no}
                                        onChange={handleChange}
                                    />
                                    <RadioGroup label="Status" name='status' isRequired defaultValue={formData.status} onChange={handleChange} orientation="horizontal">
                                        <Radio value="Active">Active</Radio>
                                        <Radio value="Discontinued">Discontinued</Radio>
                                        <Radio value="Completed">Completed</Radio>
                                    </RadioGroup>

                                    <Button variant='light' onPress={toggleOptionalFields} startContent={showOptionalFields ? <BiChevronUp /> : <BiChevronDown />} >{showOptionalFields ? 'Hide Optional Fields' : 'Show Optional Fields'}</Button>

                                    {showOptionalFields && (
                                        <div className='flex flex-col gap-5'>
                                            <Input
                                                label="Middle Name"
                                                variant="bordered"
                                                type='text'
                                                name='middle_name'
                                                value={formData.middle_name ?? ""}
                                                onChange={handleChange}
                                            />
                                            <Input
                                                label="Last Name"
                                                variant="bordered"
                                                type='text'
                                                name='last_name'
                                                value={formData.last_name ?? ""}
                                                onChange={handleChange}
                                            />
                                            <RadioGroup label="Gender" name='gender' defaultValue={formData.gender} onChange={handleChange} orientation="horizontal">
                                                <Radio value="Male">Male</Radio>
                                                <Radio value="Female">Female</Radio>
                                                <Radio value="Others">Others</Radio>
                                            </RadioGroup>
                                            <DateInput
                                                label="Birth Date"
                                                onChange={setDob}
                                                value={dob}
                                            />
                                            <Input
                                                onChange={handleChange}
                                                label="Register Number"
                                                variant="bordered"
                                                type='text'
                                                value={formData.reg_no ?? ""}
                                                name='reg_no'
                                            />
                                            <Select
                                                className="max-w-xs"
                                                items={batches}
                                                label="Batch"
                                                placeholder="Select Batch"
                                                variant='bordered'
                                                name='batch_id'
                                                onChange={handleChange}
                                                value={formData.batch_id ?? ""}
                                            >
                                                {(batch) => <SelectItem key={batch._id}>{batch.batch_name}</SelectItem>}
                                            </Select>
                                            <DateInput label="Joining Date" onChange={setJoinDate} value={joinDate} />
                                            <DateInput label="End Date" onChange={setEndDate} value={endDate} />
                                        </div>
                                    )}
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

export default AddStudentModal