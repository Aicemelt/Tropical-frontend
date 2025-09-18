// src/hooks/bucket/useBucketApi.js

import { useBucketStore } from '../../store/bucketStore.js';

const API_BASE_URL = "http://localhost:9005/api/v1/buckets";

// 테스트용 JWT 토큰
const TEST_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJwYWNrODQ0N0BnbWFpbC5jb20iLCJ0b2tlblR5cGUiOiJBQ0NFU1MiLCJpYXQiOjE3NTgyMTMyNzUsImV4cCI6MTc1ODIyMjI3NX0.r8_fRsyMmZ86_zIkw7Theqmwza7WMWsw8TqAHevHfh4";

export const useBucketApi = () => {
    const {
        setLoading,
        setError,
        setBuckets,
        addBucket: addBucketToStore,
        removeBucket: removeBucketFromStore,
        updateBucket: updateBucketInStore,
        toggleCompleteBucket: toggleCompleteBucketInStore,
    } = useBucketStore();

    // callApi 함수를 정의
    const callApi = async (url, method, body = null) => {
        setLoading(true);
        setError(null);
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TEST_TOKEN}`
                }
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(url, options);
            if (response.status === 204) {
                return null;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API 호출 실패: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (err) {
            console.error("API 호출 중 오류 발생:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createBucket = async (content) => {
        try {
            const newBucket = await callApi(API_BASE_URL, 'POST', { content });
            addBucketToStore(newBucket);
        } catch (err) {
            console.error("버킷리스트 생성 실패:", err);
        }
    };

    const getAllBuckets = async () => {
        try {
            const buckets = await callApi(API_BASE_URL, 'GET');
            setBuckets(buckets);
        } catch (err) {
            console.error("모든 버킷리스트 조회 실패:", err);
        }
    };

    const deleteBucket = async (bucketId) => {
        try {
            await callApi(`${API_BASE_URL}/${bucketId}`, 'DELETE');
            removeBucketFromStore(bucketId);
        } catch (err) {
            console.error("버킷리스트 삭제 실패:", err);
        }
    };

    const updateBucket = async (bucketId, content) => {
        try {
            const updatedBucket = await callApi(`${API_BASE_URL}/${bucketId}`, 'PUT', { content });
            updateBucketInStore(updatedBucket);
        } catch (err) {
            console.error("버킷리스트 수정 실패:", err);
        }
    };

    const toggleCompleteBucket = async (bucketId, isCompleted) => {
        try {
            await callApi(`${API_BASE_URL}/${bucketId}/complete`, 'PUT', { isCompleted });
            toggleCompleteBucketInStore(bucketId, isCompleted);
        } catch (error) {
            console.error("완료 상태 변경 실패:", error);
        }
    };

    return {
        createBucket,
        getAllBuckets,
        updateBucket,
        deleteBucket,
        toggleCompleteBucket,
    };
};