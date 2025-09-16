import React from 'react';
import styles from '../../styles/components/Buttons.module.scss';
import {useModalStore} from "../../store/useModalStore.js";

const CalendarButtons = () => {

    const { openModal } = useModalStore();

    return (
        <div className={`${styles.btnArea}`}>
            <button className={`${styles.addScheduleBtn}`} onClick={() => openModal('schedule')}>새로운 일정 추가하기</button>
            <button className={`${styles.addDiaryBtn}`} onClick={() => openModal('diary')}>일기 작성하기</button>
        </div>
    );
};

export default CalendarButtons;