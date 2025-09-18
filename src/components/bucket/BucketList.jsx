// src/components/bucket/BucketList.jsx

import React from 'react';
import BucketItem from "./BucketItem.jsx";
import { useBucketStore } from '../../store/bucketStore.js';

const BucketList = () => {
    const { getFilteredBuckets } = useBucketStore();
    const filteredBuckets = getFilteredBuckets();

    if (filteredBuckets.length === 0) {
        return <div className="no-buckets">버킷리스트가 없습니다.</div>;
    }

    return (
        <div>
            {/* key prop에 고유 ID를 할당 */}
            {filteredBuckets.map((bucket) => (
                <BucketItem key={bucket.bucketId} bucket={bucket} />
            ))}
        </div>
    );
};

export default BucketList;