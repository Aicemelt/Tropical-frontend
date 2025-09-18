import { create } from 'zustand';

const useTodoStore = create((set, get) => ({
    todos: [],
    currentFilter: "진행 중",

    // 현재 필터 설정
    setCurrentFilter: (filter) => set({ currentFilter: filter }),

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
            todo.todoId === updatedTodo.todoId ? updatedTodo : todo
        )
    })),

    // 할 일 완료 상태 변경
    completeTodo: (todoId, isCompleted) => set((state) => ({
        todos: state.todos.map(todo =>
            todo.todoId === todoId ? { ...todo, isCompleted } : todo
        )
    })),

    // 필터링된 할 일 목록 반환
    getFilteredTodos: () => {
        const { todos, currentFilter } = get();
        switch (currentFilter) {
            case "진행 중":
                return todos.filter(todo => !todo.isCompleted);
            case "완료됨":
                return todos.filter(todo => todo.isCompleted);
            case "미완료":
                return todos.filter(todo => !todo.isCompleted && todo.dueDate && new Date(todo.dueDate) < new Date());
            default:
                return todos;
        }
    },

    // 각 필터별 할 일 개수 반환
    getFilterCounts: () => {
        const { todos } = get();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return {
            "진행 중": todos.filter(todo => !todo.isCompleted).length,
            "완료됨": todos.filter(todo => todo.isCompleted).length,
            "미완료": todos.filter(todo =>
                !todo.isCompleted &&
                todo.dueDate &&
                new Date(todo.dueDate) < today
            ).length
        };
    }
}));

export default useTodoStore;