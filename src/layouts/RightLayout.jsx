import React from 'react';
import styles from '../styles/layouts/Layout.module.scss';
import {Outlet} from "react-router-dom";
import RightHeader from "../components/common/RightHeader.jsx";
import WelcomePage from "../pages/WelcomePage.jsx";
import PageTransition from "../components/common/PageTransition/PageTransition.jsx";

const RightLayout = () => {
    return (
        <div className={styles.rightLayout}>
            <PageTransition>
                <RightHeader/>
            </PageTransition>
            {/*--- calender ---
            <CalendarPage />
            --- todo ---
            <TodoPage />
            --- bucket ---
            <BucketPage />*/}
            <PageTransition>
                <div className={styles.container}>
                    <Outlet/>
                </div>
            </PageTransition>
        </div>
    );
};

export default RightLayout;