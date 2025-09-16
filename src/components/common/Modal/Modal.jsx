import React from 'react';
import styles from '../../../styles/components/Modal.module.scss';
import ScheduleForm from "../../schedule/ScheduleForm.jsx";
import DiaryForm from "../../diary/DiaryForm.jsx";
import ReactDom from "react-dom";
import Portal from "./Portal.jsx";

const BackDrop = () => {
    return (
        <div className={`${styles.backdrop}`}></div>
    )
}

const ModalContent = () => {
    return (
        <div className={`${styles.modal}`}>
            <DiaryForm />
            {/*<ScheduleForm />*/}
        </div>
    )
}

const Modal = () => {
    return (
        <div>
            <Portal destId='backdrop'>
                <BackDrop />
            </Portal>

            <Portal destId='modal'>
                <ModalContent />
            </Portal>
        </div>
    );
};

export default Modal;