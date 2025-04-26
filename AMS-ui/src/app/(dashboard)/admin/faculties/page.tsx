import React from 'react'
import FacultiesTable from '@/components/Faculty/FacultiesTable'
import { getFaculties } from '@/services/api/users'
import Card from '@/components/Cards/Card'
import { GiTeacher } from "react-icons/gi";

const FacultiesPage = async () => {

  const faculties = await getFaculties()

  return (
    <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
      <div className='flex justify-between gap-3 items-center p-2'>
        <h2 className='font-bold text-3xl'>Faculties</h2>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 '>
        <Card title="Total Faculties" value={faculties.length} icon={<GiTeacher className='h-6 w-6'/>}/>
      </div>
      <FacultiesTable data={faculties} />
    </div>
  )
}

export default FacultiesPage