/**
 * @fileoverview 로그아웃 버튼 컴포넌트
 * @description 헤더나 사이드바에서 사용할 수 있는 로그아웃 버튼입니다.
 * @author 왕택준
 * @version 0.1
 * @since 2025-09-22
 */

import React from 'react';
import useLogout from '../../../hooks/auth/useLogout.js';
import styles from '../../styles/components/LogoutButton.module.scss';

/**
 * 로그아웃 버튼 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.variant - 버튼 스타일 ('primary', 'secondary', 'text', 'icon')
 * @param {string} props.size - 버튼 크기 ('small', 'medium', 'large')
 * @param {boolean} props.showConfirm - 확인 대화상자 표시 여부 (기본: true)
 * @param {string} props.redirectTo - 로그아웃 후 이동할 경로 (기본: '/')
 * @param {string} props.className - 추가 CSS 클래스
 * @param {React.ReactNode} props.children - 버튼 내용 (기본: '로그아웃')
 */
function LogoutButton({
                          variant = 'secondary',
                          size = 'medium',
                          showConfirm = true,
                          redirectTo = '/',
                          className = '',
                          children,
                          ...props
                      }) {
    const { logout, loading } = useLogout();

    const handleLogout = () => {
        logout({
            showConfirm,
            redirectTo
        });
    };

    const buttonClasses = [
        styles.logoutButton,
        styles[variant],
        styles[size],
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type="button"
            className={buttonClasses}
            onClick={handleLogout}
            disabled={loading}
            aria-label="로그아웃"
            {...props}
        >
            {loading ? (
                <>
                    <span className={styles.spinner}>⟳</span>
                    로그아웃 중...
                </>
            ) : (
                children || '로그아웃'
            )}
        </button>
    );
}

export default LogoutButton;