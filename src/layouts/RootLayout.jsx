import React from 'react';
import {Outlet} from "react-router-dom";
import RightLayout from "./RightLayout.jsx";
import LeftLayout from "./LeftLayout.jsx";

const RootLayout = () => {
    return (
        <>
            <LeftLayout />
            <RightLayout />
        </>
    );
};

export default RootLayout;