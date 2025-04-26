"use client"
import { useUser } from '@/hooks/useUser';
import { getStudentMonthlyAttendance } from '@/services/api/attendance';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const AttendanceBarChart = () => {

    const [data, setData] = useState([])
    const user = useUser()

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user?._id) return
            try {
                const result = await getStudentMonthlyAttendance(user?._id)
                if (!result)
                    return
                setData(result)
            }
            catch (error: any) {
                toast.error(error.message, {
                    autoClose: 2000,
                    position: "top-right"
                })
            }
        }
        fetchAttendance()
    }, [user?._id])

    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-10">
                No data to show 📉
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const record = payload[0].payload;
            return (
                <div className="bg-white p-2 shadow-md border rounded-md text-sm">
                    <p className="font-semibold">{record.month}</p>
                    <p>Present: {record.present_days} / {record.total_days}</p>
                    <p>Attendance: {record.percentage}%</p>
                </div>
            );
        }
        return null;
    };
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                    maxBarSize={100}
                    dataKey="percentage"
                    label={{ position: "top", formatter: (val: number) => `${val}%` }}
                    radius={[4, 4, 0, 0]}
                >
                    {data.map((entry: any, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.percentage < 75 ? '#f87171' : '#8884d8'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export default AttendanceBarChart