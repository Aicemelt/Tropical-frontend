// src/components/bucket/BucketPage.jsx

import React, { useEffect } from 'react';
import BucketFilter from "../components/bucket/BucketFilter.jsx";
import BucketList from "../components/bucket/BucketList.jsx";
import BucketInput from "../components/bucket/BucketInput.jsx";
import { useBucketApi } from '../hooks/bucket/useBucketApi.js';
import { useBucketStore } from '../store/bucketStore.js';

const BucketPage = () => {
    // API 훅에서 getAllBuckets만 가져옴
    const { getAllBuckets } = useBucketApi();

    // 스토어에서 로딩/에러 상태를 가져옴
    const isLoading = useBucketStore(state => state.isLoading);
    const error = useBucketStore(state => state.error);

    // 컴포넌트가 처음 렌더링될 때만 모든 버킷리스트를 가져옴
    useEffect(() => {
        getAllBuckets();
    }, []);

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>에러 발생: {error}</div>;

    return (
        <>
            <BucketFilter />
            <BucketInput />
            <BucketList />
        </>
    );
};

export default BucketPage;