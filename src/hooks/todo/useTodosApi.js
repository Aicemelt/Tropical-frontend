import { useState } from 'react';
import useTodoStore from "../../store/todoStore.js";
import { axiosInstance } from "../../services/api.js";

const API_BASE_URL = "/api/v1/todos";

export const useTodosApi = () => {
    const {
        setTodos,
        addTodo: addTodoToStore,
        removeTodo: removeTodoFromStore,
        updateTodo: updateTodoInStore,
        completeTodo: completeTodoInStore
    } = useTodoStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // axios 기반 API 호출 함수
    const callApi = async (url, method, body = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const config = {
                method,
                url,
                data: body,
            };
            const response = await axiosInstance(config);
            return response.data;
        } catch (err) {
            console.error("API 호출 중 오류 발생:", err);
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createTodo = async (content, dueDate) => {
        const newTodo = await callApi(API_BASE_URL, 'POST', { content, dueDate });
        addTodoToStore(newTodo);
        return newTodo;
    };

    const getAllTodos = async () => {
        const data = await callApi(API_BASE_URL, 'get');
        if (data) setTodos(data);
    };

    const deleteTodo = async (todoId) => {
        await callApi(`${API_BASE_URL}/${todoId}`, 'delete');
        removeTodoFromStore(todoId);
    };

    const updateTodo = async (todoId, content, dueDate) => {
        const updatedTodo = await callApi(`${API_BASE_URL}/${todoId}`, 'PUT', {
            content,
            dueDate
        });
        updateTodoInStore(updatedTodo);
        return updatedTodo;
    };

    const completeTodo = async (todoId, isCompleted) => {
        try {
            const updatedTodo = await callApi(`${API_BASE_URL}/${todoId}/complete`, 'PUT', {
                isCompleted: isCompleted
            });
            completeTodoInStore(todoId, isCompleted);
            return updatedTodo;
        } catch (error) {
            console.error("완료 상태 변경 실패:", error);
            throw error;
        }
    };

    return {
        createTodo,
        getAllTodos,
        updateTodo,
        deleteTodo,
        completeTodo,
        isLoading,
        error
    };
};