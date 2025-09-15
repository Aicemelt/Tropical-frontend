import React, {useRef} from 'react';
import styles from '../../styles/components/Input.module.scss';
import {Form} from "react-router-dom";
import DatePicker from "../common/DatePicker.jsx";

const BucketInput = () => {

    const scrollHeightRef = useRef();
    const handleInput = () => {
        if(scrollHeightRef.current) {
            scrollHeightRef.current.style.height = 'auto';
            scrollHeightRef.current.style.height = scrollHeightRef.current.scrollHeight + 'px';
        }
    }

    return (
        <>
            <button className={`${styles.addBtn}`}>새 버킷리스트 추가하기</button>
            <form className={`${styles.inputForm}`}>
                <textarea
                    ref={scrollHeightRef}
                    placeholder={"새 버킷리스트 추가하기"}
                    onInput={handleInput}
                >
                </textarea>
                <div className={`${styles.btnContainer} ${styles.flexEnd}`}>
                    <div className={styles.btnArea}>
                        <button className={`${styles.btn} ${styles.btnCancel}`}>취소</button>
                        <button className={`${styles.btn} ${styles.btnSubmit}`}>등록</button>
                    </div>
                </div>
            </form>
        </>
    );
};

export default BucketInput;