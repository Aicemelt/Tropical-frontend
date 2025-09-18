import React from 'react';
import styles from '../../styles/components/Filter.module.scss';
import useTodoStore from "../../store/todoStore.js";

const TodoFilter = () => {
    const filters = ["진행 중", "미완료", "완료됨"];
    const { currentFilter, setCurrentFilter, getFilterCounts } = useTodoStore();
    const filterCounts = getFilterCounts();

    return (
        <div className={`${styles.tabList}`}>
            {filters.map((f) => (
                <button
                    key={f}
                    className={`${styles.tab} ${
                        currentFilter === f ? `${styles.on}` : " "
                    }`}
                    onClick={() => setCurrentFilter(f)}
                >
                    {f}
                    <span>
                        {filterCounts[f] || 0}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default TodoFilter;