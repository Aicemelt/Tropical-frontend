import React, {useRef, useState} from 'react';
import styles from '../../styles/components/Input.module.scss';
import {Form} from "react-router-dom";
import DatePicker from "../common/DatePicker.jsx";

const TodoInput = () => {
    // 폼의 가시성을 관리할 상태 추가
    const [isFormVisible, setIsFormVisible] = useState(false);

    const scrollHeightRef = useRef();

    const handleInput = () => {
        if(scrollHeightRef.current) {
            scrollHeightRef.current.style.height = 'auto';
            scrollHeightRef.current.style.height = scrollHeightRef.current.scrollHeight + 'px';
        }
    }

    const handleAddClick = () => {
        setIsFormVisible(true);
    }

    const handleCancelClick = () => {
        setIsFormVisible(false);
    }

    return (
        <>
            {/* isFormVisible 상태가 false일 때만 버튼을 렌더링 */}
            {!isFormVisible && (
                <button
                    className={`${styles.addBtn}`}
                    onClick={handleAddClick}
                >
                    새 할 일 추가하기
                </button>
            )}

            {/* isFormVisible 상태가 true일 때만 폼을 렌더링 */}
            {isFormVisible && (
                <form className={`${styles.inputForm}`}>
                    <textarea
                        ref={scrollHeightRef}
                        placeholder={"새 할 일 추가하기"}
                        onInput={handleInput}
                    >
                    </textarea>
                    <div className={styles.btnContainer}>
                        <DatePicker />
                        <div className={styles.btnArea}>
                            {/* 취소 버튼 클릭 시 폼을 숨기는 함수 호출 */}
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={handleCancelClick}
                            >
                                취소
                            </button>
                            <button className={`${styles.btn} ${styles.btnSubmit}`}>등록</button>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
};

export default TodoInput;