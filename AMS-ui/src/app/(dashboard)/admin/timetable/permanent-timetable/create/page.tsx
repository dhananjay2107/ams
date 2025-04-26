import CreatePermanentTimetable from '@/components/Timetable/CreatePermanentTimetable'
import React from 'react'

const Create = () => {
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex justify-between gap-3 items-center p-2'>
                <h2 className='font-bold text-xl'>Create Permanent Timetable</h2>
            </div>
            <CreatePermanentTimetable />
        </div>
    )
}

export default Create