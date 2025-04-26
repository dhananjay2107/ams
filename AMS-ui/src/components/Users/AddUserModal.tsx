'use client'
import React, { FormEvent, useState } from 'react'
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import Loader from '../Loader/Loader'
import { User } from '@/interfaces/Interfaces';
import { toast } from 'react-toastify';
import { addUser } from '@/services/api/users';

interface AddUserModalProps {
  isOpen: boolean
  onOpenChange: () => void
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onOpenChange }) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<User>({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    role: 'admin',
    status: 'Inactive',
  })

  const handleReset = () => {

  }
  const filterEmptyFields = (data: User): Record<string, any> => {
    const filteredData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== '' && value !== null && value !== undefined) {
        filteredData[key] = value;
      }
    }
    return filteredData;
  };

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>, onClose: any) => {
    e.preventDefault()
    setIsLoading(true);
    const filteredData = filterEmptyFields(formData);
    try {
      const response = await addUser(filteredData)
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
      setIsLoading(false);
    }
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
            <ModalHeader>Add New Admin User</ModalHeader>
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
                    onChange={handleChange}
                  />
                  <Input
                    label="Middle Name"
                    variant="bordered"
                    type='text'
                    name='middle_name'
                    onChange={handleChange}
                  />
                  <Input
                    label="Last Name"
                    variant="bordered"
                    type='text'
                    name='last_name'
                    onChange={handleChange}
                  />
                  <Input
                    label="Email"
                    type="email"
                    variant="bordered"
                    isRequired
                    name='email'
                    onChange={handleChange}
                  />
                </div>
                <div className='flex w-full justify-end gap-3 p-2'>
                  <Button color="danger" variant='light' type='reset'>
                    Reset
                  </Button>
                  <Button color="primary" type='submit'>
                    Submit
                  </Button>
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

export default AddUserModal