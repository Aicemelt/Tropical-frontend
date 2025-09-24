/**
 * @fileoverview 환경변수 기반 동적 URL 지원 API 클라이언트
 * @description 쿠키 리프레시 + UX 최적화 + 동시성 제어 + HttpOnly 보안 강화 + 동적 호스트 지원
 * @author 왕택준
 * @version 0.1
 * @since 2025.09.24
 */

import axios from 'axios';

// ================================
// 환경변수 기반 동적 URL 생성
// ================================

/**
 * 환경변수 기반 백엔드 URL 동적 생성
 *
 * <p>
 * 설정 우선순위에 따라 백엔드 URL을 결정합니다:
 * 1순위: 운영환경 고정 도메인 (VITE_BACKEND_DOMAIN)
 * 2순위: 동적 호스트 (현재 브라우저 호스트 + 백엔드 포트)
 * 3순위: localhost 폴백
 * </p>
 *
 * <p>동적 URL 생성 예시:</p>
 * <ul>
 *   <li>localhost:5005 접속 → http://localhost:9005</li>
 *   <li>IPv4 주소:5005 접속 → http://IPv4 주소:9005</li>
 *   <li>VITE_BACKEND_DOMAIN 설정 시 → 설정된 도메인 사용</li>
 * </ul>
 *
 * @returns {string} 동적으로 생성된 백엔드 베이스 URL
 */
export function getBackendBaseUrl() {
    // 1순위: 운영환경에서 고정 도메인이 설정된 경우 우선 적용
    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    if (backendDomain && backendDomain.trim()) {
        return backendDomain;
    }

    // 2순위: 개발환경에서 동적 호스트 사용
    const useDynamicHost = import.meta.env.VITE_USE_DYNAMIC_HOST === 'true';
    if (useDynamicHost) {
        const currentHost = window.location.hostname;
        const backendPort = import.meta.env.VITE_BACKEND_PORT || '9005';
        const protocol = window.location.protocol; // http: or https:
        return `${protocol}//${currentHost}:${backendPort}`;
    }

    // 3순위: 폴백 - localhost 고정 사용
    const backendPort = import.meta.env.VITE_BACKEND_PORT || '9005';
    return `http://localhost:${backendPort}`;
}

/**
 * 환경변수 기반 프론트엔드 URL 생성 (필요 시 사용)
 *
 * <p>프론트엔드 자체 URL 생성이 필요한 경우 사용하는 헬퍼 함수</p>
 *
 * @returns {string} 동적으로 생성된 프론트엔드 베이스 URL
 */
export function getFrontendBaseUrl() {
    const frontendDomain = import.meta.env.VITE_FRONTEND_DOMAIN;
    if (frontendDomain && frontendDomain.trim()) {
        return frontendDomain;
    }

    const useDynamicHost = import.meta.env.VITE_USE_DYNAMIC_HOST === 'true';
    if (useDynamicHost) {
        const currentHost = window.location.hostname;
        const frontendPort = import.meta.env.VITE_FRONTEND_PORT || '5005';
        const protocol = window.location.protocol;
        return `${protocol}//${currentHost}:${frontendPort}`;
    }

    const frontendPort = import.meta.env.VITE_FRONTEND_PORT || '5005';
    return `http://localhost:${frontendPort}`;
}

// ================================
// 동적 URL 기반 상수들
// ================================

/**
 * 동적으로 생성된 백엔드 API 베이스 URL
 *
 * <p>환경변수 설정에 따라 localhost 또는 IP 주소로 자동 결정됩니다</p>
 */
export const API_BASE_URL = getBackendBaseUrl();

/**
 * API 엔드포인트 URL (v1 버전)
 *
 * <p>모든 REST API 요청의 기본 경로입니다</p>
 */
export const API_ENDPOINT = `${API_BASE_URL}/api/v1`;

/**
 * OAuth URL 동적 생성 함수
 *
 * <p>
 * 소셜 로그인 URL을 동적으로 생성합니다.
 * 현재 접속 호스트에 맞춰 백엔드 OAuth 엔드포인트를 결정합니다.
 * </p>
 *
 * @param {string} provider - 소셜 프로바이더 (google, kakao, naver)
 * @returns {string} 동적으로 생성된 OAuth 인증 URL
 */
export function getOAuthURL(provider) {
    return `${API_BASE_URL}/oauth2/authorization/${provider}`;
}

/**
 * OAuth URL 객체 (하위 호환성 및 편의성)
 *
 * <p>동적으로 생성된 소셜 로그인 URL들을 담은 객체</p>
 *
 * @type {Object}
 * @property {string} google - 구글 OAuth URL
 * @property {string} kakao - 카카오 OAuth URL
 * @property {string} naver - 네이버 OAuth URL
 */
export const OAUTH_URLS = {
    google: getOAuthURL('google'),
    kakao: getOAuthURL('kakao'),
    naver: getOAuthURL('naver'),
};

/**
 * OAuth 인증 시작 URL 생성 (redirect_uri 포함)
 *
 * <p>
 * 소셜 로그인 시 인증 완료 후 돌아올 경로를 포함한 URL을 생성합니다.
 * 현재 브라우저의 origin을 기준으로 callback URL을 동적 생성합니다.
 * </p>
 *
 * @param {string} provider - 소셜 프로바이더 (google, kakao, naver)
 * @param {string} callbackPath - 인증 성공 후 돌아올 경로
 * @returns {string} redirect_uri가 포함된 OAuth 시작 URL
 */
export function getOAuthStartUrl(provider, callbackPath = '/onboarding') {
    const baseUrl = getOAuthURL(provider);
    const separator = baseUrl.includes('?') ? '&' : '?';
    const redirectUri = `${location.origin}${callbackPath}`;
    return `${baseUrl}${separator}redirect_uri=${encodeURIComponent(redirectUri)}`;
}

// ================================
// SPA 네비게이션 관리
// ================================

/**
 * SPA 네비게이션 함수 저장소
 *
 * <p>React Router의 navigate 함수를 저장하여 안전한 페이지 이동을 지원합니다</p>
 *
 * @private
 */
let _navigate = null;

/**
 * React Router navigate 함수 주입
 *
 * <p>
 * 앱 초기화 시 React Router의 navigate 함수를 등록하여
 * API 클라이언트에서 안전한 페이지 이동이 가능하도록 합니다.
 * </p>
 *
 * @param {Function} navigateFn - React Router의 navigate 함수
 */
export function setNavigator(navigateFn) {
    _navigate = navigateFn;
}

/**
 * 안전한 페이지 네비게이션
 *
 * <p>
 * React Router의 navigate 함수가 등록되어 있으면 SPA 방식으로,
 * 그렇지 않으면 브라우저 네이티브 방식으로 페이지를 이동합니다.
 * </p>
 *
 * @param {string} path - 이동할 경로
 * @private
 */
function safeNavigate(path) {
    if (_navigate) {
        _navigate(path);
    } else {
        window.location.assign(path);
    }
}

// ================================
// axios 인스턴스 설정
// ================================

/**
 * 메인 axios 인스턴스 (동적 URL 기반)
 *
 * <p>
 * 환경변수 기반으로 동적 생성된 API_ENDPOINT를 사용합니다.
 * 모든 API 요청에 쿠키 인증과 토큰 리프레시 기능이 적용됩니다.
 * </p>
 *
 * @type {AxiosInstance}
 */
const apiClient = axios.create({
    baseURL: API_ENDPOINT,
    timeout: 10000,
    withCredentials: true, // HttpOnly 쿠키 자동 전송
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 추가 axios 인스턴스 (하위 호환성)
 *
 * <p>기존 코드와의 호환성을 위해 유지되는 인스턴스입니다</p>
 *
 * @type {AxiosInstance}
 */
export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 쿠키 자동 포함
});

/**
 * 추가 axios 인스턴스 요청 인터셉터
 *
 * <p>
 * 쿠키에서 access token을 읽어 Authorization 헤더에 추가합니다.
 * HttpOnly가 아닌 일반 쿠키에서 토큰을 읽는 방식입니다.
 * </p>
 */
axiosInstance.interceptors.request.use(
    (config) => {
        // access_token 쿠키에서 읽기 (HttpOnly가 아닌 경우만 가능)
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };
        const token = getCookie('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ================================
// 쿠키 리프레시 동시성 제어
// ================================

/**
 * 재시도 플래그 헤더 키
 *
 * <p>무한 루프 방지를 위한 헤더 키 (일관성 보장)</p>
 *
 * @private
 * @type {string}
 */
const RETRY_KEY = 'x-retried';

/**
 * 쿠키 리프레시 동시성 제어 변수
 *
 * <p>동시에 여러 요청에서 토큰 리프레시가 발생하는 것을 방지합니다</p>
 *
 * @private
 * @type {boolean}
 */
let isRefreshing = false;

/**
 * 리프레시 대기 중인 Promise resolver 목록
 *
 * <p>리프레시 진행 중 대기하는 다른 요청들의 resolver 함수들</p>
 *
 * @private
 * @type {Function[]}
 */
let waiters = [];

/**
 * HttpOnly 쿠키 기반 토큰 리프레시 시도
 *
 * <p>
 * 보안 강화된 토큰 리프레시 방식입니다. HttpOnly 쿠키를 사용하여
 * JavaScript에서 직접 토큰에 접근할 수 없도록 하며, 서버에서 자동으로
 * REFRESH_TOKEN 쿠키를 읽어 처리합니다.
 * </p>
 *
 * <p>보안 개선사항:</p>
 * <ul>
 *   <li>HttpOnly 쿠키로 JavaScript 접근 차단</li>
 *   <li>XSS 공격으로부터 REFRESH_TOKEN 보호</li>
 *   <li>서버에서 쿠키 자동 처리로 코드 단순화</li>
 *   <li>동시성 잠금으로 중복 요청 방지</li>
 * </ul>
 *
 * @returns {Promise<boolean>} 리프레시 성공 여부
 */
async function refreshCookieToken() {
    // 이미 리프레시 중이면 대기열에 추가
    if (isRefreshing) {
        return new Promise((resolve) => waiters.push(resolve));
    }

    isRefreshing = true;

    try {
        // HttpOnly 쿠키 기반 리프레시 - 서버에서 REFRESH_TOKEN 쿠키를 직접 읽어 처리
        // withCredentials: true로 HttpOnly 쿠키가 자동 전송됨
        await axios.post(`${API_ENDPOINT}/auth/token/refresh`, {}, {
            withCredentials: true
        });

        // 대기 중인 모든 요청에 성공 알림
        waiters.forEach((resolve) => resolve(true));
        return true;

    } catch (error) {
        console.warn('쿠키 리프레시 실패:', error);
        // 대기 중인 모든 요청에 실패 알림
        waiters.forEach((resolve) => resolve(false));
        return false;

    } finally {
        // 반드시 잠금 해제 (메모리 누수 방지)
        waiters = [];
        isRefreshing = false;
    }
}

// ================================
// 인증 실패 처리
// ================================

/**
 * 인증 완전 실패 시 처리
 *
 * <p>
 * 토큰 리프레시도 실패한 경우 사용자를 홈페이지로 이동시킵니다.
 * /login으로 직접 이동하는 것보다 자연스러운 UX를 제공합니다.
 * </p>
 */
function handleAuthFailure() {
    // 홈으로 이동이 더 자연스러운 UX
    safeNavigate('/');
}

/**
 * 로그아웃 API 호출
 *
 * <p>
 * 서버에 로그아웃 요청을 보내고 최종적으로 홈페이지로 이동합니다.
 * API 호출 실패 시에도 안전하게 홈으로 이동합니다.
 * </p>
 *
 * @returns {Promise<void>}
 * @throws {Error} 로그아웃 API 호출 실패 시 (에러는 처리됨)
 */
export async function logout() {
    try {
        await apiClient.post('/auth/logout');
    } catch (error) {
        console.error('로그아웃 API 호출 실패:', error);
    } finally {
        safeNavigate('/');
    }
}

// ================================
// 요청 인터셉터
// ================================

/**
 * 메인 API 클라이언트 요청 인터셉터
 *
 * <p>
 * 모든 API 요청에 대해 재시도 플래그를 설정하고
 * 개발환경에서 요청 로깅을 수행합니다.
 * </p>
 *
 * <p>기능:</p>
 * <ul>
 *   <li>재시도 플래그 기본값 보장 (무한루프 방지)</li>
 *   <li>개발환경 요청 로깅</li>
 * </ul>
 */
apiClient.interceptors.request.use(
    (config) => {
        // 재시도 플래그 기본값 보장 (무한루프 방지)
        if (!config.headers[RETRY_KEY]) {
            config.headers[RETRY_KEY] = '0';
        }

        // 개발환경에서 요청 로깅
        if (import.meta.env.VITE_APP_DEBUG === 'true') {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// ================================
// 응답 인터셉터
// ================================

/**
 * 메인 API 클라이언트 응답 인터셉터
 *
 * <p>
 * HTTP 응답을 처리하고 401 에러 시 자동으로 토큰을 리프레시합니다.
 * 각종 HTTP 상태 코드별로 적절한 에러 처리를 수행합니다.
 * </p>
 *
 * <p>기능:</p>
 * <ul>
 *   <li>401 에러 시 쿠키 리프레시 1회 시도</li>
 *   <li>HTTP 상태 코드별 에러 처리</li>
 *   <li>네트워크 에러 처리</li>
 *   <li>개발환경 응답 로깅</li>
 * </ul>
 */
apiClient.interceptors.response.use(
    (response) => {
        // 개발환경에서 응답 로깅
        if (import.meta.env.VITE_APP_DEBUG === 'true') {
            console.log(`[API Response] ${response.status} ${response.config.url}`);
        }
        return response;
    },
    async (error) => {
        const { response, request, config } = error;

        if (response) {
            const { status, data } = response;
            const message = data?.message || '알 수 없는 오류';

            // 401 Unauthorized: 쿠키 리프레시 1회 시도
            if (status === 401) {
                const hasRetried = config.headers[RETRY_KEY] === '1';

                if (!hasRetried) {
                    console.info('AccessToken 만료 - 쿠키 리프레시 시도');

                    const refreshSuccess = await refreshCookieToken();

                    if (refreshSuccess) {
                        // 재시도 플래그 설정으로 무한루프 방지
                        config.headers[RETRY_KEY] = '1';

                        try {
                            return await apiClient.request(config);
                        } catch (retryError) {
                            console.error('리프레시 후 재시도 실패:', retryError);
                        }
                    }
                }

                // 리프레시 실패 또는 재시도 실패 시 인증 실패 처리
                console.warn('인증 완전 실패 - 홈으로 이동');
                handleAuthFailure();
                return Promise.reject(error);
            }

            // 403 Forbidden
            if (status === 403) {
                console.warn('권한 부족:', message);
            }

            // 개발환경 상세 에러 로깅
            if (import.meta.env.VITE_APP_DEBUG === 'true') {
                if (status === 404) {
                    console.error('404 Not Found:', response.config.url);
                } else if (status === 422) {
                    console.error('422 Validation Error:', message);
                } else if (status === 429) {
                    console.error('429 Rate Limited');
                } else if (status >= 500) {
                    console.error(`Server Error [${status}]:`, message);
                }
            }

            return Promise.reject(error);
        }

        // 네트워크 에러
        if (request) {
            console.error('네트워크 오류: 서버 연결 실패 (오프라인 또는 CORS/프록시 확인)');
        }

        return Promise.reject(error);
    }
);

// ================================
// 내보내기
// ================================

/**
 * 기본 axios 인스턴스 (동적 URL 지원)
 *
 * <p>
 * 환경변수 기반으로 동적 생성된 baseURL을 사용하는 메인 API 클라이언트입니다.
 * 쿠키 기반 인증과 자동 토큰 리프레시 기능이 내장되어 있습니다.
 * </p>
 *
 * @type {AxiosInstance}
 */
export default apiClient;

/**
 * 공통 API 메서드 객체
 *
 * <p>
 * HTTP 메서드별 편의 함수를 제공합니다.
 * 모든 메서드는 쿠키 기반 인증을 자동으로 처리하며,
 * 동적 URL 생성과 토큰 리프레시 기능이 적용됩니다.
 * </p>
 *
 * @type {Object}
 * @property {Function} get - GET 요청 (데이터 조회)
 * @property {Function} post - POST 요청 (데이터 생성)
 * @property {Function} put - PUT 요청 (데이터 전체 수정)
 * @property {Function} patch - PATCH 요청 (데이터 부분 수정)
 * @property {Function} delete - DELETE 요청 (데이터 삭제)
 */
export const apiMethods = {
    /**
     * GET 요청 수행
     *
     * @param {string} url - API 엔드포인트 URL
     * @param {Object} config - axios 설정 옵션
     * @returns {Promise} axios 응답 Promise
     */
    get: (url, config = {}) => apiClient.get(url, config),

    /**
     * POST 요청 수행 (데이터 생성)
     *
     * @param {string} url - API 엔드포인트 URL
     * @param {Object} data - 요청 데이터
     * @param {Object} config - axios 설정 옵션
     * @returns {Promise} axios 응답 Promise
     */
    post: (url, data = {}, config = {}) => apiClient.post(url, data, config),

    /**
     * PUT 요청 수행 (데이터 전체 수정)
     *
     * @param {string} url - API 엔드포인트 URL
     * @param {Object} data - 요청 데이터
     * @param {Object} config - axios 설정 옵션
     * @returns {Promise} axios 응답 Promise
     */
    put: (url, data = {}, config = {}) => apiClient.put(url, data, config),

    /**
     * PATCH 요청 수행 (데이터 부분 수정)
     *
     * @param {string} url - API 엔드포인트 URL
     * @param {Object} data - 요청 데이터
     * @param {Object} config - axios 설정 옵션
     * @returns {Promise} axios 응답 Promise
     */
    patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),

    /**
     * DELETE 요청 수행 (데이터 삭제)
     *
     * @param {string} url - API 엔드포인트 URL
     * @param {Object} config - axios 설정 옵션
     * @returns {Promise} axios 응답 Promise
     */
    delete: (url, config = {}) => apiClient.delete(url, config),
};