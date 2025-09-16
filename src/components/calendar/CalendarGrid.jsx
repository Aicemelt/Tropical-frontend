import React from 'react';
import styles from '../../styles/components/CalendarGrid.module.scss';
import CalendarDay from "./CalendarDay.jsx";

const CalendarGrid = () => {
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const days =[];

    const firstDayWeekday = new Date(year, month, 1).getDay();
    const lastDayOfCurrentMonth = new Date(year, month + 1, 0).getDate();

    // 필요한 총 칸 수 계산
    const totalCells = firstDayWeekday + lastDayOfCurrentMonth;

    // 필요한 줄 수 계산 (5줄 또는 6줄)
    const totalRows = totalCells <= 35 ? 5 : 6;
    const totalDays = totalRows * 7;

    // 이전 달 날짜 계산
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    // 다음 달 날짜 계산
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const firstDayOfNextMonth = new Date(nextYear, nextMonth + 1, 1).getDate();

    // 이전 달 날짜 추가
    for(let i = firstDayWeekday - 1; i >= 0; i--) {
        days.push({
            day: lastDayOfPrevMonth - i,
            isCurrentMonth: false,
            isPrevMonth: true
        })
    }

    // 현재 날짜 추가
    for (let i = 1; i <= lastDayOfCurrentMonth; i++) {
        days.push({
            day: i,
            isCurrentMonth: true
        });
    }

    // 다음 달 날짜 추가
    let nextMonthDay = firstDayOfNextMonth;
    while(days.length < totalDays) {
        days.push({
            day: nextMonthDay,
            isCurrentMonth: false,
            isNextMonth: true
        });
        nextMonthDay++;
    }

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

    console.log(days)

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
            <div className={`${styles.grid} ${totalRows ===  6 ? styles.sixGrid : styles.fiveGrid}`}>
                {days.map((day, index) =>
                    /*<button key={index} className={`${styles.day}`}>
                        {day}
                    </button>*/
                    <CalendarDay
                        key={index}
                        day={day.day}
                        date={today}
                        hasSchedule={day.isCurrentMonth && hasSchedule[day.day]}
                        hasDiary={day.isCurrentMonth && hasDiary[day.day]}
                        isCurrentMonth={day.isCurrentMonth}
                    />
                )}
            </div>
        </div>
    );
};

export default CalendarGrid;