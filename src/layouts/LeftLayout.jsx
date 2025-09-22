import React, {useEffect} from 'react';
import LeftHeader from "../components/common/LeftHeader.jsx";
import {container, leftLayout} from '../styles/layouts/Layout.module.scss';
import SmallTalkList from "../components/smalltalk/SmallTalkList.jsx";
import Tips from "../components/smalltalk/Tips.jsx";
import {useSmalltalk} from "../hooks/smalltalk/useSmalltalk.js";
import useAuthStore from "../store/authStore.js";

const LeftLayout = () => {
    const {smallTalkData, fetchSmalltalk} = useSmalltalk();
    const nickname = useAuthStore(state => state.user?.nickname);

    useEffect(() => {
        fetchSmalltalk();
        const intervalId = setInterval(() => {
            try {
                fetchSmalltalk();
                console.log("새로운 주제 로드!");
                console.log(smallTalkData)
            } catch (e) {
                console.error("fetch 실패:", e);
            }}, 60000);
        return () => clearInterval(intervalId);
    }, [fetchSmalltalk]);

    return (
        <div className={leftLayout}>
            <LeftHeader name={nickname}/>
            <div className={container}>
                <SmallTalkList talks= {smallTalkData}/>
                <Tips />
            </div>
        </div>
    );
};

export default LeftLayout;