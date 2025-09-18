import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/components/Item.module.scss';
import inputStyles from '../../styles/components/Input.module.scss';
import { useBucketApi } from "../../hooks/bucket/useBucketApi.js";

const BucketItem = ({ bucket }) => {
    const [expanded, setExpanded] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [content, setContent] = useState(bucket.content);

    const textareaRef = useRef();
    const formRef = useRef();

    const { deleteBucket, toggleCompleteBucket, updateBucket, isLoading } = useBucketApi();

    // content 상태를 bucket.content와 동기화 (Todo 방식과 동일)
    useEffect(() => {
        setContent(bucket.content);
    }, [bucket.content]);

    useEffect(() => {
        if (isEditMode) {
            textareaRef.current.focus();
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditMode]);

    // 폼 외부 클릭 감지 핸들러
    const handleClickOutside = (e) => {
        if (formRef.current && !formRef.current.contains(e.target)) {
            handleEditClose();
        }
    };

    const handleCheckboxChange = async (e) => {
        const newIsFinish = e.target.checked;
        try {
            await toggleCompleteBucket(bucket.bucketId, newIsFinish);
        } catch (error) {
            alert("완료 상태 변경에 실패했습니다.");
        }
    };

    const handleDelete = async () => {
        if (confirm("정말로 이 버킷리스트를 삭제하시겠습니까?")) {
            try {
                await deleteBucket(bucket.bucketId);
            } catch (error) {
                alert("버킷리스트 삭제에 실패했습니다.");
            }
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditMode(true);
    };

    const handleEditClose = () => {
        setIsEditMode(false);
        setContent(bucket.content);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }

        if (content.trim() === bucket.content) {
            setIsEditMode(false);
            return;
        }

        try {
            await updateBucket(bucket.bucketId, content);
            setIsEditMode(false);
        } catch (err) {
            alert("버킷리스트 수정에 실패했습니다.");
        }
    };

    const handleTextareaInput = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    if (isEditMode) {
        return (
            <form className={`${inputStyles.inputForm}`} onSubmit={handleEditSubmit} ref={formRef}>
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onInput={handleTextareaInput}
                    disabled={isLoading}
                />
                <div className={`${inputStyles.btnContainer} ${inputStyles.flexEnd}`}>
                    <div className={inputStyles.btnArea}>
                        <button type="button" className={`${inputStyles.btn} ${inputStyles.btnCancel}`} onClick={handleEditClose}>취소</button>
                        <button type="submit" className={`${inputStyles.btn} ${inputStyles.btnSubmit}`} disabled={isLoading}>수정</button>
                    </div>
                </div>
            </form>
        );
    }

    return (
        <div className={`${styles.item} ${bucket.isCompleted ? styles.finish : ''}`}>
            <div className={styles.checkboxArea}>
                <input
                    type="checkbox"
                    id={`bucket-${bucket.bucketId}`}
                    checked={bucket.isCompleted}
                    onChange={handleCheckboxChange}
                />
                <label htmlFor={`bucket-${bucket.bucketId}`}></label>
            </div>

            <div className={`${styles.textArea} ${expanded ? styles.open : ''}`}>
                <span
                    className={styles.text}
                    onClick={() => setExpanded(!expanded)}
                >
                    {bucket.content}
                </span>
            </div>

            <div className={styles.btnArea}>
                <button
                    className={styles.editBtn}
                    onClick={handleEditClick}
                ></button>
                <button
                    className={styles.deleteBtn}
                    onClick={handleDelete}
                ></button>
            </div>
        </div>
    );
};

export default BucketItem;