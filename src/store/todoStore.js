import { create } from 'zustand';

const useTodoStore = create((set) => ({
    todos: [],
    // 할 일 목록을 통째로 설정하는 함수
    setTodos: (todos) => set({ todos }),
    // 할 일 추가
    addTodo: (newTodo) => set((state) => ({ todos: [newTodo, ...state.todos] })),
    // 할 일 삭제
    removeTodo: (todoId) => set((state) => ({
        todos: state.todos.filter(todo => todo.todoId !== todoId)
    })),
    // 할 일 수정/업데이트
    updateTodo: (updatedTodo) => set((state) => ({
        todos: state.todos.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo
        )
    })),
}));

export default useTodoStore;