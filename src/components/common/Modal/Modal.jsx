import React from 'react';
import styles from '../../../styles/components/Modal.module.scss';
import ScheduleForm from "../../schedule/ScheduleForm.jsx";

const BackDrop = () => {
    return (
        <div className={`${styles.backdrop}`}></div>
    )
}

const Modal = () => {
    return (
        <div>
            <div className={`${styles.backdrop}`}></div>
            <div className={`${styles.modal}`}>
                <ScheduleForm />
            </div>
        </div>
    );
};

export default Modal;