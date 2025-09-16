import React from 'react';
import ReactDom from "react-dom";

const Portal = ({children, destId}) => {
    return ReactDom.createPortal(
        children,
        document.getElementById(destId)
    );
};

export default Portal;