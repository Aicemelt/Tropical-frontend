/**
 * @fileoverview 인증 가드 컴포넌트
 * @description 보호된 라우트를 감싸서 JWT 인증 여부를 확인합니다.
 *              /auth/status API를 통해 인증 상태를 조회하며,
 *              로그인/온보딩/이메일 인증 단계에 따라 다른 경로로 리다이렉트합니다.
 *              인증 완료 시에는 자식 컴포넌트를 그대로 렌더링합니다.
 * @author 왕택준
 * @version 0.1
 * @since 2025-09-18
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../../store/authStore.js';
import useAuthStatus from '../../../hooks/auth/useAuthStatus.js';

/**
 * 임시 로딩 컴포넌트
 * - 추후 module.scss 스타일 기반 Loading UI로 교체 예정
 */
const LoadingSpinner = ({ message = '로딩 중...' }) => (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', fontWeight: 600 }}>
        {message}
    </div>
);

/**
 * ProtectedRoute
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 보호할 실제 페이지/컴포넌트
 * @returns {JSX.Element} 인증 여부에 따라 리다이렉트 또는 children 반환
 *
 * 동작 개요:
 * 1. location.pathname 변화를 감지하여 useAuthStatus 훅으로 인증 상태 조회
 * 2. 로딩 중 → LoadingSpinner 표시
 * 3. 미인증 상태 → /login으로 이동
 * 4. 이메일 인증 필요(nextStep === 'email_verification') → /verify-required로 이동
 * 5. 온보딩 필요(nextStep === 'onboarding') → /onboarding으로 이동
 * 6. 모든 조건 충족 시 children을 그대로 렌더링
 */
function ProtectedRoute({ children }) {
    const location = useLocation();
    const { loading, authenticated, nextStep, user } = useAuthStore();

    // 경로 변경 시 인증 상태를 1회 조회
    useAuthStatus(location.pathname);

    // 1. 인증 확인 중 (로딩 상태)
    if (loading) return <LoadingSpinner message="인증 확인 중..." />;

    // 2. 인증 실패 → 로그인 페이지로 이동
    if (!authenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname, message: '로그인이 필요한 페이지입니다.' }}
                replace
            />
        );
    }

    // 3. 이메일 인증 필요 → 이메일 인증 대기 페이지로 이동
    if (nextStep === 'email_verification') {
        return (
            <Navigate
                to="/verify-required"
                state={{ email: user?.email, message: '이메일 인증을 완료해주세요.' }}
                replace
            />
        );
    }

    // 4. 온보딩 필요 → 온보딩 페이지로 이동
    if (nextStep === 'onboarding') {
        return (
            <Navigate
                to="/onboarding"
                state={{ message: '서비스 이용을 위해 약관 동의를 완료해주세요.' }}
                replace
            />
        );
    }

    // 5. 모든 인증 단계 완료 → 원래 children 컴포넌트 렌더링
    return children;
}

export default ProtectedRoute;
