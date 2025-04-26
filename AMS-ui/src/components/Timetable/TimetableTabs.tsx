'use client'
import { Tab, Tabs } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import Table from '../Table/Table'
import { fetchPeriodTiming, fetchPermanentTimetable, fetchTemporaryTimetables } from '@/services/api/timetable'
import Link from 'next/link'
import { MdDeleteOutline, MdOutlineEdit, MdOutlineRemoveRedEye } from 'react-icons/md'

const permanentTimetableColumns = [
    { key: "name", label: "Name" },
    { key: "batch", label: "Batch" },
    { key: "actions", label: "Actions" },
]
const temporaryTimetableColumns = [
    { key: "name", label: "Name" },
    { key: "batch", label: "Batch" },
    { key: "date", label: "Date" },
    { key: "timing-name", label: "Timing Name" },
    { key: "actions", label: "Actions" },
]
const PeriodTimingColumns = [
    { key: "name", label: "Name" },
    { key: "default", label: "Default" },
    { key: "actions", label: "Actions" },
]

const TimetableTabs = () => {

    const [permTimetableData, setPermTimetableData] = useState<any[]>([])
    const [tempTimetableData, setTempTimetableData] = useState<any[]>([])
    const [periodTimingData, setPeriodTimingData] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const permanenetTimetableData = await fetchPermanentTimetable()
            if (permanenetTimetableData) {
                setPermTimetableData(permanenetTimetableData)
            }
            const temporaryTimetableData = await fetchTemporaryTimetables()
            if (temporaryTimetableData) {
                setTempTimetableData(temporaryTimetableData)
            }
            const periodTimingData = await fetchPeriodTiming()
            if (periodTimingData) {
                setPeriodTimingData(periodTimingData)
            }
        }
        fetchData()
    }, [])
    const renderPermanentTimetableRow = (row: any) => {
        return (
            <tr
                key={row._id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
            >
                <td className="p-4">{row.name}</td>
                <td>{row.batch_id}</td>
                <td>
                    <div className="flex items-center gap-2">
                        <Link href={`/list/students/${row._id}`}>
                            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-skyBlue">
                                <MdOutlineRemoveRedEye />
                            </button>
                        </Link>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-teal">
                            <MdOutlineEdit />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-skyBlue">
                            <MdDeleteOutline />
                        </button>
                    </div>
                </td>
            </tr>
        )
    }
    const renderTemporaryTimetableRow = (row: any) => {
        return (
            <tr
                key={row._id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
            >
                <td className="px-4 py-2 font-medium">{row.name}</td>
                <td className="px-4 py-2 font-medium">{row.batch_id}</td>
                <td className="px-4 py-2 font-medium">{row.date}</td>
                <td className="px-4 py-2 font-medium">{row.timing_structure_id}</td>
                <td>
                    <div className="flex items-center gap-2">
                        <Link href="#">
                            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-skyBlue">
                                <MdOutlineRemoveRedEye />
                            </button>
                        </Link>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-teal">
                            <MdOutlineEdit />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-skyBlue">
                            <MdDeleteOutline />
                        </button>
                    </div>
                </td>
            </tr>
        )
    }
    const renderPeriodTimingRow = (row: any) => {
        return (
            <tr
                key={row._id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-primary-100 duration-300"
            >
                <td className="p-4">{row.name}</td>
                <td>{row.is_default}</td>
                <td>
                    <div className="flex items-center gap-2">
                        <Link href="#">
                            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-skyBlue">
                                <MdOutlineRemoveRedEye />
                            </button>
                        </Link>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-teal">
                            <MdOutlineEdit />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-skyBlue">
                            <MdDeleteOutline />
                        </button>
                    </div>
                </td>
            </tr>
        )
    }
    return (
        <div className="flex w-full flex-col">
            <Tabs aria-label="Options" variant='underlined' color='primary'>
                <Tab key='permanent' title='Permanent Timetables'>
                    <div className='flex justify-end'>
                        <Link className='p-2 hover:bg-secondary text-white bg-primary rounded-lg px-3 duration-300' href="/admin/timetable/permanent-timetable/create">Add Timetable</Link>
                    </div>
                    <Table data={permTimetableData} renderRow={renderPermanentTimetableRow} columns={permanentTimetableColumns} />
                </Tab>
                <Tab key='temporary' title='Temporary Timetables'>
                    <Table data={tempTimetableData} renderRow={renderTemporaryTimetableRow} columns={temporaryTimetableColumns} />
                </Tab>
                <Tab key='period-timing' title='Period Timings'>
                    <Table data={periodTimingData} renderRow={renderPeriodTimingRow} columns={PeriodTimingColumns} />
                </Tab>
            </Tabs>
        </div>
    )
}

export default TimetableTabs