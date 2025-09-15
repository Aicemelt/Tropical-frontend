import React from 'react';
import styles from '../../styles/components/CalendarGrid.module.scss';

const CalendarGrid = () => {
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // 특정 월의 일수 구하기
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    // 배열로 만들기
    const days = Array.from({ length: lastDayOfMonth }, (_, i) => i + 1);
    console.log(days);

    return (
        <div className={`${styles.gridArea}`}>
            {/* 요일 헤더 */}
            <div className={`${styles.grid}`}>
                {weekdays.map((weekday, index) => (
                    <div key={index} className={`${styles.weekday}`}>
                        {weekday}
                    </div>
                ))}
            </div>
            <div className={`${styles.grid}`}>
                {days.map((day, index) =>
                    <button key={index} className={`${styles.day}`}>
                        {day}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CalendarGrid;