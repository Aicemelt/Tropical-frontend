import React, {useEffect} from 'react';
import LeftHeader from "../components/common/LeftHeader.jsx";
import {container, leftLayout} from '../styles/layouts/Layout.module.scss';
import SmallTalkList from "../components/smalltalk/SmallTalkList.jsx";
import Tips from "../components/smalltalk/Tips.jsx";
import {useSmalltalk} from "../hooks/smalltalk/useSmalltalk.js";
import useAuthStore from "../store/authStore.js";
import PageTransition from "../components/common/PageTransition/PageTransition.jsx";


const LeftLayout = () => {
    const {smallTalkData, fetchSmalltalk} = useSmalltalk();
    const nickname = useAuthStore(state => state.user?.nickname);

    useEffect(() => {
        // 페이지 열리자마자 한번 실행
        fetchSmalltalk();

        const intervalId = setInterval(async () => {
            const latestData = await fetchSmalltalk(); // fetch 후 최신 DB 데이터 받음
            console.log("새로운 주제 로드!", latestData);
        }, 60000); // 테스트용

        return () => clearInterval(intervalId);
    }, [fetchSmalltalk])

    return (
        <div className={leftLayout}>
            <PageTransition>
            <LeftHeader name={nickname}/>
                <div className={container}>
                    <SmallTalkList talks= {smallTalkData}/>
                    <Tips />
                </div>
            </PageTransition>
        </div>
    );
};

export default LeftLayout;