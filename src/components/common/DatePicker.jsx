import React, {useRef, useState} from "react";
import styles from "../../styles/components/DatePicker.module.scss";

const DatePicker = () => {
    const inputRef = useRef();
    const [date, setDate] = useState("");

    const formatDate = () => {
        if (!date) return new Date().toISOString().slice(0, 10).replace(/-/g, ".");
        return date.replace(/-/g, ".");
    };

    return (
        <label className={styles.dateWrapper} aria-label="마감일 선택" onClick={() => inputRef.current?.showPicker?.()}>
            <span className={styles.text}>~ {formatDate(date)}</span>
            <input ref={inputRef} type="date" className={styles.overlayInput} onChange={() => setDate(inputRef.current.value)}/>
        </label>
    );
};

export default DatePicker;
