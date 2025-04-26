import Pagination from '@/components/pagination/Pagination'
import TableSearch from '@/components/Search/TableSearch'
import Table from '@/components/Table/Table'
import getUser from '@/hooks/getUser'
import { User } from '@/interfaces/Interfaces'
import { ITEM_PER_PAGE } from '@/lib/settings'
import { getUsers } from '@/services/api/users'
import { getFullName } from '@/utilities/utils'
import React from 'react'
import { BsSortDown } from 'react-icons/bs'
import { FiFilter } from 'react-icons/fi'
import { MdDeleteOutline, MdOutlineAdd, MdOutlineEdit } from 'react-icons/md'

const UsersList = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {

    const user = await getUser()
    const role = user?.role
    const { page, ...queryParams } = searchParams
    const p = page ? parseInt(page) : 1
    const { data, limit, page_no, total } = await getUsers(p, ITEM_PER_PAGE)

    const columns = [
        {
            label: "Name",
            key: "name",
        },
        {
            label: "Email",
            key: "email",
            className: "hidden md:table-cell",
        },
        {
            label: "Role",
            key: "role",
            className: "hidden sm:table-cell",
        },
        {
            label: "Status",
            key: "status",
            className: "hidden md:table-cell",
        },
        ...(role === "admin" ?
            [{
                label: "Actions",
                key: "action",
            }]
            : []),
    ];

    const renderRow = (item: User) => (
        <tr
            key={item._id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-mintGreen duration-300"
        >
            <td className="flex items-center gap-4 p-4">{getFullName(item.first_name, item.middle_name || '', item.last_name || '')}</td>
            <td className="hidden md:table-cell">{item.email}</td>
            <td className="hidden sm:table-cell">{item.role}</td>
            <td className="hidden md:table-cell">{item.status}</td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-teal">
                                <MdOutlineEdit />
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-skyBlue">
                                <MdDeleteOutline />
                            </button>
                        </>
                        // <FormModal table="student" type="delete" id={item.id} />
                    )}
                </div>
            </td>
        </tr>
    )

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Users</h1>
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
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={page_no} count={total}/>
        </div>
    )
}

export default UsersList