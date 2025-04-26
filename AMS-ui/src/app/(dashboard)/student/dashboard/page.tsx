import AttendanceBarChart from '@/components/AttendanceBarChart';
import BigCalendar from '@/components/BigCalendar'
import FullCalendarSchedule from '@/components/FullCalendarSchedule';
import { getBatch } from '@/services/api/batch';
import { fetchTimetableSchedule } from '@/services/api/timetableschedule';
import { getStudent } from '@/services/api/users';
import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'


const StudentDashboard = async () => {

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) {
    return redirect('/login');
  }
  const decoded_token: any = jwtDecode(token)

  try {
    const student = await getStudent(decoded_token._id)
    const scheduleData = await fetchTimetableSchedule(student.batch_id);

    let formattedEvents = []
    if (scheduleData) {
      formattedEvents = scheduleData.map((event: any, index: number) => {
        if (!event || !event.date || !event.start_time || !event.end_time) {
          console.error(`Event missing required fields at index ${index}:`, event);
          return null;
        }
        const id = event._id

        const title = event.course && event.faculty
          ? `${event.course} (${event.faculty})`
          : event.course || "Break";

        const start = event.date && event.start_time
          ? new Date(`${event.date}T${event.start_time}`)
          : null;

        const end = event.date && event.end_time
          ? new Date(`${event.date}T${event.end_time}`)
          : null;

        const color = event.course ? "#8884d8" : "#e9b968"

        if (!start || !end) {
          console.error(`Invalid start or end time for event at index ${index}:`, event);
          return null;
        }

        return {
          id,
          title,
          start,
          end,
          color,
        };
      }).filter((event: any) => event !== null);
    }



    return (
      <div className="flex gap-4 flex-col xl:flex-row">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          <div className="h-full bg-white rounded-md pt-2 p-4 flex flex-col gap-2 ">
            <h1 className="text-xl font-semibold">Schedule (4A)</h1>
            <FullCalendarSchedule events={formattedEvents} />
            {/* <BigCalendar data={formattedEvents} /> */}
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-8">
          <div className='bg-white rounded-lg p-4 flex flex-col gap-2 h-[300px]'>
            <div className=''>
              <h1 className='text-xl font-semibold'>Attendance<span className='text-sm text-gray-600'>(monthly)</span></h1>
            </div>
            <AttendanceBarChart />
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error("Error fetching schedule:", error);
    return <p className="text-red-500">{error.message}</p>;
  }
}

export default StudentDashboard