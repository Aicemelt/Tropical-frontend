import React, { useRef, useState, useEffect } from 'react';
import styles from '../../styles/components/Input.module.scss';
import { useBucketApi } from '../../hooks/bucket/useBucketApi.js';

const BucketInput = () => {
    const scrollHeightRef = useRef();
    const formRef = useRef();
    const [content, setContent] = useState("");
    const [isInputOpen, setIsInputOpen] = useState(false);

    const { createBucket, isLoading } = useBucketApi();

    useEffect(() => {
        // 입력창이 열렸을 때만 이벤트 리스너 추가
        if (isInputOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isInputOpen]);

    // 폼 외부 클릭 감지 핸들러
    const handleClickOutside = (e) => {
        if (formRef.current && !formRef.current.contains(e.target)) {
            setIsInputOpen(false);
            setContent("");
        }
    };

    const handleInput = () => {
        if (scrollHeightRef.current) {
            scrollHeightRef.current.style.height = 'auto';
            scrollHeightRef.current.style.height = scrollHeightRef.current.scrollHeight + 'px';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }

        try {
            await createBucket(content);
            setContent("");
            if (scrollHeightRef.current) {
                scrollHeightRef.current.style.height = 'auto';
            }
            setIsInputOpen(false);
        } catch (err) {
            alert("버킷리스트 등록에 실패했습니다.");
        }
    };

    const handleCancel = () => {
        setIsInputOpen(false);
        setContent("");
    };

    return (
        <>
            {!isInputOpen ? (
                <button
                    className={`${styles.addBtn}`}
                    onClick={() => setIsInputOpen(true)}
                >
                    새 버킷리스트 추가하기
                </button>
            ) : (
                <form className={`${styles.inputForm}`} onSubmit={handleSubmit} ref={formRef}>
                    <textarea
                        ref={scrollHeightRef}
                        placeholder={"새 버킷리스트 추가하기"}
                        onInput={handleInput}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className={`${styles.btnContainer} ${styles.flexEnd}`}>
                        <div className={styles.btnArea}>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={handleCancel}
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className={`${styles.btn} ${styles.btnSubmit}`}
                                disabled={isLoading}
                            >
                                {isLoading ? "등록 중..." : "등록"}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
};

export default BucketInput;