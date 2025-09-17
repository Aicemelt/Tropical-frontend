import axios from 'axios';

// API 기본 설정
const API_BASE_URL = 'http://localhost:9005/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // JWT 쿠키 전달을 위해 필요
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 요청 전 처리 (로딩 상태 등)
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);

    // 에러 처리
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // 인증 실패 - 로그인 페이지로 리다이렉트
          console.error('인증 실패:', data.message);
          // TODO: 로그인 페이지로 리다이렉트 로직 추가
          break;
        case 403:
          // 권한 없음
          console.error('권한 없음:', data.message);
          break;
        case 404:
          console.error('리소스를 찾을 수 없음:', data.message);
          break;
        case 500:
          console.error('서버 오류:', data.message);
          break;
        default:
          console.error('API 오류:', data.message || '알 수 없는 오류');
      }
    } else if (error.request) {
      // 네트워크 오류
      console.error('네트워크 오류: 서버에 연결할 수 없습니다.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// 공통 API 메서드들
export const apiMethods = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};
