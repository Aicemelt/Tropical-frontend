import React from 'react';
import styles from '../../styles/components/CalendarDay.module.scss';import { useModalStore } from '../../store/useModalStore.js';

const CalendarDay = ({key, day, date, hasSchedule, hasDiary, isCurrentMonth}) => {
    const { openModal } = useModalStore();
    const today = date.getDate();

    // 날짜 클릭 핸들러
    const handleDayClick = () => {
        if (!isCurrentMonth) return; // 현재 월이 아니면 무시

        // 클릭한 날짜 문자열 생성
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // month는 0부터 시작하므로 +1
        const selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 일기가 있으면 일기 모달, 없으면 일정 모달 열기 (기본값)
        if (hasDiary) {
            openModal('diary', { selectedDate });
        } else {
            openModal('schedule', { selectedDate });
        }
    };

    return (
        <button
            key={key}
            className={`${styles.day} ${ day === today ? styles.today : ''} ${isCurrentMonth ? styles.currentMonth : ''}`}
            onClick={handleDayClick}
            disabled={!isCurrentMonth}
        >
            {day}
            <span className={`${styles.dataArea}`}>
                { hasSchedule && <span className={`${styles.data} ${styles.schedule}`}></span>  }
                { hasDiary && <span className={`${styles.data} ${styles.diary}`}></span> }
            </span>
        </button>
    );
};

export default CalendarDay;