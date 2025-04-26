'use client'
import { Button, Card, CardBody, Tab, Tabs, useDisclosure } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import AssignCourseModal from './AssignCourseModal'
import { AssignCourse, Course } from '@/interfaces/Interfaces'
import { fetchCourseAssigned } from '@/services/api/course'
import Table from '../Table/Table'
import { getFullName } from '@/utilities/utils'

interface CourseTabsProps {
    data: Course
}
const CourseTabs: React.FC<CourseTabsProps> = ({ data }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [courseData, setCourseData] = useState<Course>(data)
    const [courseAssignedData, setCourseAssignedData] = useState<AssignCourse[]>([])

    useEffect(() => {
        const fetchData = async () => {
            if (data && data._id) {
                const courseAssigned = await fetchCourseAssigned(data._id)
                if (courseAssigned) {
                    setCourseAssignedData(courseAssigned)
                }
            }
        }
        setCourseData(data)
        fetchData()
    }, [data])

    const columns = [
        { key: "faculty", label: "Faculty Name" },
        { key: "date", label: "Date" },
    ]

    const renderRow = (row: any) => {
        return (
            <tr
                key={row._id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
            >
                <td className="p-4">{getFullName(row.faculty.first_name, row.faculty.middle_name, row.faculty.last_name)}</td>
                <td className="">{new Date(row.assigned_date).toISOString().split('T')[0]}</td>
            </tr>
        )
    }

    return (
        <div className="flex w-full flex-col">
            <Tabs aria-label="Options" variant='underlined' color='primary'>
                <Tab key='info' title='Info'>
                    <Card>
                        <CardBody>
                            <div>
                                <p><strong>Course Code:</strong> {data.course_code}</p>
                                <p><strong>Course Name:</strong> {data.course_name}</p>
                                <p><strong>Semester:</strong> {data.semester}</p>
                                <p><strong>Program:</strong> {data.program_id}</p>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key='assign' title='Assigned'>
                    <div>
                        <Button onPress={onOpen} className='border bg-primary hover:bg-secondary rounded-lg text-white duration-300'>Assign</Button>
                        <AssignCourseModal isOpen={isOpen} onClose={onClose} data={courseData} />
                        <Table data={courseAssignedData} renderRow={renderRow} columns={columns} />
                    </div>
                </Tab>
                <Tab key='history' title='History'>
                    <Card>
                        <CardBody>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    )
}

export default CourseTabs