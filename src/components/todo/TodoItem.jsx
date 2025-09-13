import React from 'react';
import styles from '../../styles/components/Item.module.scss';

const TodoItem = () => {
    return (
        <div className={`${styles.item}`}>
            <div>
                <input type={"checkbox"} id={`todo-${1}`}/>
                <label htmlFor={`todo-${1}`}>리액트 공부</label>
            </div>
            <div>
                <button>수정</button>
                <button>삭제</button>
            </div>
        </div>
    );
};

export default TodoItem;