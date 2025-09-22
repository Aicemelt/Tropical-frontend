import {useCallback, useState} from "react";
import {apiMethods} from "../../services/api.js";

export const useSmalltalk = () => {
    const [smallTalkData, setSmallTalkData] = useState([]);

    const fetchSmalltalk = useCallback(async () => {
        try {
            const res = await apiMethods.get('/smalltalk');
            if (res.data.success) {
                const data = res.data.data.topics || [];
                setSmallTalkData(data);
                console.log("Fetched smallTalkData:", data); // 최신 값 확인
                return data; // 최신 데이터 반환
            } else {
                console.warn('API 호출 실패 메시지:', res.data.message);
                return [];
            }
        } catch (err) {
            console.error('fetch 실패:', err);
            return [];
        }
    }, []);


    return { smallTalkData, fetchSmalltalk };
};

