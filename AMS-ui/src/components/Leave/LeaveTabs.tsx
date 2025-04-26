'use client'
import { Button, Tab, Tabs } from '@heroui/react'
import React, { useState } from 'react'
import Table from '../Table/Table'
import { getFullName } from '@/utilities/utils'
import { MdOutlineRemoveRedEye } from 'react-icons/md'
import ViewLeaveModal from './ViewLeaveModal'

interface LeaveTabsProps {
    data: any
}

const columnsSubmitted = [
    { key: "student", label: "Student" },
    { key: "leave_date", label: "Leave Date" },
    { key: "submit_date", label: "Submitted Date" },
    { key: "status", label: "Status" },
    { key: "action", label: "Actions" }
]
const columnsPending = [
    { key: "student1", label: "Student" },
    { key: "date1", label: "Date" },
    { key: "remarks1", label: "Remarks" },
]
const columnsAll = [
    { key: "student2", label: "Student" },
    { key: "leave_date2", label: "Leave Date" },
    { key: "submit_date2", label: "Submitted Date" },
    { key: "status2", label: "Status" },
]
const LeaveTabs: React.FC<LeaveTabsProps> = ({ data }) => {

    const [selectedLeave, setSelectedLeave] = useState(null)
    const [viewLeaveModalOpen, setViewLeaveModalOpen] = useState(false)

    const handleViewLeave = (row: any) => {
        setSelectedLeave(row)
        setViewLeaveModalOpen(true)
    }
    const renderRowSubmitted = (row: any) => {
        return (
            <tr
                key={row._id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
            >
                <td className="px-4 py-2 font-medium">{getFullName(row.student.first_name, row.student.middle_name, row.student.last_name)}</td>
                <td className="px-4 py-2 font-medium">{row.leave_date}</td>
                <td className="px-4 py-2 font-medium">{new Date(row.created_at).toISOString().split('T')[0]}</td>
                <td className="px-4 py-2 font-medium">{row.status}</td>
                <td>
                    <div>
                        <Button onPress={(e) => handleViewLeave(row)} className='border bg-primary hover:bg-secondary rounded-lg text-white duration-300'><MdOutlineRemoveRedEye className='w-5 h-5' /></Button>
                    </div>
                </td>
            </tr>
        )
    }
    const renderRowPending = (row: any) => {
        return (
            <tr
                key={row._id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
            >
                <td className="px-4 py-2 font-medium">{getFullName(row.student.first_name, row.student.middle_name, row.student.last_name)}</td>
                <td className="px-4 py-2 font-medium">{row.date}</td>
                <td className="px-4 py-2 font-medium">Pending Leave Form Submission</td>
            </tr>
        )
    }
    const renderRowAll = (row: any) => {
        return (
            <tr
                key={row._id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
            >
                <td className="px-4 py-2 font-medium">{getFullName(row.student.first_name, row.student.middle_name, row.student.last_name)}</td>
                <td className="px-4 py-2 font-medium">{row.leave_date}</td>
                <td className="px-4 py-2 font-medium">{new Date(row.created_at).toISOString().split('T')[0]}</td>
                <td className="px-4 py-2 font-medium">{row.status}</td>
            </tr>
        )
    }
    return (
        <div className="flex w-full flex-col">
            <Tabs aria-label="Options" variant='underlined' color='primary'>
                <Tab key='submitted' title='Leave Requests'>
                    <Table renderRow={renderRowSubmitted} data={data.submitted} columns={columnsSubmitted} />
                </Tab>
                <Tab key='pending' title='Pending Submissions'>
                    <Table renderRow={renderRowPending} data={data.pending_required} columns={columnsPending} />
                </Tab>
                <Tab key='allleave' title='All Leaves'>
                    <Table renderRow={renderRowAll} data={data.all_leave} columns={columnsAll} />
                </Tab>
            </Tabs>

            {selectedLeave && (
                <ViewLeaveModal
                    isOpen={viewLeaveModalOpen}
                    onClose={() => setViewLeaveModalOpen(false)}
                    leaveData={selectedLeave}
                />)}
        </div>
    )
}

export default LeaveTabs