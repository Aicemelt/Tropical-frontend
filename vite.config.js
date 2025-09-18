import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 설정 파일
 *
 * 개발 서버, 빌드 옵션, 플러그인 등을 설정합니다.
 *
 * @see {@link https://vite.dev/config/} Vite 공식 설정 문서
 *
 * @author 왕택준
 * @version 0.1.
 * @since 2025.09.14
 */
export default defineConfig({
  /**
   * Vite 플러그인 배열
   *
   * React 개발에 필요한 플러그인들을 설정합니다.
   *
   * @type {Plugin[]}
   */
  plugins: [
    react()  // React 플러그인: JSX 변환, Fast Refresh(HMR), TypeScript 지원
  ],

  /**
   * 개발 서버 설정
   *
   * 로컬 개발 환경에서 사용할 서버 옵션들을 설정합니다.
   *
   * @type {ServerOptions}
   */
  server: {
    /**
     * 개발 서버 포트 번호
     *
     * @type {number}
     * @default 5005
     */
    port: 5005,

    /**
     * 프록시 설정
     *
     * CORS 문제 해결을 위해 특정 경로의 요청을 백엔드로 프록시합니다.
     *
     * @type {Record<string, ProxyOptions>}
     */
    proxy: {
      /**
       * API 요청 프록시 설정
       *
       * '/api/'로 시작하는 모든 요청을 백엔드 서버로 전달합니다.
       *
       * @example
       * // 프론트엔드에서 요청: /api/users
       * // 실제 요청: http://localhost:9005/api/users
       *
       * @type {ProxyOptions}
       */
      '/api/v1': {
        /** @type {string} 백엔드 서버 주소 */
        target: 'http://localhost:9005',
        /** @type {boolean} origin 헤더를 target 주소로 변경 (CORS 해결) */
        changeOrigin: true,
        /** @type {boolean} HTTPS 검증 비활성화 (개발환경용) */
        secure: false,
      },

      /**
       * OAuth2 인증 요청 프록시 설정
       *
       * '/oauth2/'로 시작하는 소셜 로그인 요청을 백엔드로 전달합니다.
       *
       * @example
       * // 구글 로그인: /oauth2/authorization/google
       * // 실제 요청: http://localhost:9005/oauth2/authorization/google
       *
       * @type {ProxyOptions}
       */
      '/oauth2': {
        /** @type {string} 백엔드 OAuth2 엔드포인트 */
        target: 'http://localhost:9005',
        /** @type {boolean} 소셜 로그인 시 origin 변경 필수 */
        changeOrigin: true,
        /** @type {boolean} 개발환경에서 SSL 검증 비활성화 */
        secure: false,
      },

      /**
       * 데이터베이스 관리 콘솔 프록시 설정
       *
       * 개발환경에서 H2 Console 또는 기타 DB 관리 도구 접근용입니다.
       *
       * @deprecated MariaDB 사용 시 필요없음, H2 사용 시에만 활용
       * @type {ProxyOptions}
       */
      '/h2-console': {
        /** @type {string} 데이터베이스 콘솔 주소 */
        target: 'http://localhost:9005',
        /** @type {boolean} 콘솔 접근을 위한 origin 변경 */
        changeOrigin: true,
        /** @type {boolean} 개발환경용 설정 */
        secure: false,
      },
    },
  },
});

/**
 * 프록시 동작 원리 및 주의사항
 *
 * @description
 * Vite 프록시는 개발 서버에서만 동작하며, 다음과 같은 흐름으로 작동합니다:
 *
 * 1. 클라이언트(브라우저)에서 /api/users 요청
 * 2. Vite 개발 서버가 이를 감지
 * 3. http://localhost:9005/api/users로 요청 프록시
 * 4. 백엔드에서 응답 처리 후 결과 반환
 * 5. Vite가 응답을 클라이언트에게 전달
 *
 * @benefits
 * - CORS 정책 우회 (Same-Origin으로 인식)
 * - 개발환경과 프로덕션 환경의 API 호출 코드 일관성
 * - 백엔드 URL 변경 시 프록시 설정만 수정하면 됨
 *
 * @limitations
 * - 개발 서버(vite dev)에서만 동작
 * - 빌드된 정적 파일(vite build)에서는 프록시 미동작
 * - 프로덕션에서는 nginx, Apache 등으로 별도 프록시 구성 필요
 *
 * @see {@link https://vitejs.dev/config/server-options.html#server-proxy} Vite 프록시 문서
 */
