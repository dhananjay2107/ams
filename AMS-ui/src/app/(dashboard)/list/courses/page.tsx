import ActionButton from '@/components/Buttons/ActionButton'
import FormModal from '@/components/FormModal'
import Pagination from '@/components/pagination/Pagination'
import TableSearch from '@/components/Search/TableSearch'
import Table from '@/components/Table/Table'
import getUser from '@/hooks/getUser'
import { Course } from '@/interfaces/Interfaces'
import { ITEM_PER_PAGE } from '@/lib/settings'
import { getCourses } from '@/services/api/course'
import { getFullName } from '@/utilities/utils'
import Link from 'next/link'
import React from 'react'
import { BsSortDown } from 'react-icons/bs'
import { FiFilter } from 'react-icons/fi'
import { MdOutlineAdd } from 'react-icons/md'



const CourseListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
    const user = await getUser()
    const role = user?.role
    const { page, ...queryParams } = searchParams
    const p = page ? parseInt(page) : 1
    const { data, limit, page_no, total } = await getCourses(p, ITEM_PER_PAGE)
    const columns = [
        {
            label: "Course Code",
            key: "course_n=code",
        },
        {
            label: "Course Name",
            key: "course_name",
            className: "hidden md:table-cell",
        },
        {
            label: "Program",
            key: "program",
            className: "hidden md:table-cell",
        },
        {
            label: "Semester",
            key: "rsemesterole",
            className: "hidden lg:table-cell",
        },
        {
            label: "Assigned to",
            key: "assigned",
            className: "hidden md:table-cell",
        },
        ...(role === "admin" ?
            [{
                label: "Actions",
                key: "action",
            }]
            : []),
    ];
    const renderRow = (item: Course) => (
        <tr
            key={item._id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
        >
            <td className="p-4">{item.course_code}</td>
            <td className="hidden md:table-cell">{item.course_name}</td>
            <td className="hidden md:table-cell">{item.program?.program_name || ""}</td>
            <td className="hidden lg:table-cell">{item.semester}</td>
            <td className="hidden md:table-cell">
                {item.assignedFaculty?.map((faculty) => getFullName(faculty.first_name, faculty.middle_name || '', faculty.last_name || '')).join(", ")}
            </td>
            <td>
                <div className="flex items-center gap-2">
                    <Link href={`/list/courses/${item._id}`}>
                        <ActionButton table='course' type='view' />
                    </Link>
                    {role === "admin" && (
                        <>
                            <FormModal table="course" type="update" id={item._id} />
                            <FormModal table="course" type="delete" id={item._id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    )

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block font-bold text-3xl">Courses</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow">
                            <FiFilter />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow">
                            <BsSortDown />
                        </button>
                        {role === "admin" && (
                            <>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow">
                                    <MdOutlineAdd />
                                </button>
                                {/* <FormModal table="student" type="create" /> */}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={page_no} count={total} />
        </div>
    )
}

export default CourseListPage