import React, {useState} from 'react';
import styles from '../../styles/components/Filter.module.scss';

const TodoFilter = () => {
    const filters = ["진행 중", "미완료", "완료됨"];
    const [filter, setFilter] = useState("진행 중");

    return (
        <div className={`${styles.tabList}`}>
            {filters.map((f) => (
                <button
                    key={f}
                    className={`${styles.tab} ${
                        filter === f ? `${styles.on}` : " "
                    }`}
                    onClick={() => setFilter(f)}
                >
                    {f}
                    <span>
                    {/*  진행 중, 완료 중 , 미완료 리스트 개수 동적 추가  */}
                        10
                    </span>
                </button>
            ))}
        </div>
    );
};

export default TodoFilter;