import React from 'react';
import styles from '../../styles/components/Filter.module.scss';
import { useBucketStore } from '../../store/bucketStore.js';

const BucketFilter = () => {
    // 필터는 "진행 중"과 "완료됨" 두 가지로 제한
    const filters = ["진행 중", "완료됨"];

    // Todo 방식과 동일하게 store에서 직접 가져오기
    const { currentFilter, setCurrentFilter, getFilterCounts } = useBucketStore();
    const filterCounts = getFilterCounts();

    return (
        <div className={`${styles.tabList}`}>
            {filters.map((f) => (
                <button
                    key={f}
                    className={`${styles.tab} ${
                        currentFilter === f ? `${styles.on}` : " "
                    }`}
                    onClick={() => setCurrentFilter(f)}
                >
                    {f}
                    <span>
                        {filterCounts[f] || 0}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default BucketFilter;