import React from 'react';
import {rightLayout} from './Layout.module.scss';
import Header from "../components/smalltalk/Header.jsx";
import {Outlet} from "react-router-dom";

const RightLayout = () => {
    return (
        <div className={rightLayout}>
            <Outlet />
        </div>
    );
};

export default RightLayout;