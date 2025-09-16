import React from 'react';
import {rightLayout} from '../styles/layouts/Layout.module.scss';
import {Outlet, Route} from "react-router-dom";
import RightHeader from "../components/common/RightHeader.jsx";
import CalendarPage from "../pages/CalendarPage.jsx";
import TodoPage from "../pages/TodoPage.jsx";
import BucketPage from "../pages/BucketPage.jsx";

const RightLayout = () => {
    return (
        <div className={rightLayout}>
            <RightHeader />
            {/*--- calender ---
            <CalendarPage />
            --- todo ---
            <TodoPage />
            --- bucket ---
            <BucketPage />*/}
            {/* 모달 완성 후   outlet 으로 변경*/}
            <Outlet />
        </div>
    );
};

export default RightLayout;