import React from 'react';
import TodoItem from "./TodoItem.jsx";
import useTodoStore from "../../store/todoStore.js";

const TodoList = () => {
    const { todos } = useTodoStore();

    if (todos.length === 0) {
        return <div className="no-todos">할 일이 없습니다.</div>;
    }

    return (
        <div>
            {todos.map((todo) => (
                <TodoItem key={todo.todoId} todo={todo} />
            ))}
        </div>
    );
};

export default TodoList;