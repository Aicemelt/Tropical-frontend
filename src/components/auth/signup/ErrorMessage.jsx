// src/components/auth/signup/ErrorMessage.jsx
import React from 'react';
import styles from '../../../styles/components/ErrorMessage.module.scss';

/**
 * 에러 메시지 컴포넌트
 */
export default function ErrorMessage({message, type = 'error'}) {
    if (!message) return null;

    return (
        <div
            role="alert"
            className={`${styles.message} ${styles[type]}`}
        >
            <span className={styles.icon}>
                {type === 'error' && '⚠️'}
                {type === 'warning' && '⚠️'}
                {type === 'info' && 'ℹ️'}
                {type === 'success' && '✅'}
            </span>
            <span className={styles.text}>{message}</span>
        </div>
    );
}