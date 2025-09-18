import React, { useRef, useState } from 'react';
import styles from '../../styles/components/Input.module.scss';
import DatePicker from "../common/DatePicker.jsx";
import { useTodosApi } from "../../hooks/todo/useTodosApi.js";

const TodoInput = () => {
    const scrollHeightRef = useRef();
    const [content, setContent] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isInputOpen, setIsInputOpen] = useState(false);

    const { createTodo, isLoading } = useTodosApi();

    const handleInput = () => {
        if (scrollHeightRef.current) {
            scrollHeightRef.current.style.height = 'auto';
            scrollHeightRef.current.style.height = scrollHeightRef.current.scrollHeight + 'px';
        }
    };

    const handleCancel = () => {
        setIsInputOpen(false);
        setContent("");
        setDueDate("");
    };

    const handleDateChange = (date) => {
        if (date) {
            const formattedDate = date.getFullYear() + '-' +
                String(date.getMonth() + 1).padStart(2, '0') + '-' +
                String(date.getDate()).padStart(2, '0');
            setDueDate(formattedDate);
        } else {
            setDueDate("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            alert("할 일 내용을 입력해주세요.");
            return;
        }

        try {
            const formattedDueDate = dueDate === "" ? null : dueDate;
            await createTodo(content, formattedDueDate);

            setContent("");
            setDueDate("");
            if (scrollHeightRef.current) {
                scrollHeightRef.current.value = "";
                scrollHeightRef.current.style.height = 'auto';
            }
            setIsInputOpen(false);
        } catch (err) {
            alert("할 일 등록에 실패했습니다.");
        }
    };

    return (
        <>
            {!isInputOpen ? (
                <button
                    className={`${styles.addBtn}`}
                    onClick={() => setIsInputOpen(true)}
                >
                    새 할 일 추가하기
                </button>
            ) : (
                <form className={`${styles.inputForm}`} onSubmit={handleSubmit}>
                    <textarea
                        ref={scrollHeightRef}
                        placeholder={"새 할 일 추가하기"}
                        onInput={handleInput}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className={styles.btnContainer}>
                        <DatePicker onDateChange={handleDateChange} />
                        <div className={styles.btnArea}>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={handleCancel}
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className={`${styles.btn} ${styles.btnSubmit}`}
                                disabled={isLoading}
                            >
                                {isLoading ? "등록 중..." : "등록"}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
};

export default TodoInput;