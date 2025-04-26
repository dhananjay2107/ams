'use client'
import {useState} from 'react'
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import Loader from '../Loader/Loader'
import { toast } from 'react-toastify'
import { createProgram } from '@/services/api/program'
import { Program } from '@/interfaces/Interfaces'

interface AddProgramModalProps {
    isOpen: boolean,
    onOpenChange: () => void
}

const AddProgramModal: React.FC<AddProgramModalProps> = ({ isOpen, onOpenChange }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const handleReset = () => {

    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: any) => {
        e.preventDefault();
        setIsLoading(true);
        const form_data = Object.fromEntries(new FormData(e.currentTarget))
        const program_data: Program = { 
            program_name: form_data.program_name as string 
        }
        try {
            const response = await createProgram(program_data)
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
        
    }
    return (
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size='md' scrollBehavior='inside'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Add New Program</ModalHeader>
                        <ModalBody>
                            <Form
                                validationBehavior='native'
                                onReset={handleReset}
                                onSubmit={(e) => handleSubmit(e, onClose)}
                            >
                                <div className='flex flex-col gap-5 w-full'>
                                    <Input
                                        label="Program Name"
                                        variant="bordered"
                                        type='text'
                                        name='program_name'
                                        isRequired
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

export default AddProgramModal