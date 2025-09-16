import React from 'react';
import {Outlet} from "react-router-dom";
import RightLayout from "./RightLayout.jsx";
import LeftLayout from "./LeftLayout.jsx";
import Modal from "../components/common/Modal/Modal.jsx";

const RootLayout = () => {
    return (
        <>
            <Modal />
            <LeftLayout />
            <RightLayout />
        </>
    );
};

export default RootLayout;