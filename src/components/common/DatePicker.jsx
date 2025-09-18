import React, {useRef, useState, useEffect} from "react";
import styles from "../../styles/components/DatePicker.module.scss";

//  onDateChange prop과 initialDate prop을 받도록 수정
const DatePicker = ({ onDateChange, initialDate }) => {
    const inputRef = useRef();
    const [date, setDate] = useState("");

    // initialDate가 변경될 때마다 date 상태 업데이트
    useEffect(() => {
        if (initialDate) {
            setDate(initialDate);
        } else {
            setDate("");
        }
    }, [initialDate]);

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
            if (selectedDateValue) {
                onDateChange(new Date(selectedDateValue));
            } else {
                onDateChange(null);
            }
        }
    };

    return (
        <label className={styles.dateWrapper} aria-label="마감일 선택" onClick={() => inputRef.current?.showPicker?.()}>
            <span className={styles.text}>~ {formatDate()}</span>
            <input
                ref={inputRef}
                type="date"
                className={styles.overlayInput}
                onChange={handleChange}
                min={getToday()}
                value={date}
            />
        </label>
    );
};

export default DatePicker;