import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/components/Item.module.scss';

const BucketItem = () => {
    const [expanded, setExpanded] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isFinish, setIsFinish] = useState(false);
    const [text, setText] = useState(
        "리액트 공부리액트 공부리액트 공부리액트 공부리액트 공부..."
    );

    const textareaRef = useRef();

    // 수정 모드 textarea 자동 높이
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [text, isEdit]);

    return (
        <div className={`${styles.item} ${isFinish ? styles.finish : ''}`}>
            <div className={styles.checkboxArea}>
                <input
                    type="checkbox"
                    id={`bucket-${1}`}
                    checked={isFinish}
                    onChange={(e) => setIsFinish(e.target.checked)}
                />
                <label htmlFor={`bucket-${1}`}></label>
            </div>

            <div className={`${styles.textArea} ${expanded ? styles.open : ''}`}>
                {!isEdit ? (
                    <span
                        className={styles.text}
                        onClick={() => setExpanded(!expanded)} // 클릭 시 토글
                    >
            {text}
          </span>
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ overflow: 'hidden', resize: 'none' }}
                    />
                )}
            </div>

            <div className={styles.btnArea}>
                <button
                    className={styles.editBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEdit(!isEdit);
                    }}
                ></button>
                <button className={styles.deleteBtn}></button>
            </div>
        </div>
    );
};

export default BucketItem;
