import React from 'react';
import CalendarHeader from "./CalendarHeader.jsx";
import styles from "../../styles/components/Calendar.module.scss";
import CalendarGrid from "./CalendarGrid.jsx";


const Calendar = () => {
    return (
        <div className={`${styles.calendarArea}`}>
            <CalendarHeader />
            <CalendarGrid />
        </div>
    );
};

export default Calendar;