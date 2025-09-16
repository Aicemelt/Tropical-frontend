import React from 'react';
import styles from '../styles/layouts/Layout.module.scss';
import {Outlet} from "react-router-dom";
import RightHeader from "../components/common/RightHeader.jsx";

const RightLayout = () => {
    return (
        <div className={styles.rightLayout}>
            <RightHeader />
            {/*--- calender ---
            <CalendarPage />
            --- todo ---
            <TodoPage />
            --- bucket ---
            <BucketPage />*/}
            <div className={styles.container}>
                <Outlet />
            </div>
        </div>
    );
};

export default RightLayout;