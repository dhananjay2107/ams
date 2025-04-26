'use client'
import { Button, DateInput, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, Radio, RadioGroup, Select, SelectItem } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import Loader from '../Loader/Loader'
import { Faculty, Program } from '@/interfaces/Interfaces'
import { getPrograms } from '@/services/api/program'
import { BiChevronDown, BiChevronUp } from 'react-icons/bi'
import { addFaculty } from '@/services/api/users'
import { toast } from 'react-toastify'

interface AddFacultyModalProps {
  isOpen: boolean
  onOpenChange: () => void
}

const AddFacultyModal: React.FC<AddFacultyModalProps> = ({ isOpen, onOpenChange }) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [programs, setPrograms] = useState<Program[]>([])
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [joinDate, setjoinDate] = useState<DateValue | null>();
  const [endDate, setEndDate] = useState<DateValue | null>();
  const [dob, setDob] = useState<DateValue | null>();
  const initialFormData: Faculty = {
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_no: "",
    gender: null,
    dob: "",
    program_id: "",
    join_date: "",
    end_date: "",
    status: "Active",
  }
  const [formData, setFormData] = useState<Faculty>(initialFormData)

  const getProgramsList = async () => {
    const program_data = await getPrograms()
    setPrograms(program_data)
  }

  useEffect(() => {
    if (isOpen) { getProgramsList() }
  }, [isOpen])

  const filterEmptyFields = (data: Faculty): Record<string, any> => {
    const filteredData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== '' && value !== null && value !== undefined) {
        filteredData[key] = value;
      }
    }
    return filteredData;
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setDob(null)
    setjoinDate(null)
    setEndDate(null)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
    e.preventDefault();
    setIsLoading(true)
    formData.join_date = joinDate?.toString()
    formData.end_date = endDate?.toString()
    formData.dob = dob?.toString()

    const filteredData = filterEmptyFields(formData);
    try {
      const response = await addFaculty(filteredData)
      if (response) {
        toast.success(response)
        handleReset()
        onClose()
      }
    } catch (error: any) {
      toast.error(error.message)
    }
    finally {
      setShowOptionalFields(!showOptionalFields)
      setIsLoading(false);
    }
  }
  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size='xl' scrollBehavior='inside'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Add New Faculty</ModalHeader>
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
                  <RadioGroup isRequired label="Status" name='status' defaultValue={formData.status} onChange={handleChange} orientation="horizontal">
                    <Radio value="Active">Active</Radio>
                    <Radio value="Resigned">Resigned</Radio>
                  </RadioGroup>
                  <Button variant='light' onPress={toggleOptionalFields} startContent={showOptionalFields ? <BiChevronUp /> : <BiChevronDown />} >{showOptionalFields ? 'Hide Optional Fields' : 'Show Optional Fields'}</Button>

                  {showOptionalFields && (<div className='flex flex-col gap-5'>
                    <Input
                      label="Middle Name"
                      variant="bordered"
                      type='text'
                      name='middle_name'
                      value={formData.middle_name}
                      onChange={handleChange}
                    />
                    <Input
                      label="Last Name"
                      variant="bordered"
                      type='text'
                      name='last_name'
                      value={formData.last_name}
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
                    <DateInput label="Joining Date" onChange={setjoinDate} value={joinDate} />
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

export default AddFacultyModal