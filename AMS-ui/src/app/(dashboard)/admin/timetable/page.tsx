import GenerateScheduleModal from '@/components/Timetable/GenerateScheduleModal'
import TimetableTabs from '@/components/Timetable/TimetableTabs'
import React from 'react'

const Timetable = () => {
  return (
    <div className='flex flex-col gap-3 bg-white rounded-lg p-2'>
      <div className='flex justify-between gap-3 items-center p-2'>
        <h2 className='font-bold text-3xl'>Timetable Dashboard</h2>
      </div>
      <div className='flex justify-end'>
        <GenerateScheduleModal />
      </div>
      <TimetableTabs />
    </div>
  )
}

export default Timetable