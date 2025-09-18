// src/components/bucket/BucketList.jsx

import React from 'react';
import BucketItem from "./BucketItem.jsx";
import { useBucketStore } from '../../store/bucketStore.js';

const BucketList = () => {
    // Todo 방식과 동일하게 store 함수를 직접 사용
    const { getFilteredBuckets } = useBucketStore();
    const filteredBuckets = getFilteredBuckets();

    if (filteredBuckets.length === 0) {
        return <div className="no-buckets">버킷리스트가 없습니다.</div>;
    }

    return (
        <div>
            {filteredBuckets.map((bucket) => (
                <BucketItem key={bucket.bucketId} bucket={bucket} />
            ))}
        </div>
    );
};

export default BucketList;