import AddPermanenetTimetableButton from '@/components/Timetable/AddPermanenetTimetableButton'
import PermanentTimetableList from '@/components/Timetable/PermanentTimetableList'
import Link from 'next/link'
import React from 'react'

const PermanentTimetablePage = () => {
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex justify-between gap-3 items-center p-2'>
        <h2 className='font-bold text-3xl'>Permanent Timetables</h2>
      </div>
      <div className='flex justify-end'>
        {/* <AddPermanenetTimetableButton/> */}
        <Link className='p-2 hover:bg-secondary text-white bg-primary rounded-lg px-3 duration-300' href="/admin/timetable/permanent-timetable/create">Add Timetable</Link>
      </div>
      <PermanentTimetableList />
    </div>
  )
}

export default PermanentTimetablePage