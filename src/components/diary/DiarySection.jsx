import React from 'react';
import EmptyState from "../common/EmptyState.jsx";

const DiarySection = () => {
    return (
        <div>
            {/* 등록된 내용이 없을 때 보여주는 화면 */}
            <EmptyState />
        </div>
    );
};

export default DiarySection;