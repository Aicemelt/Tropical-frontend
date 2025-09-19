/**
 * @fileoverview 실서비스 최적화 쿠키 인증 API 클라이언트
 * @description 쿠키 리프레시 + UX 최적화 + 동시성 제어
 * @author 왕택준
 * @version 0.1
 * @since 2025.09.18
 */

import axios from 'axios';

// ================================
// 환경 설정
// ================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9005';
export { API_BASE_URL };

export const API_ENDPOINT = `${API_BASE_URL}/api/v1`;

/**
 * OAuth URL 빌더 (일관성 확보)
 *
 * @param {string} provider - 소셜 프로바이더 (google, kakao, naver)
 * @returns {string} OAuth 인증 URL
 */
export function getOAuthURL(provider) {
  const envKey = `VITE_${provider.toUpperCase()}_LOGIN_URL`;
  return import.meta.env[envKey] || `${API_BASE_URL}/oauth2/authorization/${provider}`;
}

/**
 * OAuth URL 객체 (하위 호환성)
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
 * @private
 */
let _navigate = null;

/**
 * React Router navigate 함수 주입
 *
 * @param {Function} navigateFn - React Router의 navigate 함수
 */
export function setNavigator(navigateFn) {
  _navigate = navigateFn;
}

/**
 * 안전한 페이지 네비게이션
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
 * axios 인스턴스 생성 및 기본 설정
 *
 * 환경별 baseURL:
 * - 개발환경: '/api/v1' (Vite 프록시 활용)
 * - 프로덕션: 'http://localhost:9005/api/v1' (직접 호출)
 *
 * @type {AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios 인스턴스 생성
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 자동 포함
});

// 요청 인터셉터: 쿠키에서 access token을 읽어 Authorization 헤더에 추가
axiosInstance.interceptors.request.use(
  (config) => {
    // access_token 쿠키에서 읽기
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
 * 재시도 플래그 헤더 키 (일관성 보장)
 * @private
 * @type {string}
 */
const RETRY_KEY = 'x-retried';

/**
 * 쿠키 리프레시 동시성 제어 변수
 * @private
 * @type {boolean}
 */
let isRefreshing = false;

/**
 * 리프레시 대기 중인 Promise resolver 목록
 * @private
 * @type {Function[]}
 */
let waiters = [];

/**
 * 쿠키 기반 토큰 리프레시 시도
 *
 * 쿠키 기반에서도 명시적 리프레시 요청:
 * - 백엔드에서 새 AccessToken을 쿠키로 설정
 * - 동시성 잠금으로 중복 요청 방지
 *
 * @returns {Promise<boolean>} 리프레시 성공 여부
 */
async function refreshCookieToken() {
  // 리팩토링 포인트: 이미 리프레시 중이면 대기열 추가
  if (isRefreshing) {
    return new Promise((resolve) => waiters.push(resolve));
  }

  isRefreshing = true;

  try {
    // 쿠키 기반 리프레시 API 호출 (백엔드 스펙에 맞게 경로 수정)
    await axios.post(`${API_ENDPOINT}/auth/token/refresh`, {}, { withCredentials: true });

    // 대기 중인 모든 요청에 성공 알림
    waiters.forEach((resolve) => resolve(true));
    return true;

  } catch (error) {
    console.warn('쿠키 리프레시 실패:', error);
    // 대기 중인 모든 요청에 실패 알림
    waiters.forEach((resolve) => resolve(false));
    return false;

  } finally {
    // 리팩토링 포인트: 반드시 잠금 해제 (메모리 누수 방지)
    waiters = [];
    isRefreshing = false;
  }
}

// ================================
// 인증 실패 처리 (UX 개선)
// ================================

/**
 * 인증 완전 실패 시 처리 (UX 최적화)
 *
 * UX 개선:
 * - /login 직행보다는 홈(/)으로 자연스럽게 이동
 * - 사용자가 스스로 로그인 버튼 클릭하도록 유도
 */
function handleAuthFailure() {
  // 리팩토링 포인트: 홈으로 이동이 더 자연스러운 UX
  safeNavigate('/');
}

/**
 * 로그아웃 API 호출
 *
 * @returns {Promise<void>}
 * @throws {Error} 로그아웃 API 호출 실패 시
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
// 요청 인터셉터 (재시도 플래그 관리)
// ================================

/**
 * 요청 인터셉터 설정
 *
 * 기능:
 * - 재시도 플래그 기본값 보장 (무한루프 방지)
 * - 개발환경 요청 로깅
 */
apiClient.interceptors.request.use(
    (config) => {
      // 리팩토링 포인트: 재시도 플래그 기본값 보장 (무한루프 방지)
      if (!config.headers[RETRY_KEY]) {
        config.headers[RETRY_KEY] = '0';
      }

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
// 응답 인터셉터 (쿠키 리프레시 + 재시도)
// ================================

/**
 * 응답 인터셉터 설정
 *
 * 기능:
 * - 401 에러 시 쿠키 리프레시 1회 시도
 * - HTTP 상태 코드별 에러 처리
 * - 네트워크 에러 처리
 * - 개발환경 응답 로깅
 */
apiClient.interceptors.response.use(
    (response) => {
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
              // 리팩토링 포인트: 재시도 플래그 설정으로 무한루프 방지
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
 * 기본 axios 인스턴스
 *
 * @type {AxiosInstance}
 */
export default apiClient;

/**
 * 공통 API 메서드 객체
 *
 * HTTP 메서드별 편의 함수를 제공합니다.
 * 모든 메서드는 쿠키 기반 인증을 자동으로 처리합니다.
 *
 * @type {Object}
 * @property {Function} get - GET 요청
 * @property {Function} post - POST 요청 (데이터 생성)
 * @property {Function} put - PUT 요청 (데이터 전체 수정)
 * @property {Function} patch - PATCH 요청 (데이터 부분 수정)
 * @property {Function} delete - DELETE 요청 (데이터 삭제)
 */
export const apiMethods = {
  /**
   * GET 요청 수행
   * @param {string} url - API 엔드포인트 URL
   * @param {Object} config - axios 설정 옵션
   * @returns {Promise} axios 응답 Promise
   */
  get: (url, config = {}) => apiClient.get(url, config),

  /**
   * POST 요청 수행 (데이터 생성)
   * @param {string} url - API 엔드포인트 URL
   * @param {Object} data - 요청 데이터
   * @param {Object} config - axios 설정 옵션
   * @returns {Promise} axios 응답 Promise
   */
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),

  /**
   * PUT 요청 수행 (데이터 전체 수정)
   * @param {string} url - API 엔드포인트 URL
   * @param {Object} data - 요청 데이터
   * @param {Object} config - axios 설정 옵션
   * @returns {Promise} axios 응답 Promise
   */
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),

  /**
   * PATCH 요청 수행 (데이터 부분 수정)
   * @param {string} url - API 엔드포인트 URL
   * @param {Object} data - 요청 데이터
   * @param {Object} config - axios 설정 옵션
   * @returns {Promise} axios 응답 Promise
   */
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),

  /**
   * DELETE 요청 수행 (데이터 삭제)
   * @param {string} url - API 엔드포인트 URL
   * @param {Object} config - axios 설정 옵션
   * @returns {Promise} axios 응답 Promise
   */
  delete: (url, config = {}) => apiClient.delete(url, config),
};