import ApplyLeaveButton from '@/components/Leave/ApplyLeaveButton'
import Table from '@/components/Table/Table'
import getUser from '@/hooks/getUser'
import { fetchLeave } from '@/services/api/leave'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { MdOutlineRemoveRedEye } from 'react-icons/md'

const columns = [
    { key: "leave_date", label: "Leave Date" },
    { key: "submitted_date", label: "Submitted Date" },
    { key: "status", label: "Status" },
    { key: "action", label: "Actions" },
]
const LeavePage = async () => {
    const user: any = await getUser()
    const leaveData = await fetchLeave(user._id)

    const renderRow = (row: any) => {
        return (
            <>
                <tr
                    key={row._id}
                    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
                >
                    <td className="px-4 py-2 font-medium">{row.leave_date}</td>
                    <td className="px-4 py-2 font-medium">{new Date(row.created_at).toISOString().split('T')[0]}</td>
                    <td className="px-4 py-2 font-medium">{row.status}</td>
                    <td>
                        <div>
                            <Link href={`/student/leave/${row._id}`}>
                                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white">
                                    <MdOutlineRemoveRedEye className='w-5 h-5' />
                                </button>
                            </Link>
                        </div>
                    </td>
                </tr>
            </>
        );
    };


    return (
        <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
            <div className='flex justify-between gap-3 items-center p-2'>
                <h2 className='font-bold text-3xl'>Leave</h2>
            </div>
            <div className='flex justify-end'>
                <ApplyLeaveButton />
            </div>
            <Table columns={columns} data={leaveData} renderRow={renderRow} />
        </div>
    )
}

export default LeavePage