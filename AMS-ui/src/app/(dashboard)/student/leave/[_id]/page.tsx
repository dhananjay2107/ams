import { fetchLeaveById } from '@/services/api/leave'
import React from 'react'

const LeaveDetailsPage = async ({ params }: { params: Promise<{ _id: string }> }) => {

    const { _id } = await params
    const leaveData = await fetchLeaveById(_id)


    return (
        <div>
            <div className='flex justify-between gap-3 items-center p-2'>
                <h2 className='font-bold text-3xl'>Leave Details</h2>
            </div>
            <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
                <div className='flex flex-col gap-2'>
                    <p><strong>Leave Date:</strong> {leaveData.leave_date}</p>
                    <p><strong>Submitted Date:</strong> {new Date(leaveData.created_at).toISOString().split('T')[0]}</p>
                    <p><strong>Submitted to:</strong> {leaveData.faculty_name}</p>
                    <p><strong>Status:</strong> {leaveData.status}</p>
                    <p><strong>Reason:</strong> {leaveData.leave_reason}</p>
                </div>
            </div>
        </div>
    )
}

export default LeaveDetailsPage