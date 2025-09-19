// src/hooks/bucket/useBucketApi.js

import { useState } from 'react';
import { useBucketStore } from '../../store/bucketStore.js';
import { axiosInstance } from '../../services/api.js';

const API_BASE_URL = "/api/v1/buckets";

export const useBucketApi = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        setBuckets,
        addBucket: addBucketToStore,
        removeBucket: removeBucketFromStore,
        updateBucket: updateBucketInStore,
        toggleCompleteBucket: toggleCompleteBucketInStore,
    } = useBucketStore();

    // axios 기반 API 호출 함수
    const callApi = async (url, method, body = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const config = {
                method,
                url,
                data: body,
            };
            const response = await axiosInstance(config);
            return response.data;
        } catch (err) {
            console.error("API 호출 중 오류 발생:", err);
            setError(err.response?.data?.message || err.message);
            return null;
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
        const data = await callApi(API_BASE_URL, 'get');
        if (data) setBuckets(data);
    };

    const deleteBucket = async (bucketId) => {
        await callApi(`${API_BASE_URL}/${bucketId}`, 'delete');
        removeBucketFromStore(bucketId);
    };

    const updateBucket = async (bucketId, content) => {
        const updatedBucket = await callApi(`${API_BASE_URL}/${bucketId}`, 'PUT', { content });
        updateBucketInStore(updatedBucket);
        return updatedBucket;
    };

    const toggleCompleteBucket = async (bucketId, isCompleted) => {
        const data = await callApi(`${API_BASE_URL}/${bucketId}/complete`, 'patch', { isCompleted });
        if (data) toggleCompleteBucketInStore(bucketId, isCompleted);
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