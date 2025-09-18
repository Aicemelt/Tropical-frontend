import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/components/Item.module.scss';
import { useTodosApi } from "../../hooks/todo/useTodosApi.js";

const TodoItem = ({ todo }) => {
    const [expanded, setExpanded] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    // isFinish 상태를 todo.isCompleted로 올바르게 초기화합니다.
    const [isFinish, setIsFinish] = useState(todo.isCompleted);
    const [text, setText] = useState(todo.content);

    const textareaRef = useRef();
    const { updateTodo, deleteTodo, completeTodo } = useTodosApi();

    // todo.isCompleted가 변경될 때 로컬 상태도 동기화
    useEffect(() => {
        setIsFinish(todo.isCompleted);
    }, [todo.isCompleted]);

    // 수정 모드 textarea 자동 높이 조절
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [text, isEdit]);

    // 체크박스 상태 변경 핸들러
    const handleCheckboxChange = async (e) => {
        const newIsFinish = e.target.checked;
        setIsFinish(newIsFinish); // 즉시 UI 업데이트

        try {
            await completeTodo(todo.todoId, newIsFinish);
        } catch (error) {
            console.error("완료 상태 변경 실패:", error);
            // 실패 시 원래 상태로 되돌리기
            setIsFinish(!newIsFinish);
            alert("완료 상태 변경에 실패했습니다.");
        }
    };

    // 할 일 삭제 핸들러
    const handleDelete = async () => {
        try {
            await deleteTodo(todo.todoId);
        } catch (error) {
            console.error("삭제 실패:", error);
            alert("할 일 삭제에 실패했습니다.");
        }
    };

    // 수정 완료 핸들러
    const handleUpdate = async () => {
        if (text.trim() === '') {
            alert("할 일 내용을 입력해주세요.");
            setText(todo.content); // 원래 내용으로 복원
            return;
        }

        try {
            setIsEdit(false);
            await updateTodo(todo.todoId, text, todo.dueDate);
        } catch (error) {
            console.error("수정 실패:", error);
            setText(todo.content); // 실패 시 원래 내용으로 복원
            alert("할 일 수정에 실패했습니다.");
        }
    };

    // 수정 버튼 클릭 핸들러
    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEdit(!isEdit);
        if (!isEdit) {
            setText(todo.content); // 수정 모드 진입 시 현재 내용으로 초기화
        }
    };

    return (
        <div className={`${styles.item} ${isFinish ? styles.finish : ''}`}>
            <div className={styles.checkboxArea}>
                <input
                    type="checkbox"
                    id={`todo-${todo.todoId}`}
                    checked={isFinish}
                    onChange={handleCheckboxChange}
                />
                <label htmlFor={`todo-${todo.todoId}`}></label>
            </div>

            <div className={`${styles.textArea} ${expanded ? styles.open : ''}`}>
                {!isEdit ? (
                    <span
                        className={styles.text}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {text}
                    </span>
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ overflow: 'hidden', resize: 'none' }}
                        onBlur={handleUpdate}
                    />
                )}
            </div>

            <div className={styles.btnArea}>
                <button
                    className={styles.editBtn}
                    onClick={handleEditClick}
                ></button>
                <button
                    className={styles.deleteBtn}
                    onClick={handleDelete}
                ></button>
            </div>
        </div>
    );
};

export default TodoItem;