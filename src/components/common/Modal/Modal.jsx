import React, {useEffect} from 'react';
import styles from '../../../styles/components/Modal.module.scss';
import DiaryForm from "../../diary/DiaryForm.jsx";
import Portal from "./Portal.jsx";
import {useModalStore} from "../../../store/useModalStore.js";
import ScheduleForm from "../../schedule/ScheduleForm.jsx";

const BackDrop = ({onClose}) => {
    return (
        <div className={`${styles.backdrop}`} onClick={onClose}></div>
    )
}

const ModalContent = ({type, onClose}) => {
    return (
        <div className={`${styles.modal}`}>
            {type === 'diary' && <DiaryForm onClose={onClose}/>}
            {type === 'schedule' && <ScheduleForm onClose={onClose}/>}
        </div>
    )
}

const Modal = () => {
    const { isOpen, modalType, closeModal } = useModalStore();

    if (!isOpen) return null;

    return (
        <div>
            <Portal destId='backdrop'>
                <BackDrop onClose={closeModal}/>
            </Portal>

            <Portal destId='modal'>
                <ModalContent type={modalType} onClose={closeModal}/>
            </Portal>
        </div>
    );
};

export default Modal;