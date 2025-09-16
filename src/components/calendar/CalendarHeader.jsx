import React from 'react';
import styles from '../../styles/components/CalendarHeader.module.scss'

const CalendarHeader = () => {

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className={`${styles.calendarHeader}`}>
            <h2 className={`${styles.month}`}>
                September 2025
            </h2>
            <div className={`${styles.btnArea}`}>
                <button className={`${styles.prevBtn}`}></button>
                <button className={`${styles.nextBtn}`}></button>
            </div>
        </div>
    );
};

export default CalendarHeader;