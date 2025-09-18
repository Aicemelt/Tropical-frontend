/**
 * @fileoverview 인증 상태 확인 커스텀 훅
 * @description /auth/status API를 호출하여 현재 로그인/인증 상태를 확인하고,
 *              Zustand 스토어(authStore)에 상태를 반영합니다.
 *              경로(watchKey)가 바뀔 때마다 재조회하며,
 *              언마운트 및 중복 호출을 안전하게 처리합니다.
 * @author 왕택준
 * @version 0.1
 * @since 2025-09-18
 */

import { useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore.js';
import { apiMethods } from '../../services/api.js';

/**
 * useAuthStatus 훅
 *
 * @param {string} watchKey - 인증 상태 재조회 트리거 키 (예: location.pathname)
 * @returns {void}
 *
 * 동작 개요:
 * - /auth/status 엔드포인트 호출
 * - 성공 시: { authenticated:true, user, nextStep } 상태 저장
 * - 실패 시: { authenticated:false, nextStep:'login' } 상태 저장
 * - 언마운트 또는 중복 호출 시 setState 방지
 */
export default function useAuthStatus(watchKey) {
    const { setAuthState } = useAuthStore();
    const inFlight = useRef(false);   // 동시에 여러 요청 방지
    const unmounted = useRef(false);  // 언마운트 후 상태 업데이트 방지

    useEffect(() => {
        unmounted.current = false;
        const controller = new AbortController(); // 요청 취소 제어기

        /**
         * /auth/status API 호출 함수
         *
         * 인증 상태를 서버에 확인하고 Zustand 스토어에 반영합니다.
         * - inFlight로 중복 호출 차단
         * - AbortController로 컴포넌트 언마운트 시 요청 취소
         */
        const fetchStatus = async () => {
            if (inFlight.current) return;  // 중복 호출 방지
            inFlight.current = true;

            try {
                const res = await apiMethods.get('/auth/status', { signal: controller.signal });
                const ok = !!(res?.data?.success && res?.data?.authenticated);

                if (!unmounted.current) {
                    if (ok) {
                        // 인증 성공
                        setAuthState({
                            loading: false,
                            authenticated: true,
                            user: res.data.user ?? null,
                            nextStep: res.data.nextStep ?? null,
                        });
                    } else {
                        // 인증 실패 (로그인 필요)
                        setAuthState({
                            loading: false,
                            authenticated: false,
                            user: null,
                            nextStep: 'login',
                        });
                    }
                }
            } catch (_) {
                if (controller.signal.aborted) return; // 요청이 취소된 경우 무시
                if (!unmounted.current) {
                    // 기타 오류 → 로그인 필요 상태로 전환
                    setAuthState({
                        loading: false,
                        authenticated: false,
                        user: null,
                        nextStep: 'login',
                    });
                }
            } finally {
                inFlight.current = false; // 요청 종료
            }
        };

        fetchStatus();

        // 언마운트 시 cleanup
        return () => {
            unmounted.current = true;
            controller.abort();
        };
    }, [watchKey, setAuthState]);
}
