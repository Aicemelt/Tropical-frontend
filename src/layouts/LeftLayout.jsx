import React from 'react';
import Header from "../components/smalltalk/Header.jsx";
import {leftLayout} from '../styles/layouts/Layout.module.scss';
import SmallTalkList from "../components/smalltalk/SmallTalkList.jsx";
import Tips from "../components/smalltalk/Tips.jsx";

const LeftLayout = () => {
    return (
        <div className={leftLayout}>
            <Header />
            <SmallTalkList />
            <Tips />
        </div>
    );
};

export default LeftLayout;