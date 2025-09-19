import React, { useEffect, useState } from 'react';
import styles from '../../styles/components/CalendarGrid.module.scss';
import CalendarDay from "./CalendarDay.jsx";
import { useSchedule } from '../../hooks/schedule/useSchedule.js';
import { useDiary } from '../../hooks/diary/useDiary.js';

const CalendarGrid = () => {
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const { schedules, fetchSchedulesByMonth } = useSchedule();
    const { getDiariesByMonth } = useDiary();
    const [diaries, setDiaries] = useState([]);

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // 일정과 일기 데이터 로드
    useEffect(() => {
        const loadCalendarData = async () => {
            try {
                // 월별 일정 조회 (month는 0부터 시작하므로 +1)
                await fetchSchedulesByMonth(year, month + 1);

                // 월별 일기 조회
                const monthDiaries = await getDiariesByMonth(year, month + 1);
                setDiaries(monthDiaries);
            } catch (error) {
                console.error('캘린더 데이터 로드 실패:', error);
            }
        };

        loadCalendarData();
    }, [year, month, fetchSchedulesByMonth, getDiariesByMonth]);

    const days = [];

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

    // 실제 데이터로 일정과 일기 체크 함수
    const checkScheduleForDate = (day) => {
        if (!day) return false;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return schedules.some(schedule =>
            schedule.scheduleDate === dateStr ||
            schedule.startDate === dateStr ||
            schedule.date === dateStr
        );
    };

    const checkDiaryForDate = (day) => {
        if (!day) return false;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return diaries.some(diary =>
            diary.date === dateStr ||
            diary.diaryDate === dateStr ||
            (diary.createdAt && diary.createdAt.startsWith(dateStr))
        );
    };

    console.log('📅 캘린더 데이터:', { schedules, diaries, days });

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
                    <CalendarDay
                        key={index}
                        day={day.day}
                        date={today}
                        hasSchedule={day.isCurrentMonth && checkScheduleForDate(day.day)}
                        hasDiary={day.isCurrentMonth && checkDiaryForDate(day.day)}
                        isCurrentMonth={day.isCurrentMonth}
                    />
                )}
            </div>
        </div>
    );
};

export default CalendarGrid;