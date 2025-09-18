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

    // 수정 모드 textarea 자동 높이 조절
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [text, isEdit]);

    // 체크박스 상태 변경 핸들러
    const handleCheckboxChange = (e) => {
        const newIsFinish = e.target.checked;
        setIsFinish(newIsFinish);
        completeTodo(todo.todoId, newIsFinish);
    };

    // 할 일 삭제 핸들러
    const handleDelete = () => {
        deleteTodo(todo.todoId);
    };

    // 수정 완료 핸들러
    const handleUpdate = () => {
        setIsEdit(false);
        updateTodo(todo.todoId, text, todo.dueDate);
    };

    // 수정 버튼 클릭 핸들러
    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEdit(!isEdit);
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