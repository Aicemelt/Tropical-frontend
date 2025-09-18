import React, { useRef, useState, useEffect } from 'react';
import styles from '../../styles/components/Input.module.scss';
import DatePicker from "../common/DatePicker.jsx";
import { useTodosApi } from "../../hooks/todo/useTodosApi.js";

const TodoInput = ({
                       isEditMode = false,
                       editTodo = null,
                       isOpen = null,
                       onClose = null
                   }) => {
    const scrollHeightRef = useRef();
    const formRef = useRef(); // 폼 요소 참조 추가
    const [content, setContent] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isInputOpen, setIsInputOpen] = useState(false);

    const { createTodo, updateTodo, isLoading } = useTodosApi();

    // 수정 모드일 때 초기값 설정
    useEffect(() => {
        if (isEditMode && editTodo) {
            setContent(editTodo.content);
            setDueDate(editTodo.dueDate || "");
        }
    }, [isEditMode, editTodo]);

    // textarea 높이 조절 (수정 모드에서 초기 로딩 시)
    useEffect(() => {
        if (isEditMode && isOpen && scrollHeightRef.current) {
            setTimeout(() => {
                scrollHeightRef.current.style.height = 'auto';
                scrollHeightRef.current.style.height = scrollHeightRef.current.scrollHeight + 'px';
            }, 0);
        }
    }, [isEditMode, isOpen]);

    // 외부 클릭 시 창 닫기 (수정 모드와 새 할일 생성 모드 둘 다)
    useEffect(() => {
        if ((isEditMode && isOpen) || (!isEditMode && isInputOpen)) {
            const handleClickOutside = (event) => {
                if (formRef.current && !formRef.current.contains(event.target)) {
                    handleCancel();
                }
            };

            // 약간의 딜레이를 주어 현재 클릭 이벤트가 완료된 후에 리스너 추가
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isEditMode, isOpen, isInputOpen]);

    // 외부에서 제어하는 isOpen 상태 (수정 모드용)
    const inputOpen = isEditMode ? isOpen : isInputOpen;

    const handleInput = () => {
        if (scrollHeightRef.current) {
            scrollHeightRef.current.style.height = 'auto';
            scrollHeightRef.current.style.height = scrollHeightRef.current.scrollHeight + 'px';
        }
    };

    const handleCancel = () => {
        if (isEditMode) {
            setContent(editTodo?.content || "");
            setDueDate(editTodo?.dueDate || "");
            onClose && onClose();
        } else {
            setIsInputOpen(false);
            setContent("");
            setDueDate("");
        }
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

            if (isEditMode) {
                // 수정 모드
                await updateTodo(editTodo.todoId, content, formattedDueDate);
                onClose && onClose();
            } else {
                // 새 할 일 추가 모드
                await createTodo(content, formattedDueDate);
                setContent("");
                setDueDate("");
                if (scrollHeightRef.current) {
                    scrollHeightRef.current.value = "";
                    scrollHeightRef.current.style.height = 'auto';
                }
                setIsInputOpen(false);
            }
        } catch (err) {
            const errorMessage = isEditMode ? "할 일 수정에 실패했습니다." : "할 일 등록에 실패했습니다.";
            alert(errorMessage);
        }
    };

    // 수정 모드일 때 인라인으로 렌더링
    if (isEditMode) {
        if (!inputOpen || !editTodo) return null;

        return (
            <form
                ref={formRef}
                className={`${styles.inputForm}`}
                onSubmit={handleSubmit}
            >
                <textarea
                    ref={scrollHeightRef}
                    placeholder={"할 일 내용을 입력하세요"}
                    onInput={handleInput}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isLoading}
                />
                <div className={styles.btnContainer}>
                    <DatePicker
                        onDateChange={handleDateChange}
                        initialDate={dueDate}
                    />
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
                            {isLoading ? "수정 중..." : "수정"}
                        </button>
                    </div>
                </div>
            </form>
        );
    }

    // 기본 모드 (새 할 일 추가)
    return (
        <>
            {!inputOpen ? (
                <button
                    className={`${styles.addBtn}`}
                    onClick={() => setIsInputOpen(true)}
                >
                    새 할 일 추가하기
                </button>
            ) : (
                <form
                    ref={formRef}
                    className={`${styles.inputForm}`}
                    onSubmit={handleSubmit}
                >
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