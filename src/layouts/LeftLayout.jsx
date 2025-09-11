import React from 'react';
import Header from "../components/smalltalk/Header.jsx";
import {leftLayout} from './Layout.module.scss';

const LeftLayout = () => {
    return (
        <div className={leftLayout}>
            <Header />{/*
            <TalkList />
            <Tips />*/}
        </div>
    );
};

export default LeftLayout;