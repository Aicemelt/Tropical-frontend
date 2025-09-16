import React from 'react';
import styles from '../../styles/components/ScheduleItem.module.scss'
import {useModalStore} from "../../store/useModalStore.js";

const ScheduleItem = () => {

    const { openModal } = useModalStore();

    return (
        <div className={`${styles.item}`}>
            <span className={`${styles.time}`}>08:00 ~ 10:30</span>
            <p onClick={() => openModal('schedule')}>일정 제목</p>
        </div>
    );
};

export default ScheduleItem;