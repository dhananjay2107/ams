import LeaveTabs from '@/components/Leave/LeaveTabs'
import getUser from '@/hooks/getUser'
import { getLeavesForFaculty } from '@/services/api/leave'
import React from 'react'

const LeavePage = async () => {

    const user = await getUser()
    const leaveData = await getLeavesForFaculty(user?._id || "")

    return (
        <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
            <div className='flex justify-between gap-3 items-center p-2'>
                <h2 className='font-bold text-3xl'>Leave</h2>
            </div>
            <LeaveTabs data={leaveData} />
        </div>
    )
}

export default LeavePage