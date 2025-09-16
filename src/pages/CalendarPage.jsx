import React from 'react';
import Calendar from "../components/calendar/Calendar.jsx";
import CalendarButtons from "../components/calendar/CalendarButtons.jsx";
import ScheduleSection from "../components/schedule/ScheduleSection.jsx";
import DiarySection from "../components/diary/DiarySection.jsx";

const CalendarPage = () => {
    return (
        <>
            <Calendar />
            <CalendarButtons />
            <ScheduleSection />
            <DiarySection />
        </>
    );
};

export default CalendarPage;