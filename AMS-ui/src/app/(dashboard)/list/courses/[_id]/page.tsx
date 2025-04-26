import CourseTabs from '@/components/Course/CourseTabs'
import { getCourseById } from '@/services/api/course'
import React from 'react'

const CourseDetails = async ({ params }: { params: Promise<{ _id: string }> }) => {
    const { _id } = await params
    const courseData = await getCourseById(_id)

    return (
        <div className='flex flex-col gap-3 bg-white p-2 m-4 mt-0 rounded-lg'>
            <div className='flex justify-between gap-3 items-center p-2'>
                <h2 className='font-bold text-3xl'>Course Details</h2>
            </div>
            <CourseTabs data={courseData}/>
        </div>
    )
}

export default CourseDetails