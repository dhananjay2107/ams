import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'

const FacultyDashboard = async () => {

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) {
    return redirect('/login');
  }

  return (
    <div className="flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          {/* <BigCalendarContainer type="faculty_id" id={decoded_token._id} /> */}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        {/* <EventCalendar />
            <Announcements /> */}
      </div>
    </div>
  )
}

export default FacultyDashboard