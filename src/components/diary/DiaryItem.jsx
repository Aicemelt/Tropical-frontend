import React from 'react';
import styles from '../../styles/components/DiaryItem.module.scss';
import {useModalStore} from "../../store/useModalStore.js";

const DiaryItem = () => {
    const { openModal } = useModalStore();

    return (
        <div className={`${styles.diary}`} >
            <div className={`${styles.infoArea}`}>
                {/*
                    감정 이모티콘 클래스
                    joy, sadness, anger, calm, anxiety
                 */}
                <span className={`${styles.emotion} ${styles.anger}`}></span>
                <span className={`${styles.today}`}>{ 16 }일</span>
            </div>
            <p onClick={() => openModal('diary')}>일기 제목</p>
        </div>
    );
};

export default DiaryItem;