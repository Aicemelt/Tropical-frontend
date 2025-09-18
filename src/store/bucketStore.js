// src/store/bucketStore.js

import { create } from 'zustand';

export const useBucketStore = create((set, get) => ({
    buckets: [],
    currentFilter: "진행 중",
    isLoading: false,
    error: null,

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // API 호출로 받은 모든 버킷리스트를 상태에 저장
    setBuckets: (buckets) => set({ buckets }),

    // 필터 변경 액션
    setCurrentFilter: (filter) => set({ currentFilter: filter }),

    // 새로운 버킷리스트를 추가할 때만 상태 업데이트
    addBucket: (newBucket) => set((state) => ({ buckets: [newBucket, ...state.buckets] })),

    // 특정 버킷리스트만 제거
    removeBucket: (bucketId) => set((state) => ({
        buckets: state.buckets.filter((bucket) => bucket.bucketId !== bucketId)
    })),

    // 특정 버킷리스트만 업데이트
    updateBucket: (updatedBucket) => set((state) => ({
        buckets: state.buckets.map((bucket) =>
            bucket.bucketId === updatedBucket.bucketId ? updatedBucket : bucket
        )
    })),

    // 특정 버킷리스트의 완료 상태만 토글
    toggleCompleteBucket: (bucketId, isCompleted) => set((state) => ({
        buckets: state.buckets.map((bucket) =>
            bucket.bucketId === bucketId ? { ...bucket, isCompleted } : bucket
        )
    })),

    // 클라이언트 측에서 필터링된 버킷리스트 반환
    getFilteredBuckets: () => {
        const { buckets, currentFilter } = get();
        if (currentFilter === "완료됨") {
            return buckets.filter((bucket) => bucket.isCompleted);
        } else if (currentFilter === "진행 중") {
            return buckets.filter((bucket) => !bucket.isCompleted);
        }
        return buckets;
    },

    // 필터 카운트 계산
    getFilterCounts: () => {
        const { buckets } = get();
        const counts = {
            "진행 중": buckets.filter((bucket) => !bucket.isCompleted).length,
            "완료됨": buckets.filter((bucket) => bucket.isCompleted).length,
        };
        return counts;
    },
}));