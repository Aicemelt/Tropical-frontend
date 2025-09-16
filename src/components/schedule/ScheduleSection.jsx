import React, {useState} from 'react';
import EmptyState from "../common/EmptyState.jsx";
import styles from '../../styles/components/SecheduleSection.module.scss';
import ScheduleList from "./ScheduleList.jsx";

const ScheduleSection = () => {

    const [isOpened, setIsOpened] = useState(false)

    return (
        <div>
            <h4>일정
                {
                    // 등록된 일정이 있으면 노출
                    <span className={`${styles.badge}`}>1</span>
                }
                {
                    // 등록된 일정 개수가 2개 이상일 경우 토글 버튼 노출
                    <button className={`${styles.toggleBtn} ${isOpened ? styles.open : ''}`} onClick={() => setIsOpened(!isOpened)} ></button>
                }
            </h4>
            {/* 등록된 내용이 없을 때 보여주는 화면 */}
            <EmptyState />
            <ScheduleList />
        </div>
    );
};

export default ScheduleSection;