/**
 * @fileoverview 공통 API 클라이언트 모듈
 * @description axios 기반의 HTTP 클라이언트 설정 및 공통 API 메서드 제공
 * @author 신동준
 * @since 2025-09-17
 * @version 2.0.0
 */

import axios from 'axios';

// API 기본 설정
const API_BASE_URL = 'http://localhost:9005/api/v1';

/**
 * @description 쿠키에서 인증 토큰 추출 함수
 * @param {string} name - 쿠키 이름
 * @returns {string|null} 토큰 값 또는 null
 */
const getCookieValue = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

/**
 * @description 인증 토큰 가져오기
 * @returns {string|null} JWT 토큰 또는 null
 */
const getAuthToken = () => {
  // 쿠키에서 JWT 토큰 추출 (백엔드에서 설정한 쿠키 이름에 따라 수정)
  return getCookieValue('authToken') ||
         getCookieValue('jwt') ||
         getCookieValue('accessToken') ||
         localStorage.getItem('authToken') ||
         sessionStorage.getItem('authToken');
};

/**
 * @description axios 인스턴스 생성 및 기본 설정
 * @author 신동준
 * @since 2025-09-17
 *
 * 설정 항목:
 * - baseURL: 백엔드 API 서버 기본 URL
 * - timeout: 요청 타임아웃 (10초)
 * - withCredentials: JWT 쿠키 전달을 위한 설정
 * - headers: 기본 헤더 설정 (Content-Type: application/json)
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // JWT 쿠키 전달을 위해 필요
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * @description 요청 인터셉터 설정
 * @author 신동준
 * @since 2025-09-17
 *
 * 기능:
 * - 인증 토큰 자동 추가
 * - 요청 전 로깅 (HTTP 메서드와 URL 출력)
 * - 요청 에러 처리
 */
apiClient.interceptors.request.use(
  (config) => {
    // 인증 토큰 자동 추가
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 요청 전 처리 (로딩 상태 등)
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * @description 응답 인터셉터 설정
 * @author 신동준
 * @since 2025-09-17
 *
 * 기능:
 * - 응답 성공 시 로깅
 * - HTTP 상태 코드별 에러 처리
 *   - 401: 인증 실패 (로그인 페이지 리다이렉트 준비)
 *   - 403: 권한 없음
 *   - 404: 리소스를 찾을 수 없음
 *   - 500: 서버 내부 오류
 * - 네트워크 에러 처리
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);

    // 에러 정보 구조화
    const errorInfo = {
      message: '알 수 없는 오류가 발생했습니다.',
      status: null,
      code: null,
      details: null
    };

    // 에러 처리
    if (error.response) {
      const { status, data } = error.response;
      errorInfo.status = status;
      errorInfo.message = data?.message || data?.error || `HTTP ${status} 오류`;
      errorInfo.details = data;

      switch (status) {
        case 401:
          // 인증 실패
          errorInfo.message = '로그인이 필요합니다. 다시 로그인해주세요.';
          console.error('인증 실패:', data?.message);
          // TODO: 로그인 페이지로 리다이렉트 로직 추가
          // window.location.href = '/login';
          break;
        case 403:
          // 권한 없음
          errorInfo.message = '접근 권한이 없습니다.';
          console.error('권한 없음:', data?.message);
          break;
        case 404:
          errorInfo.message = '요청한 리소스를 찾을 수 없습니다.';
          console.error('리소스를 찾을 수 없음:', data?.message);
          break;
        case 422:
          // 유효성 검사 실패
          errorInfo.message = '입력 데이터가 올바르지 않습니다.';
          console.error('유효성 검사 실패:', data?.message);
          break;
        case 500:
          errorInfo.message = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          console.error('서버 오류:', data?.message);
          break;
        default:
          console.error('API 오류:', data?.message || '알 수 없는 오류');
      }
    } else if (error.request) {
      // 네트워크 오류
      errorInfo.message = '네트워크 연결을 확인해주세요.';
      console.error('네트워크 오류: 서버에 연결할 수 없습니다.');
    } else {
      // 요청 설정 오류
      errorInfo.message = '요청 처리 중 오류가 발생했습니다.';
      console.error('요청 설정 오류:', error.message);
    }

    // 구조화된 에러 정보 추가
    error.apiError = errorInfo;
    return Promise.reject(error);
  }
);

/**
 * @description 기본 axios 인스턴스 내보내기
 * @author 신동준
 * @since 2025-09-17
 */
export default apiClient;

/**
 * @description 공통 API 메서드 객체
 * @author 신동준
 * @since 2025-09-17
 *
 * 제공 메서드:
 * - get: GET 요청
 * - post: POST 요청 (데이터 생성)
 * - put: PUT 요청 (데이터 전체 수정)
 * - patch: PATCH 요청 (데이터 부분 수정)
 * - delete: DELETE 요청 (데이터 삭제)
 *
 * @param {string} url - API 엔드포인트 URL
 * @param {Object} data - 요청 데이터 (POST, PUT, PATCH용)
 * @param {Object} config - 추가 axios 설정 옵션
 * @returns {Promise} axios 응답 Promise
 */
export const apiMethods = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

/**
 * @description 인증 토큰 관리 유틸리티
 */
export const authUtils = {
  getToken: getAuthToken,
  hasToken: () => !!getAuthToken(),
  removeToken: () => {
    // 모든 가능한 저장소에서 토큰 제거
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }
};
