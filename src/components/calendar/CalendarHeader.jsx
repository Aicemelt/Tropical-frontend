// src/components/calendar/CalendarHeader.jsx
import React from 'react';
import styles from '../../styles/components/CalendarHeader.module.scss';

const CalendarHeader = ({ title, onPrev, onNext, onToday }) => {
    return (
        <div className={styles.calendarHeader}>
            <div className={styles.left}>
                <h2 className={styles.month}>
                    {/* 드롭다운( Calendar / Todo / Bucket )은 별도 Select로 붙이세요 */}
                    {title || 'Calendar'}
                </h2>
            </div>
            <div className={styles.btnArea}>
                {/* 필요 시 Today 버튼도 노출 */}
                <button className={styles.prevBtn} aria-label="prev" onClick={onPrev}></button>
                <button className={styles.nextBtn} aria-label="next" onClick={onNext}></button>
            </div>
        </div>
    );
};

export default CalendarHeader;
