import React from 'react';
import LeftHeader from "../components/common/LeftHeader.jsx";
import {leftLayout} from '../styles/layouts/Layout.module.scss';
import SmallTalkList from "../components/smalltalk/SmallTalkList.jsx";
import Tips from "../components/smalltalk/Tips.jsx";

const LeftLayout = () => {
    return (
        <div className={leftLayout}>
            <LeftHeader />
            <SmallTalkList />
            <Tips />
        </div>
    );
};

export default LeftLayout;