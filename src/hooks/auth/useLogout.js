/**
 * @fileoverview 로그아웃 처리 커스텀 훅
 * @description 안전하고 완전한 로그아웃 기능을 제공합니다.
 * @author 왕택준
 * @version 0.1
 * @since 2025-09-22
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as apiLogout } from '../../services/api.js';
import useAuthStore from '../../store/authStore.js';

/**
 * 로그아웃 처리 커스텀 훅
 *
 * 기능:
 * - 백엔드 로그아웃 API 호출
 * - 쿠키 삭제 (서버에서 처리)
 * - Zustand 스토어 초기화
 * - 홈페이지로 리다이렉트
 * - 로딩 상태 관리
 *
 * @returns {Object} { logout: Function, loading: boolean }
 */
export function useLogout() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const resetAuthStore = useAuthStore(state => state.reset);

    /**
     * 로그아웃 실행 함수
     *
     * @param {Object} options - 로그아웃 옵션
     * @param {string} options.redirectTo - 리다이렉트할 경로 (기본: '/')
     * @param {boolean} options.showConfirm - 확인 대화상자 표시 여부 (기본: false)
     */
    const logout = async (options = {}) => {
        const {
            redirectTo = '/',
            showConfirm = false
        } = options;

        // 확인 대화상자가 활성화된 경우
        if (showConfirm) {
            const confirmed = window.confirm('정말 로그아웃하시겠습니까?');
            if (!confirmed) return;
        }

        setLoading(true);

        try {
            // 1. 백엔드 로그아웃 API 호출
            // - 서버에서 ACCESS_TOKEN, REFRESH_TOKEN 쿠키 삭제
            // - SecurityContext 클리어
            await apiLogout();

            console.info('로그아웃 API 호출 완료');

        } catch (error) {
            // API 호출 실패해도 클라이언트 측 정리는 진행
            console.error('로그아웃 API 호출 실패:', error);
        } finally {
            // 2. 클라이언트 상태 초기화 (API 성공/실패 무관)
            resetAuthStore();

            // 3. 페이지 이동
            navigate(redirectTo, { replace: true });

            setLoading(false);

            console.info('로그아웃 완료 - 리다이렉트:', redirectTo);
        }
    };

    return { logout, loading };
}

export default useLogout;