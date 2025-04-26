'use client'
import { Button, DateInput, DateValue, Form, Input, Modal, ModalBody, ModalContent, ModalHeader, Radio, RadioGroup, Select, SelectItem } from '@heroui/react'
import { useEffect, useState } from 'react'
import Loader from '../Loader/Loader'
import { toast } from 'react-toastify'
import { Batch, Faculty, Program } from '@/interfaces/Interfaces'
import { getPrograms } from '@/services/api/program'
import { createBatch } from '@/services/api/batch'
import { getFaculties } from '@/services/api/users'
import { getFullName } from '@/utilities/utils'

interface AddBatchModalProps {
  isOpen: boolean
  onOpenChange: () => void
}

const AddBatchModal: React.FC<AddBatchModalProps> = ({ isOpen, onOpenChange }) => {

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [startDate, setStartDate] = useState<DateValue | null>();
  const [endDate, setEndDate] = useState<DateValue | null>();

  const [formData, setFormData] = useState<Batch>({
    batch_name: "",
    faculty_in_charge: "",
    semester: 0,
    program_id: "",
    start_date: "",
    end_date: "",
    status: "Active"
  })

  const getProgramsList = async () => {
    const program_data = await getPrograms()
    setPrograms(program_data)
  }

  const getFacultyList = async () => {
    const faculty_data = await getFaculties()
    setFaculties(faculty_data)
  }

  useEffect(() => {
    if (isOpen) {
      getProgramsList()
      getFacultyList()
    }
  }, [isOpen])

  const handleReset = () => {
    setStartDate(null)
    setEndDate(null)
  }

  const filterEmptyFields = (data: Batch): Record<string, any> => {
    const filteredData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== '' && value !== null && value !== undefined) {
        filteredData[key] = value;
      }
    }
    return filteredData;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
    e.preventDefault()
    setIsLoading(true)
    formData.start_date = startDate?.toString()
    formData.end_date = endDate?.toString()
    const filteredData = filterEmptyFields(formData)
    try {
      const response = await createBatch(filteredData)
      if (response) {
        toast.success(response)
        handleReset()
        onClose()
      }
    }
    catch (error: any) {
      toast.error(error.message)
    }
    finally {
      setIsLoading(false);
    }
    onClose()
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
            <ModalHeader>Add New Course</ModalHeader>
            <ModalBody>
              <Form
                validationBehavior='native'
                onReset={handleReset}
                onSubmit={(e) => handleSubmit(e, onClose)}
              >
                <div className='flex flex-col gap-5 w-full'>
                  <Input
                    label="Batch Name"
                    placeholder='Enter Batch name'
                    variant="bordered"
                    name='batch_name'
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
                    isRequired
                    className="max-w-xs"
                    items={faculties}
                    label="Faculty In Charge"
                    placeholder="Select Faculty"
                    variant='bordered'
                    name='faculty_in_charge'
                    onChange={handleChange}
                  >
                    {(faculty) => <SelectItem key={faculty.user_id}>{getFullName(faculty.first_name, faculty.middle_name, faculty.last_name)}</SelectItem>}
                  </Select>
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
                  <DateInput label="Joining Date" onChange={setStartDate} value={startDate} />
                  <DateInput label="End Date" onChange={setEndDate} value={endDate} />
                  <RadioGroup label="Status" name='status' isRequired defaultValue={formData.status} onChange={handleChange} orientation="horizontal">
                    <Radio value="Active">Active</Radio>
                    <Radio value="Inactive">Inactive</Radio>
                  </RadioGroup>
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

export default AddBatchModal