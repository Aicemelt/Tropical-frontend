import React from 'react';
import LeftHeader from "../components/common/LeftHeader.jsx";
import {leftLayout, container} from '../styles/layouts/Layout.module.scss';
import SmallTalkList from "../components/smalltalk/SmallTalkList.jsx";
import Tips from "../components/smalltalk/Tips.jsx";
import PageTransition from "../components/common/PageTransition/PageTransition.jsx";

const LeftLayout = () => {
    return (
        <div className={leftLayout}>
            <PageTransition>
            <LeftHeader />
                <div className={container}>
                    <SmallTalkList />
                    <Tips />
                </div>
            </PageTransition>
        </div>
    );
};

export default LeftLayout;