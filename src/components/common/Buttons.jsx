import React from 'react';
import styles from '../../styles/components/Buttons.module.scss';

const Buttons = () => {
    return (
        <div className={`${styles.btnArea}`}>
            <button className={`${styles.addScheduleBtn}`}>새로운 일정 추가하기</button>
            <button className={`${styles.addDiaryBtn}`}>일기 작성하기</button>
        </div>
    );
};

export default Buttons;