// src/hooks/bucket/useBucketApi.js

import { useState } from 'react';
import { useBucketStore } from '../../store/bucketStore.js';

const API_BASE_URL = "http://localhost:9005/api/v1/buckets";

// 테스트용 JWT 토큰
const TEST_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJwYWNrODQ0N0BnbWFpbC5jb20iLCJ0b2tlblR5cGUiOiJBQ0NFU1MiLCJpYXQiOjE3NTgyMTMyNzUsImV4cCI6MTc1ODIyMjI3NX0.r8_fRsyMmZ86_zIkw7Theqmwza7WMWsw8TqAHevHfh4";

export const useBucketApi = () => {
    // Todo 방식과 동일하게 API 훅 내부에서 로딩 상태 관리
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Store 함수들을 destructuring으로 가져오기
    const {
        setBuckets,
        addBucket: addBucketToStore,
        removeBucket: removeBucketFromStore,
        updateBucket: updateBucketInStore,
        toggleCompleteBucket: toggleCompleteBucketInStore,
    } = useBucketStore();

    const callApi = async (url, method, body = null) => {
        setIsLoading(true);
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

            // DELETE 요청이나 204 상태 코드는 JSON 파싱하지 않음
            if (response.status === 204 || method === 'DELETE') {
                return null;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API 호출 실패: ${response.status} ${response.statusText}`);
            }

            // 응답이 있는 경우에만 JSON 파싱
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return null;
        } catch (err) {
            console.error("API 호출 중 오류 발생:", err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const createBucket = async (content) => {
        const newBucket = await callApi(API_BASE_URL, 'POST', { content });
        addBucketToStore(newBucket);
        return newBucket;
    };

    const getAllBuckets = async () => {
        const buckets = await callApi(API_BASE_URL, 'GET');
        setBuckets(buckets);
        return buckets;
    };

    const deleteBucket = async (bucketId) => {
        await callApi(`${API_BASE_URL}/${bucketId}`, 'DELETE');
        removeBucketFromStore(bucketId);
    };

    const updateBucket = async (bucketId, content) => {
        const updatedBucket = await callApi(`${API_BASE_URL}/${bucketId}`, 'PUT', { content });
        updateBucketInStore(updatedBucket);
        return updatedBucket;
    };

    const toggleCompleteBucket = async (bucketId, isCompleted) => {
        try {
            await callApi(`${API_BASE_URL}/${bucketId}/complete`, 'PUT', { isCompleted });
            toggleCompleteBucketInStore(bucketId, isCompleted);
        } catch (error) {
            console.error("완료 상태 변경 실패:", error);
            throw error;
        }
    };

    return {
        createBucket,
        getAllBuckets,
        updateBucket,
        deleteBucket,
        toggleCompleteBucket,
        isLoading,
        error
    };
};