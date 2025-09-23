import React, {useEffect, useState} from 'react';
import styles from '../../../styles/components/Modal.module.scss';
import DiaryForm from "../../diary/DiaryForm.jsx";
import Portal from "./Portal.jsx";
import {useModalStore} from "../../../store/useModalStore.js";
import ScheduleForm from "../../schedule/ScheduleForm.jsx";
import { useDiary } from "../../../hooks/diary/useDiary.js";

const BackDrop = ({onClose}) => {
    return (
        <div className={`${styles.backdrop}`} onClick={onClose}></div>
    )
}

const ModalContent = ({type, onClose, modalData}) => {
    const { getDiaryByDate } = useDiary();
    const [diaryMode, setDiaryMode] = useState('create');
    const [existingDiary, setExistingDiary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 일기 모달인 경우 해당 날짜에 기존 일기가 있는지 확인
    useEffect(() => {
        const checkExistingDiary = async () => {
            if (type === 'diary' && modalData?.selectedDate) {
                setIsLoading(true);
                try {
                    const existingDiary = await getDiaryByDate(modalData.selectedDate);
                    if (existingDiary) {
                        setDiaryMode('edit');
                        setExistingDiary(existingDiary);
                        console.log('📔 기존 일기 발견, 수정 모드로 전환:', existingDiary);
                    } else {
                        setDiaryMode('create');
                        setExistingDiary(null);
                        console.log('📔 새 일기 작성 모드');
                    }
                } catch (error) {
                    console.error('기존 일기 확인 실패:', error);
                    setDiaryMode('create');
                    setExistingDiary(null);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        checkExistingDiary();
    }, [type, modalData?.selectedDate, getDiaryByDate]);

    if (isLoading && type === 'diary') {
        return (
            <div className={`${styles.modal}`}>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    일기를 불러오는 중...
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.modal}`}>
            {type === 'diary' && (
                <DiaryForm
                    onClose={onClose}
                    mode={diaryMode}
                    initialData={existingDiary}
                    selectedDate={modalData?.selectedDate}
                />
            )}
            {type === 'schedule' && (
                <ScheduleForm
                    onClose={onClose}
                    selectedDate={modalData?.selectedDate}
                />
            )}
        </div>
    )
}

const Modal = () => {
    const { isOpen, modalType, modalData, closeModal } = useModalStore();

    if (!isOpen) return null;

    return (
        <div>
            <Portal destId='backdrop'>
                <BackDrop onClose={closeModal}/>
            </Portal>

            <Portal destId='modal'>
                <ModalContent type={modalType} onClose={closeModal} modalData={modalData}/>
            </Portal>
        </div>
    );
};

export default Modal;