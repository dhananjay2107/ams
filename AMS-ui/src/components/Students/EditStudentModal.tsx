'use client'
import { Batch, Program, Student } from '@/interfaces/Interfaces'
import { parseDate } from "@internationalized/date";
import { Button, DateInput, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, Radio, RadioGroup, Select, SelectItem } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import Loader from '../Loader/Loader'
import { BiChevronDown, BiChevronUp } from 'react-icons/bi'
import { getBatches } from '@/services/api/batch'
import { getPrograms } from '@/services/api/program'

interface EditStudenteModalProps {
    isOpen: boolean
    onOpenChange: () => void
    studentData: Student
}

const EditStudentModal: React.FC<EditStudenteModalProps> = ({ isOpen, onOpenChange, studentData }) => {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [programs, setPrograms] = useState<Program[]>([])
    const [batches, setBatches] = useState<Batch[]>()
    const [student, setStudent] = useState(studentData)
    const [showOptionalFields, setShowOptionalFields] = useState(false)
    const [joinDate, setJoinDate] = useState<DateValue | null>(studentData.join_date ? parseDate(studentData.join_date) : null);
    const [endDate, setEndDate] = useState<DateValue | null>(studentData.end_date ? parseDate(studentData.end_date) : null);
    const [dob, setDob] = useState<DateValue | null>(studentData.dob ? parseDate(studentData.dob) : null);

    useEffect(() => {
        if (isOpen) {
            getBatches().then(setBatches)
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen) {
            getPrograms().then(setPrograms)
        }
    }, [isOpen])

    useEffect(() => {
        setStudent(studentData)
    }, [isOpen])

    const handleReset = () => {
        setDob(null)
        setJoinDate(null)
        setEndDate(null)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
        e.preventDefault()
        const student_data: Student = {
            first_name: student.first_name,
            middle_name: student.middle_name,
            last_name: student.last_name,
            email: student.email,
            phone_no: student.phone_no,
            gender: student.gender,
            dob: student.dob,
            adm_no: student.adm_no,
            reg_no: student.reg_no,
            batch_id: student.batch_id,
            program_id: student.program_id,
            join_date: student.join_date,
            end_date: student.end_date,
            status: student.status,
            adm_year: student.adm_year,
        }

        console.log(JSON.stringify(student_data))
    }

    const toggleOptionalFields = () => {
        setShowOptionalFields(!showOptionalFields)
    }

    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size='xl' scrollBehavior='inside'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Edit Student</ModalHeader>
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
                                        onChange={(e) => setStudent({ ...student, first_name: e.target.value })}
                                        value={student.first_name}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        variant="bordered"
                                        isRequired
                                        name='email'
                                        onChange={(e) => setStudent({ ...student, email: e.target.value })}
                                        value={student.email}
                                    />
                                    <Input
                                        label="Phone Number"
                                        type='number'
                                        variant="bordered"
                                        maxLength={10}
                                        isRequired
                                        name='phone_no'
                                        onChange={(e) => setStudent({ ...student, phone_no: e.target.value })}
                                        value={student.phone_no}
                                    />
                                    <Select
                                        className="max-w-xs"
                                        items={programs}
                                        label="Program"
                                        placeholder="Select Program"
                                        variant='bordered'
                                        name='program_id'
                                        isRequired
                                        onChange={(e) => setStudent({ ...student, program_id: e.target.value })}
                                    >
                                        {(program) => <SelectItem key={program._id}>{program.program_name}</SelectItem>}
                                    </Select>
                                    <Input
                                        label="Admission Number"
                                        variant="bordered"
                                        type='text'
                                        name='adm_no'
                                        isRequired
                                        value={student.adm_no}
                                        onChange={(e) => setStudent({ ...student, adm_no: e.target.value })}
                                    />
                                    {/* <RadioGroup label="Status" name='status' isRequired defaultValue={student.status} onChange={(e) => setStudent({ ...student, status: e.target.value })} orientation="horizontal">
                                        <Radio value="Active">Active</Radio>
                                        <Radio value="Discontinued">Discontinued</Radio>
                                        <Radio value="Completed">Completed</Radio>
                                    </RadioGroup> */}

                                    <Button variant='light' onPress={toggleOptionalFields} startContent={showOptionalFields ? <BiChevronUp /> : <BiChevronDown />} >{showOptionalFields ? 'Hide Optional Fields' : 'Show Optional Fields'}</Button>

                                    {showOptionalFields && (
                                        <div className='flex flex-col gap-5'>
                                            <Input
                                                label="Middle Name"
                                                variant="bordered"
                                                type='text'
                                                name='middle_name'
                                                value={student.middle_name ? student.middle_name : ""}
                                                onChange={(e) => setStudent({ ...student, middle_name: e.target.value })}
                                            />
                                            <Input
                                                label="Last Name"
                                                variant="bordered"
                                                type='text'
                                                name='last_name'
                                                value={student.last_name ? student.last_name : ""}
                                                onChange={(e) => setStudent({ ...student, last_name: e.target.value })}
                                            />
                                            {/* <RadioGroup label="Gender" name='gender' defaultValue={student.gender} onChange={(e) => setStudent({ ...student, gender: e.target.value })} orientation="horizontal">
                                                <Radio value="Male">Male</Radio>
                                                <Radio value="Female">Female</Radio>
                                                <Radio value="Others">Others</Radio>
                                            </RadioGroup> */}
                                            <DateInput
                                                label="Birth Date"
                                                onChange={setDob}
                                                value={dob}
                                            />
                                            <Input
                                                onChange={(e) => setStudent({ ...student, reg_no: e.target.value })}
                                                label="Register Number"
                                                variant="bordered"
                                                type='text'
                                                name='reg_no'
                                                value={student.reg_no ? student.reg_no : ""}
                                            />
                                            <Select
                                                className="max-w-xs"
                                                items={batches}
                                                label="Batch"
                                                placeholder="Select Batch"
                                                variant='bordered'
                                                name='batch_id'
                                                onChange={(e) => setStudent({ ...student, batch_id: e.target.value })}
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

export default EditStudentModal