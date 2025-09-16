import React from 'react';
import styles from '../../styles/components/EmptyState.module.scss';
import emptyImage from '../../asset/tropical-bird.png';

const EmptyState = () => {
    return (
        <div className={`${styles.emptyState}`}>
            <img src={emptyImage} />
            <p>등록된 {'일정이 / 일기가'} 없습니다.</p>
        </div>
    );
};

export default EmptyState;