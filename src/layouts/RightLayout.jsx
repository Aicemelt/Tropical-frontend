import React from 'react';
import {rightLayout} from '../styles/layouts/Layout.module.scss';
import {Outlet} from "react-router-dom";

const RightLayout = () => {
    return (
        <div className={rightLayout}>
            <Outlet />
        </div>
    );
};

export default RightLayout;