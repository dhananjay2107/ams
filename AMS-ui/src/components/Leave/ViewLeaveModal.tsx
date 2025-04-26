import { Button, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem } from '@heroui/react'
import React, { useState } from 'react'
import Loader from '../Loader/Loader'
import { getFullName } from '@/utilities/utils'
import { approveLeave } from '@/services/api/leave'
import { toast } from 'react-toastify'
interface ViewLeaveModalProps {
    isOpen: boolean
    onClose: () => void
    leaveData: any
}
const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({ isOpen, onClose, leaveData }) => {
    const [selectedStatus, setSelectedStatus] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleCancel = () => {
        setSelectedStatus("")
        onClose()
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        const leaveStatus = selectedStatus
        const leaveId = leaveData._id
        try {
            const response = await approveLeave(leaveId, leaveStatus)
            if (response) {
                toast.success(response, {
                    position: "top-right",
                    autoClose: 2000
                })
            }
        } catch (error: any) {
            toast.error(error.message, {
                position: "top-right",
                autoClose: 2000
            })
        }finally{
            setIsLoading(false)
            onClose()
        }
    }
    return (
        <Modal isOpen={isOpen} placement="top-center" onClose={onClose} size='lg' scrollBehavior='inside'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Approve Leave</ModalHeader>
                        <ModalBody>
                            <div className='w-full p-2 flex flex-col gap-3'>
                                <div className='flex gap-2 items-center'>
                                    <label className='min-w-[100px] flex justify-end p-1'>Name</label>
                                    <label className='flex justify-start p-1'>{getFullName(leaveData.student.first_name, leaveData.student.middle_name, leaveData.student.last_name)}</label>
                                </div>
                                <div className='flex gap-2 items-center'>
                                    <label className='min-w-[100px] flex justify-end p-1'>Leave Date</label>
                                    <label className='flex justify-start p-1'>{leaveData.leave_date}</label>
                                </div>
                                <div className='flex gap-2 items-center'>
                                    <label className='min-w-[100px] flex justify-end p-1'>Status</label>
                                    <label className='flex justify-start p-1'>{leaveData.status}</label>
                                </div>
                                <div className='flex gap-2 items-center'>
                                    <label className='min-w-[100px] flex justify-end p-1'>Description</label>
                                    <label className='flex justify-start p-1'>{leaveData.leave_reason}</label>
                                </div>
                                <Select
                                    className="max-w-xs"
                                    label="Select Leave Status"
                                    variant='bordered'
                                    name='leave_status'
                                    onChange={(e) => setSelectedStatus(e.target.value)}>
                                    <SelectItem key='Approved'>Approved</SelectItem>
                                    <SelectItem key='Rejected'>Rejected</SelectItem>
                                </Select>

                                <div className='flex w-full justify-end gap-3 p-2'>
                                    <Button onPress={handleCancel} variant='light' type='reset'>
                                        Cancel
                                    </Button>
                                    <Button onPress={handleSubmit} color="primary" type='submit'>
                                        Submit
                                    </Button>
                                </div>
                            </div>

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

export default ViewLeaveModal