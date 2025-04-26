
import MarkAttendance from '@/components/Attendance/MarkAttendance'
import React from 'react'

const MarkAttendancePage = () => {
  return (
    <div className='flex flex-col gap-3 bg-white p-3'>
      <div className='flex gap-3 items-center'>
        <h2 className='font-bold text-2xl'>Mark Attendance</h2>
      </div>
      <MarkAttendance />
    </div>
  )
}

export default MarkAttendancePage