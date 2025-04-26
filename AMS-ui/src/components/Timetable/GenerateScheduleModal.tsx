'use client'
import { Batch } from '@/interfaces/Interfaces'
import { getBatches } from '@/services/api/batch'
import { Button, DateInput, DateValue, Form, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem, useDisclosure, Selection } from '@heroui/react'
import React, { Key, useEffect, useState } from 'react'
import Loader from '../Loader/Loader'
import { toast } from 'react-toastify'
import { generateSchedule } from '@/services/api/timetable'

const GenerateScheduleModal = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [startDate, setStartDate] = useState<DateValue | null>();
    const [selectedBatches, setSelectedBatches] = useState<Selection>(new Set([]))
    const [batches, setBatches] = useState<Batch[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        if (isOpen) {
            getBatches().then(setBatches)
        }
    }, [isOpen])

    const handleReset = () => {
        setSelectedBatches(new Set([]))
        setStartDate(null)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
        e.preventDefault();
        setIsLoading(true)
        if (!startDate) {
            toast.error("Start Date must be selected", {
                autoClose: 2000,
                position: "top-right"
            })
            return;
        }
        const formData = {
            batches: Array.from(selectedBatches),
            start_date: startDate?.toString(),
        }
        try {
            const response = await generateSchedule(formData)
            if (response) {
                toast.success(response, {
                    autoClose: 2000,
                    position: "top-right"
                })
            }
        }
        catch (error: any) {
            toast.error(error.message, {
                autoClose: 2000,
                position: "top-right"
            })
        }
        finally {
            onClose()
            setIsLoading(false);
        }
    }

    return (
        <div>
            <Button onPress={onOpen} className='p-3 border bg-primary hover:bg-secondary rounded-lg text-white duration-300'>Generate</Button>
            <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} size='xl' scrollBehavior='inside'>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Generate Schedule</ModalHeader>
                            <ModalBody>
                                <Form
                                    validationBehavior='native'
                                    onReset={handleReset}
                                    onSubmit={(e) => handleSubmit(e, onClose)}
                                >
                                    <div className='flex flex-col gap-5 w-full'>
                                        <Select
                                            className="max-w-xs"
                                            label="Batch"
                                            placeholder="Select Batches"
                                            variant='bordered'
                                            isRequired
                                            selectionMode='multiple'
                                            onSelectionChange={setSelectedBatches}
                                        >
                                            {batches.map((batch) => (<SelectItem key={batch._id}>{batch.batch_name}</SelectItem>))}
                                        </Select>
                                        <DateInput
                                            className="max-w-xs"
                                            label="Start Date"
                                            onChange={setStartDate}
                                            value={startDate}
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
            </Modal>
        </div>
    )
}

export default GenerateScheduleModal