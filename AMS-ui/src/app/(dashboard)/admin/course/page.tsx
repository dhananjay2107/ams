import React from 'react'
import CourseTable from '@/components/Course/CourseTable'
import Card from '@/components/Cards/Card'
import { FaBook } from "react-icons/fa";
import { getCourses } from '@/services/api/course';
import { ITEM_PER_PAGE } from '@/lib/settings';

const CoursesPage = async () => {

  // const {page, ...queryParams} = searchParams
  // const p = page ? parseInt(page) : 1
  // const {data, limit, page_no, total} = await getCourses(p, ITEM_PER_PAGE)
  const data = await getCourses()
  return (
    <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
      <div className='flex gap-3 items-center p-2'>
        <h2 className='font-bold text-3xl'>Courses</h2>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        <Card icon={<FaBook className='h-6 w-6' />} title="Total Courses" value={data.length} />
      </div>
      <CourseTable data={data} />
    </div>
  )
}

export default CoursesPage