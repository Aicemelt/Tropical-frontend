import React, {useRef, useState} from 'react';
import {Form} from "react-router-dom";
import styles from '../../styles/components/Form.module.scss';

const ScheduleForm = () => {

    const timeRef = useRef();
    const dateRef = useRef();

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const formatDate = () => {
        if (!date) return "연도. 월. 일";
        return date.replace(/-/g, ".");
    };

    const formatTime = () => {
        if (!time) return "--:--";

        const [hourStr, minute] = time.split(":");
        let hour = parseInt(hourStr, 10);
        const ampm = hour < 12 ? "오전" : "오후";

        if (hour === 0) hour = 12;       // 00시 → 12시
        else if (hour > 12) hour -= 12;  // 13~23시 → 1~11시

        return `${ampm} ${hour.toString().padStart(2, "0")}:${minute}`;
    };

    return (
        <Form>
            <div className={styles.titleArea}>
                <input type={"text"} className={styles.title} placeholder={'일정 제목을 입력하세요...'}/>
                <button className={styles.closeBtn} onClick={''}></button>
            </div>
            <div className={`${styles.inputArea}`}>
                <div className={`${styles.grid2}`}>
                    <div>
                        <span className={styles.label}>시작시간</span>
                        <label className={`${styles.dateWrapper} ${time ? styles.selected : ''}`} aria-label="시간 선택" onClick={() => timeRef.current?.showPicker?.()}>
                            <span>{formatTime(time)}</span>
                            <input ref={timeRef} type="time" className={styles.overlayInput} onChange={() => setTime(timeRef.current.value)}/>
                        </label>
                    </div>
                    <div>
                        <span className={styles.label}>종료 날짜</span>
                        <label className={`${styles.dateWrapper} ${date ? styles.selected : ''}`} aria-label="일정 등록 날짜 선택" onClick={() => dateRef.current?.showPicker?.()}>
                            <span>{formatDate(date)}</span>
                            <input ref={dateRef} type="date" className={styles.overlayInput} onChange={() => setDate(dateRef.current.value)}/>
                        </label>
                    </div>
                </div>
                <div>
                    <span className={styles.label}>일정 메모</span>
                    <textarea placeholder={'메모를 입력하세요'}></textarea>
                </div>
                <div>
                    <span className={styles.label}>장소</span>
                    <input type={"text"} placeholder={'장소를 입력하세요'}/>
                </div>
                <div>
                    <span className={styles.label}>참여자</span>
                    <input type={"text"} placeholder={'참여자를 입력하세요'}/>
                </div>
            </div>
            <div className={`${styles.btnArea}`}>
                <button className={styles.addBtn}>추가하기</button>
            </div>
        </Form>
    );
};

export default ScheduleForm;