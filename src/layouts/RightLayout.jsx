import React from 'react';
import {rightLayout} from '../styles/layouts/Layout.module.scss';
import {Outlet, Route} from "react-router-dom";
import RightHeader from "../components/common/RightHeader.jsx";

const RightLayout = () => {
    return (
        <div className={rightLayout}>
            <RightHeader />
        </div>
    );
};

export default RightLayout;