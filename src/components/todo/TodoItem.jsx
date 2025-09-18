import React, { useEffect, useState } from 'react';
import styles from '../../styles/components/Item.module.scss';
import { useTodosApi } from "../../hooks/todo/useTodosApi.js";
import TodoInput from "./TodoInput.jsx";

const TodoItem = ({ todo }) => {
    const [expanded, setExpanded] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    // isFinish 상태를 todo.isCompleted로 올바르게 초기화합니다.
    const [isFinish, setIsFinish] = useState(todo.isCompleted);

    const { deleteTodo, completeTodo } = useTodosApi();

    // todo.isCompleted가 변경될 때 로컬 상태도 동기화
    useEffect(() => {
        setIsFinish(todo.isCompleted);
    }, [todo.isCompleted]);

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
        if (confirm("정말로 이 할 일을 삭제하시겠습니까?")) {
            try {
                await deleteTodo(todo.todoId);
            } catch (error) {
                console.error("삭제 실패:", error);
                alert("할 일 삭제에 실패했습니다.");
            }
        }
    };

    // 수정 버튼 클릭 핸들러
    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditMode(true);
    };

    // 수정 모드 종료 핸들러
    const handleEditClose = () => {
        setIsEditMode(false);
    };


    // D-day 계산 함수
    const calculateDday = () => {
        if (!todo.dueDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(todo.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "D-day";
        if (diffDays > 0) return `D-${diffDays}`;
        return `D+${Math.abs(diffDays)}`;
    };


    return (
        <>
            {/* 수정 모드가 아닐 때만 기존 TodoItem 표시 */}
            {!isEditMode && (
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
                        <span
                            className={styles.text}
                            onClick={() => setExpanded(!expanded)}
                        >
                            {todo.content}
                        </span>
                    </div>

                    <div className={styles.btnArea}>
                        <div>
                            {todo.dueDate && (
                                <span className={styles.dday}>{calculateDday()}</span>
                            )}

                        </div>
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
            )}

            {/* 수정 모드일 때 TodoInput 인라인으로 표시 */}
            {isEditMode && (
                <TodoInput
                    isEditMode={true}
                    editTodo={todo}
                    isOpen={true}
                    onClose={handleEditClose}
                />
            )}
        </>
    );
};

export default TodoItem;