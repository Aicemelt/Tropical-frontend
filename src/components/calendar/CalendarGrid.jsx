import React from 'react';
import styles from '../../styles/components/CalendarGrid.module.scss';
import CalendarDay from "./CalendarDay.jsx";

const CalendarGrid = () => {
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    // 특정 월의 일수 구하기
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    // 배열로 만들기
    const days = Array.from({ length: lastDayOfMonth }, (_, i) => i + 1);
    console.log(days);

    // 더미 데이터
    const hasSchedule = {
        5: true,
        15: true,
        20: true,
    };

    const hasDiary = {
        3: true,
        15: true,
        25: true,
    };

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
                    /*<button key={index} className={`${styles.day}`}>
                        {day}
                    </button>*/
                    <CalendarDay
                        key={index}
                        day={day}
                        date={today}
                        hasSchedule={hasSchedule[day]}
                        hasDiary={hasDiary[day]}
                    />
                )}
            </div>
        </div>
    );
};

export default CalendarGrid;