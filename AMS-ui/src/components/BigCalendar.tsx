"use client";
import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const BigCalendar = ({ data }: { data: { title: string, start: Date, end: Date }[] }) => {
    const [view, setView] = useState<View>(Views.WEEK);
    const localizer = momentLocalizer(moment)

    const handleOnChangeView = (selectedView: View) => {
        setView(selectedView);
    }
    return (
        <Calendar
            localizer={localizer}
            events={data}
            startAccessor="start"
            endAccessor="end"
            views={["day","week"]}
            view={view}
            style={{ height: "98%" }}
            onView={handleOnChangeView}
            min={new Date(2025, 1, 0, 9, 0, 0)}
            max={new Date(2025, 1, 0, 18, 0, 0)}
        />
    )
}

export default BigCalendar