/**
 * @fileoverview 인증 상태 확인 커스텀 훅 (무한 루프 수정 버전)
 * @description /auth/status API를 호출하여 현재 로그인/인증 상태를 확인하고,
 *              Zustand 스토어(authStore)에 상태를 반영합니다.
 *              무한 API 호출 문제를 해결했습니다.
 * @author 왕택준
 * @version 0.2
 * @since 2025.09.18
 */

import {useCallback, useEffect, useRef} from 'react';
import useAuthStore from '../../store/authStore.js';
import {apiMethods} from '../../services/api.js';

/**
 * useAuthStatus 훅 (수정된 버전)
 *
 * @param {string} watchKey - 인증 상태 재조회 트리거 키 (예: location.pathname)
 * @returns {void}
 *
 * 동작 개요:
 * - /auth/status 엔드포인트 호출
 * - 성공 시: { authenticated:true, user, nextStep } 상태 저장
 * - 실패 시: { authenticated:false, nextStep:'login' } 상태 저장
 * - 언마운트 또는 중복 호출 시 setState 방지
 *
 * 수정사항:
 * - setAuthState 의존성 제거로 무한 루프 방지
 * - useCallback으로 fetchStatus 함수 최적화
 * - 중복 호출 방지 로직 강화
 */
export default function useAuthStatus(watchKey) {
    const setAuthState = useAuthStore(state => state.setAuthState);
    const inFlight = useRef(false);   // 동시에 여러 요청 방지
    const unmounted = useRef(false);  // 언마운트 후 상태 업데이트 방지
    const lastWatchKey = useRef(null); // 이전 watchKey 저장

    /**
     * /auth/status API 호출 함수 (useCallback으로 최적화)
     */
    const fetchStatus = useCallback(async () => {
        // 중복 호출 방지
        if (inFlight.current) {
            console.log('[useAuthStatus] 이미 진행 중인 요청이 있습니다.');
            return;
        }

        // watchKey가 변경되지 않았으면 호출하지 않음
        if (lastWatchKey.current === watchKey) {
            console.log('[useAuthStatus] watchKey 변경 없음, 호출 스킵:', watchKey);
            return;
        }

        console.log('[useAuthStatus] API 호출 시작:', watchKey);
        inFlight.current = true;
        lastWatchKey.current = watchKey;

        const controller = new AbortController();

        try {
            const res = await apiMethods.get('/auth/status', {signal: controller.signal});
            const ok = !!(res?.data?.success && res?.data?.authenticated);

            if (!unmounted.current) {
                if (ok) {
                    console.log('[useAuthStatus] 인증 성공:', res.data);
                    setAuthState({
                        loading: false,
                        authenticated: true,
                        user: res.data.user ?? null,
                        nextStep: res.data.nextStep ?? null,
                    });
                } else {
                    console.log('[useAuthStatus] 인증 실패, 로그인 필요');
                    setAuthState({
                        loading: false,
                        authenticated: false,
                        user: null,
                        nextStep: 'login',
                    });
                }
            }
        } catch (error) {
            if (controller.signal.aborted) {
                console.log('[useAuthStatus] 요청이 취소됨');
                return;
            }

            console.warn('[useAuthStatus] API 호출 실패:', error);
            if (!unmounted.current) {
                setAuthState({
                    loading: false,
                    authenticated: false,
                    user: null,
                    nextStep: 'login',
                });
            }
        } finally {
            inFlight.current = false;
            console.log('[useAuthStatus] API 호출 완료');
        }
    }, [watchKey, setAuthState]);

    useEffect(() => {
        unmounted.current = false;

        // 초기 로딩 상태 설정
        if (!inFlight.current) {
            setAuthState({loading: true});
        }

        fetchStatus();

        // 언마운트 시 cleanup
        return () => {
            console.log('[useAuthStatus] cleanup 실행');
            unmounted.current = true;
            inFlight.current = false;
        };
    }, [fetchStatus]); // fetchStatus만 의존성으로 사용

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            lastWatchKey.current = null;
        };
    }, []);
}