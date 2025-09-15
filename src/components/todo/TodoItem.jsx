import React, {useEffect, useRef, useState} from 'react';
import styles from '../../styles/components/Item.module.scss';

const TodoItem = () => {
    const [expanded, setExpanded] = useState(false);
    const [isOverflow, setIsOverflow] = useState(false);
    const [isEdit, setIsEdit] = useState(false)
    const textRef = useRef();

    useEffect(() => {
        if (textRef.current) {
            // 실제 라벨 높이가 두 줄 이상인지 계산
            const lineHeight = parseInt(
                window.getComputedStyle(textRef.current).lineHeight || "20",
                10
            );
            const maxHeight = lineHeight * 2;
            setIsOverflow(textRef.current.scrollHeight > maxHeight);
        }
    }, textRef.current);

    return (
        <>
            {/* 디폴트 투두 */}
            <div className={`${styles.item} ${expanded ? styles.open : ""}`}>
                <div>
                    <input type={"checkbox"} id={`todo-${1}`}/>
                    <label htmlFor={`todo-${1}`}></label>
                    {
                        !isEdit ?
                            <span className={styles.text} ref={textRef}
                                  onClick={() => isOverflow && setExpanded(!expanded)}
                            >
                        리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부
                        리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부
                    </span>
                            :
                            <input type={"text"} />
                    }
                </div>
                <div className={styles.btnArea}>
                    <button className={styles.editBtn} onClick={(e) => {
                        e.stopPropagation();
                        setIsEdit(!isEdit);
                    }}></button>
                    <button className={styles.deleteBtn}></button>
                </div>
            </div>

                {/* 체크 했을 때*/}
                <div className={`${styles.item} ${styles.finish}`}>
                    <div>
                        <input type={"checkbox"} id={`todo-${1}`} checked/>
                        <label htmlFor={`todo-${1}`}></label>
                    <span className={styles.text} ref={textRef}
                          onClick={() => isOverflow && setExpanded(!expanded)}
                    >
                        리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부
                        리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부
                    </span>
                </div>
                <div className={styles.btnArea}>
                    <button className={styles.editBtn} onClick={(e) => {
                        e.stopPropagation();
                    }}></button>
                    <button className={styles.deleteBtn} onClick={(e) => {
                        e.stopPropagation();
                    }}></button>
                </div>
            </div>
        </>
    );
};

export default TodoItem;