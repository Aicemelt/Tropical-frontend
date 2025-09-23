import React, { useEffect } from 'react';
import TodoFilter from "../components/todo/TodoFilter.jsx";
import TodoInput from "../components/todo/TodoInput.jsx";
import TodoList from "../components/todo/TodoList.jsx";
import { useTodosApi } from "../hooks/todo/useTodosApi.js";

const TodoPage = () => {
    const { getAllTodos, error } = useTodosApi();

    useEffect(() => {
        getAllTodos();
    }, []); // 빈 의존성 배열을 사용하여 컴포넌트 마운트 시에만 한 번 호출

    if (error) {
        return <div>할 일 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</div>;
    }

    return (
        <>
            <TodoFilter />
            <TodoInput />
            <TodoList />
        </>
    );
};

export default TodoPage;