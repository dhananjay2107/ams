import React from 'react'
import StudentsTable from '@/components/Students/StudentsTable'
import { getStudents } from '@/services/api/users'
import Card from '@/components/Cards/Card'
import { PiStudentBold  } from "react-icons/pi";

const StudentsPage = async () => {
    const students = await getStudents()
    return (
        <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
            <div className='flex justify-between gap-3 items-center p-2'>
                <h2 className='font-bold text-3xl'>Students</h2>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 '>
                <Card title="Total Students" value={students.length} icon={<PiStudentBold  className='h-8 w-8' />} />
            </div>
            <StudentsTable data={students} />
        </div>
    )
}

export default StudentsPage