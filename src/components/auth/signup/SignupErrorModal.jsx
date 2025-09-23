// src/components/auth/signup/SignupErrorModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../../styles/components/SignupErrorModal.module.scss';

export default function SignupErrorModal({ isOpen, errorType, email, onClose, onRetry }) {
    if (!isOpen) return null;

    const getModalContent = () => {
        switch (errorType) {
            case 'EMAIL_DUPLICATE':
                return {
                    title: '이미 가입된 이메일',
                    icon: '⚠️',
                    message: (
                        <div>
                            <p><strong>{email}</strong>은 이미 가입된 이메일입니다.</p>
                            <p>다른 이메일로 가입하시거나 로그인해주세요.</p>
                        </div>
                    ),
                    actions: (
                        <>
                            <button
                                className={styles.secondaryBtn}
                                onClick={onRetry}
                            >
                                다른 이메일로 재시도
                            </button>
                            <Link
                                to="/login"
                                className={styles.primaryBtn}
                                state={{ email }}
                            >
                                로그인하기
                            </Link>
                        </>
                    )
                };

            case 'NETWORK_ERROR':
                return {
                    title: '네트워크 오류',
                    icon: '🌐',
                    message: (
                        <div>
                            <p>네트워크 연결에 문제가 발생했습니다.</p>
                            <p>인터넷 연결을 확인하고 다시 시도해주세요.</p>
                        </div>
                    ),
                    actions: (
                        <>
                            <button
                                className={styles.secondaryBtn}
                                onClick={onClose}
                            >
                                취소
                            </button>
                            <button
                                className={styles.primaryBtn}
                                onClick={onRetry}
                            >
                                다시 시도
                            </button>
                        </>
                    )
                };

            case 'SERVER_ERROR':
            default:
                return {
                    title: '회원가입 실패',
                    icon: '❌',
                    message: (
                        <div>
                            <p>회원가입 처리 중 오류가 발생했습니다.</p>
                            <p>잠시 후 다시 시도해주세요.</p>
                        </div>
                    ),
                    actions: (
                        <>
                            <button
                                className={styles.secondaryBtn}
                                onClick={onClose}
                            >
                                취소
                            </button>
                            <button
                                className={styles.primaryBtn}
                                onClick={onRetry}
                            >
                                다시 시도
                            </button>
                        </>
                    )
                };
        }
    };

    const content = getModalContent();

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <span className={styles.icon}>{content.icon}</span>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="모달 닫기"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    <h2 className={styles.title}>{content.title}</h2>
                    <div className={styles.message}>
                        {content.message}
                    </div>
                </div>

                <div className={styles.actions}>
                    {content.actions}
                </div>
            </div>
        </div>
    );
}