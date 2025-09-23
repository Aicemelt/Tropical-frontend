import React from 'react';
import RightLayout from "./RightLayout.jsx";
import {useNavigatorSetup} from '../hooks/welcome/useNavigatorSetup.js';
import LeftLayout from "./LeftLayout.jsx";
import Modal from "../components/common/Modal/Modal.jsx";

const RootLayout = () => {

    useNavigatorSetup();

    return (
        <>
            {/* 모달  */}
            {<Modal/>}
            <LeftLayout/>
            <RightLayout/>
        </>
    );
};

export default RootLayout;