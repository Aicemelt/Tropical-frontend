import { useState } from 'react';
import useTodoStore from "../../store/todoStore.js";

// 테스트용 JWT 토큰
const TEST_TOKEN ="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJwYWNrODQ0N0BnbWFpbC5jb20iLCJ0b2tlblR5cGUiOiJBQ0NFU1MiLCJpYXQiOjE3NTgyMDczNDMsImV4cCI6MTc1ODIxNjM0M30.zQ46KkVJsk0rTcqaM1UH29KRRMvDYlO4swgEQuJE_d0";
const API_BASE_URL = "http://localhost:9005/api/v1/todos";

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

    const callApi = async (url, method, body = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TEST_TOKEN}`
                }
            };
            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);

            if (response.status === 204) {
                return null; // No Content
            }

            if (!response.ok) {
                // HTTP 상태 코드가 401, 403, 404 등일 때
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API 호출 실패: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            console.error("API 호출 중 오류 발생:", err);
            setError(err.message);
            // 오류 발생 시 로딩 상태 해제
            setIsLoading(false);
            throw err;
        } finally {
            // 성공 여부와 관계없이 로딩 상태 해제 (중요)
            setIsLoading(false);
        }
    };

    const createTodo = async (content, dueDate) => {
        const newTodo = await callApi(API_BASE_URL, 'POST', { content, dueDate });
        addTodoToStore(newTodo);
        return newTodo;
    };

    const getAllTodos = async () => {
        const todos = await callApi(API_BASE_URL, 'GET');
        setTodos(todos);
        return todos;
    };

    const deleteTodo = async (todoId) => {
        await callApi(`${API_BASE_URL}/${todoId}`, 'DELETE');
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