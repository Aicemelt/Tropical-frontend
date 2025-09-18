/**
 * @fileoverview 인증 상태 전역 스토어 (Zustand)
 * @description 로그인/인증 관련 전역 상태를 관리합니다.
 *              /auth/status 결과를 반영하거나, 로그인/로그아웃 시 갱신됩니다.
 *              컴포넌트 어디서든 useAuthStore()로 접근할 수 있습니다.
 * @author 왕택준
 * @version 0.1
 * @since 2025-09-18
 */

import { create } from 'zustand';

/**
 * useAuthStore
 *
 * 전역 인증 상태를 보관/수정하는 Zustand 스토어입니다.
 *
 * 상태 구조:
 * - loading: boolean        - 인증 상태 확인 중 여부
 * - authenticated: boolean  - 로그인 여부
 * - user: Object|null       - 사용자 정보 (id, email 등)
 * - nextStep: string|null   - 추가 인증 단계 (예: "login", "email_verification", "onboarding")
 *
 * 메서드:
 * - setAuthState(partial)   - 상태를 부분 업데이트
 * - reset()                 - 인증 해제 후 초기 상태로 되돌림
 */
const useAuthStore = create((set) => ({
    loading: true,
    authenticated: false,
    user: null,
    nextStep: null,

    /**
     * 인증 상태를 부분적으로 업데이트
     * @param {Object} partial - 병합할 상태 조각
     */
    setAuthState: (partial) => set((s) => ({ ...s, ...partial })),

    /**
     * 인증 상태를 초기화 (로그아웃 시 사용)
     */
    reset: () => set({ loading: false, authenticated: false, user: null, nextStep: 'login' }),
}));

export default useAuthStore;
