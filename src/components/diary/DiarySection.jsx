import React from 'react';
import EmptyState from "../common/EmptyState.jsx";
import DiaryItem from "./DiaryItem.jsx";
import styles from '../../styles/components/DiarySection.module.scss';

const DiarySection = () => {
    return (
        <div>
            <h4>일기</h4>
            {/* 등록된 내용이 없을 때 보여주는 화면 */}
            <EmptyState />
            <DiaryItem />
        </div>
    );
};

export default DiarySection;