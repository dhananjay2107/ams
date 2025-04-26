'use client'

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar } from '@fullcalendar/core';

interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

const FullCalendarSchedule = ({events}:{events:any[]}) => {
  const [loading, setLoading] = useState(true);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,timeGridDay",
      }} 
      events={events}
      height="auto"
      eventDisplay="block"
      eventTextColor="white"
      allDaySlot={false}
      slotMinTime="08:00:00"
      slotMaxTime="18:00:00"
    />
  )
}

export default FullCalendarSchedule