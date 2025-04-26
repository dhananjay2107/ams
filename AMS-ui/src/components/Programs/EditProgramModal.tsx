'use client'
import { Program } from '@/interfaces/Interfaces'
import { Button, Form, Input, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import Loader from '../Loader/Loader'
import { toast } from 'react-toastify'
import { updateProgram } from '@/services/api/program'

interface EditProgramModalProps {
    isOpen: boolean
    onOpenChange: () => void
    programData: Program
}

const EditProgramModal: React.FC<EditProgramModalProps> = ({ isOpen, onOpenChange, programData }) => {
    const [program, setProgram] = useState(programData)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        setProgram(programData)
    }, [programData])

    const handleReset = () => {

    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: any) => {
        e.preventDefault();
        setIsLoading(true)
        const program_data: Program = {
            program_name: program.program_name
        }
        try {
            const response = await updateProgram(program._id, program_data)
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
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size='md' scrollBehavior='inside'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Edit Program</ModalHeader>
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
                                        value={program.program_name}
                                        onChange={(e) => setProgram({ ...program, program_name: e.target.value })}
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

export default EditProgramModal