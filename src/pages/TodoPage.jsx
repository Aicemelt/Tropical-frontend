import React from 'react';
import TodoFilter from "../components/todo/TodoFilter.jsx";
import TodoInput from "../components/todo/TodoInput.jsx";
import TodoList from "../components/todo/TodoList.jsx";

const TodoPage = () => {
    return (
        <>
            <TodoFilter />
            <TodoInput />
            <TodoList />
        </>
    );
};

export default TodoPage;