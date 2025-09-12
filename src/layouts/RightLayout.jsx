import React from 'react';
import {rightLayout} from '../styles/layouts/Layout.module.scss';
import {Outlet, Route} from "react-router-dom";
import RightHeader from "../components/common/RightHeader.jsx";
import CalendarPage from "../pages/CalendarPage.jsx";
import TodoPage from "../pages/TodoPage.jsx";

const RightLayout = () => {
    return (
        <div className={rightLayout}>
            <RightHeader />
            <CalendarPage />
            <TodoPage />
        </div>
    );
};

export default RightLayout;