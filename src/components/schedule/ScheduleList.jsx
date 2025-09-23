import React from 'react';
import ScheduleItem from "./ScheduleItem.jsx";
import styles from '../../styles/components/ScheduleList.module.scss';

const ScheduleList = ({ schedules, isExpanded }) => {
    // 표시할 일정 개수 결정
    const displayedSchedules = isExpanded ? schedules : schedules.slice(0, 1);

    return (
        <ul className={styles.scheduleList}>
           {displayedSchedules.map((schedule) => (
               <li key={schedule.id} className={styles.scheduleListItem}>
                   <ScheduleItem
                       schedule={schedule}
                       displayMode="sidebar"
                   />
               </li>
           ))}
        </ul>
    );
};

export default ScheduleList;