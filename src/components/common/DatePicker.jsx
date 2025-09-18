import React, {useRef, useState} from "react";
import styles from "../../styles/components/DatePicker.module.scss";

//  onDateChange prop을 받도록 수정
const DatePicker = ({ onDateChange }) => {
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
        if (!date) return "기한 없음";
        return date.replace(/-/g, ".");
    };

    // input의 onChange 이벤트 핸들러
    const handleChange = (e) => {
        const selectedDateValue = e.target.value;
        setDate(selectedDateValue);

        // ✅ 부모 컴포넌트에서 전달받은 onDateChange 함수 호출
        // 날짜를 ISO 형식의 문자열로 변환하여 전달
        if (onDateChange) {
            onDateChange(new Date(selectedDateValue));
        }
    };

    return (
        <label className={styles.dateWrapper} aria-label="마감일 선택" onClick={() => inputRef.current?.showPicker?.()}>
            <span className={styles.text}>~ {formatDate(date)}</span>
            <input
                ref={inputRef}
                type="date"
                className={styles.overlayInput}
                onChange={handleChange}
                min={getToday()}
            />
        </label>
    );
};

export default DatePicker;