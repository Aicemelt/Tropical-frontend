import React, {useRef, useState} from "react";
import styles from "../../styles/components/DatePicker.module.scss";

const DatePicker = () => {
    const inputRef = useRef();
    const [date, setDate] = useState("");

    // 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환하는 함수
    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const formatDate = () => {
        if (!date) return new Date().toISOString().slice(0, 10).replace(/-/g, ".");
        return date.replace(/-/g, ".");
    };

    return (
        <label className={styles.dateWrapper} aria-label="마감일 선택" onClick={() => inputRef.current?.showPicker?.()}>
            <span className={styles.text}>~ {formatDate(date)}</span>
            <input ref={inputRef} type="date"
                   className={styles.overlayInput} onChange={() => setDate(inputRef.current.value)}
                   min={getToday()}
            />
        </label>
    );
};

export default DatePicker;
