import ActionButton from '@/components/Buttons/ActionButton'
import FormModal from '@/components/FormModal'
import Pagination from '@/components/pagination/Pagination'
import TableSearch from '@/components/Search/TableSearch'
import Table from '@/components/Table/Table'
import getUser from '@/hooks/getUser'
import { Student } from '@/interfaces/Interfaces'
import { ITEM_PER_PAGE } from '@/lib/settings'
import { getStudents } from '@/services/api/users'
import { getFullName } from '@/utilities/utils'
import Link from 'next/link'
import React from 'react'
import { BsSortDown } from 'react-icons/bs'
import { FiFilter } from 'react-icons/fi'
import { MdOutlineAdd } from 'react-icons/md'
import { RxAvatar } from 'react-icons/rx'

const StudentsList = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {

    // const user = await getUser()
    // const role = user?.role
    // const { page, ...queryParams } = searchParams
    // const p = page ? parseInt(page) : 1
    // const { data, limit, page_no, total } = await getStudents(p, ITEM_PER_PAGE)

    // const columns = [
    //     {
    //         label: "Info",
    //         key: "info",
    //     },
    //     {
    //         label: "Program",
    //         key: "program",
    //         className: "hidden sm:table-cell",
    //     },
    //     {
    //         label: "Batch",
    //         key: "batch",
    //         className: "hidden md:table-cell",
    //     },
    //     {
    //         label: "Phone",
    //         key: "phone",
    //         className: "hidden md:table-cell",
    //     },
    //     {
    //         label: "Admission Year",
    //         key: "adm_year",
    //         className: "hidden lg:table-cell",
    //     },
    //     ...(role === "admin" || role === "faculty" ?
    //         [{
    //             label: "Actions",
    //             key: "action",
    //         }]
    //         : []),
    // ];

    // const renderRow = (item: Student) => (
    //     <tr
    //         key={item._id}
    //         className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-mintGreen duration-300"
    //     >
    //         <td className="flex items-center gap-4 p-4">
    //             <RxAvatar className='h-8 w-8' />
    //             <div className="flex flex-col">
    //                 <h3 className="font-semibold">{getFullName(item.first_name, item.middle_name || '', item.last_name || '')}</h3>
    //                 <p className="text-xs text-gray-500">{item.email}</p>
    //             </div>
    //         </td>
    //         <td className="hidden sm:table-cell">{item.program?.program_name}</td>
    //         <td className="hidden md:table-cell">{item.batch?.batch_name}</td>
    //         <td className="hidden md:table-cell">{item.phone_no}</td>
    //         <td className="hidden lg:table-cell">{item.adm_year}</td>
    //         <td>
    //             <div className="flex items-center gap-2">
    //                 <Link href={`/list/students/${item._id}`}>
    //                     <ActionButton table='student' type='view' />
    //                 </Link>
    //                 {role === "admin" && (
    //                     <>
    //                         <FormModal table="student" type="update" id={item._id} />
    //                         <FormModal table="student" type="delete" id={item._id} />
    //                     </>
    //                 )}
    //             </div>
    //         </td>
    //     </tr>
    // )

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Students</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-palePeach">
                            <FiFilter />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-palePeach">
                            <BsSortDown />
                        </button>
                        {role === "admin" && (
                            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-palePeach">
                                <MdOutlineAdd />
                            </button>
                            // <FormModal table="student" type="create" />
                        )}
                    </div>
                </div>
            </div>
            {/* <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={page_no} count={total}/> */}
        </div>
    )
}

export default StudentsList