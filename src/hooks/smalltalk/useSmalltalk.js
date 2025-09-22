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
            } else {
                console.warn('API 호출 실패 메시지:', res.data.message);
            }
        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;
                if (status === 401) {
                    console.warn('로그인 필요:', data?.message);
                } else {
                    console.error('서버 에러:', status, data?.message);
                }
            } else {
                console.error('네트워크 에러 또는 요청 실패', err);
            }
        }
    }, []);

    return { smallTalkData, fetchSmalltalk };
};

