import FormModal from '@/components/FormModal'
import Pagination from '@/components/pagination/Pagination'
import TableSearch from '@/components/Search/TableSearch'
import Table from '@/components/Table/Table'
import getUser from '@/hooks/getUser'
import { Program } from '@/interfaces/Interfaces'
import { ITEM_PER_PAGE } from '@/lib/settings'
import { getPrograms } from '@/services/api/program'
import React from 'react'
import { BsSortDown } from 'react-icons/bs'
import { FiFilter } from 'react-icons/fi'
import { MdOutlineAdd } from 'react-icons/md'

const ProgramsList = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
    const user = await getUser()
    const role = user?.role
    const { page, ...queryParams } = searchParams
    const p = page ? parseInt(page) : 1
    const { data, limit, page_no, total } = await getPrograms(p, ITEM_PER_PAGE)
    const columns = [
        {
            label: "Name",
            key: "name",
        },
        // {
        //     label: "No of semesters",
        //     key: "semesters",
        //     className: "hidden sm:table-cell",
        // },
        ...(role === "admin" ?
            [{
                label: "Actions",
                key: "action",
            }]
            : []),
    ]
    const renderRow = (item: Program) => (
        <tr
            key={item._id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
        >
            <td className="p-4">{item.program_name}</td>
            {/* <td className="hidden md:table-cell">{item.no_of_semesters}</td> */}
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormModal table="program" type="update" id={item._id} />
                            <FormModal table="program" type="delete" id={item._id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    )
    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Programs</h1>
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
                            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow">
                                <MdOutlineAdd />
                            </button>
                            // <FormModal table="student" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination count={total} page={page_no}/>
        </div>
    )
}

export default ProgramsList