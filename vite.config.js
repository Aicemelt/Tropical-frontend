/* eslint-env node */
import process from 'node:process';
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "@svgr/rollup";

/**
 * Vite 설정 파일
 *
 * 목표
 * - 같은 네트워크 내에서 "백엔드가 어떤 PC(IP)에서 떠도" 프론트(개발서버)가 자동으로 해당 IP:포트로 프록시되도록 함
 * - .env의 VITE_* 값을 사용하여 포트/동적 동작을 제어
 *
 * 핵심 전략
 * - DEV(개발 서버)에서만 프록시 동작
 * - 프록시 target은 기본 localhost:백엔드포트지만, router 훅으로 요청 시점에 호스트를 동적으로 덮어씀
 *   - VITE_USE_DYNAMIC_HOST=true → 현재 Vite 개발서버의 Host 헤더에서 IP를 추출해 사용
 *   - (옵션) VITE_BACKEND_DOMAIN이 지정되어 있으면 그쪽을 우선 적용(팀 공용 게이트웨이 도메인 등)
 *
 * 관련 .env (VITE_* 접두사 필수)
 * - VITE_FRONTEND_PORT=5005
 * - VITE_BACKEND_PORT=9005
 * - VITE_USE_DYNAMIC_HOST=true
 * - VITE_BACKEND_DOMAIN= (운영/공용용 고정 도메인 선택사항)
 *
 * @author 왕택준
 * @version 0.1
 * @since 2025.09.24
 */
export default ({ mode }) => {
    // Vite는 클라이언트로 노출 가능한 변수만 VITE_ 접두사로 읽음
    const env = loadEnv(mode, process.cwd(), "");
    const FRONTEND_PORT = Number(env.VITE_FRONTEND_PORT || "5005");
    const BACKEND_PORT = env.VITE_BACKEND_PORT || "9005";
    const USE_DYNAMIC_HOST = (env.VITE_USE_DYNAMIC_HOST || "false") === "true";
    const BACKEND_DOMAIN = (env.VITE_BACKEND_DOMAIN || "").trim(); // 있으면 우선 사용

    /**
     * DEV 프록시 타깃 계산 함수
     *
     * 규칙 우선순위:
     *  1) VITE_BACKEND_DOMAIN 지정 시: http(s)://<도메인> 사용
     *     - 입력값이 'http'로 시작하지 않으면 기본적으로 'http://'를 붙여 프로토콜을 보정함
     *  2) VITE_USE_DYNAMIC_HOST === true:
     *     - 현재 요청의 Host 헤더에서 hostname만 안전하게 추출해 사용
     *       (예: "172.30.1.26:5005" → "172.30.1.26")
     *  3) 그 외:
     *     - 동일 PC에서 개발 중으로 간주하여 http://localhost:<BACKEND_PORT> 사용
     *
     * 참고:
     *  - Vite dev의 proxy.router는 "요청(req) 단위"로 타깃을 재정의할 수 있음
     *  - 이 로직은 개발 서버에서만 동작(빌드 산출물에서는 프록시 미동작)
     */
    const dynamicRouter = (req) => {
        // (1) 고정 도메인 우선
        if (BACKEND_DOMAIN) {
            // 'http'로 시작하지 않으면 'http://'를 붙여 안전하게 보정
            const protocol = BACKEND_DOMAIN.startsWith('http') ? '' : 'http://';
            return `${protocol}${BACKEND_DOMAIN}`;
        }

        // (2) 동적 호스트 사용
        if (USE_DYNAMIC_HOST) {
            // host 헤더가 undefined여도 안전하게 동작
            // 예: "172.30.1.26:5005" → "172.30.1.26"
            const hostHeader = req.headers.host;
            const hostOnly = (hostHeader || 'localhost').split(':')[0] || 'localhost';
            return `http://${hostOnly}:${BACKEND_PORT}`;
        }

        // (3) 기본 폴백: 동일 PC 개발
        return `http://localhost:${BACKEND_PORT}`;
    };

    return defineConfig({
        /**
         * 플러그인
         * - React: JSX/HMR
         * - SVGR: .svg → ReactComponent (네임드 익스포트)
         */
        plugins: [
            react(),
            {
                ...svgr({
                    svgrOptions: { exportType: "named", namedExport: "ReactComponent" },
                    include: "**/*.svg",
                }),
                enforce: "pre",
            },
        ],

        /**
         * 개발 서버
         * - host: true → 0.0.0.0 바인딩(외부/자기 IP로 접근 가능)
         * - port: .env 기반 (기본 5005)
         * - proxy: DEV 전용. PROD에서는 프록시가 동작하지 않으므로 프론트 코드에서 동적 BaseURL을 별도로 계산해야 함.
         */
        server: {
            host: true,
            port: FRONTEND_PORT,

            proxy: {
                /**
                 * API 프록시
                 * - 프론트에서 /api/v1/* 로 호출 → 백엔드로 전달
                 * - target은 필수지만, 실제 목적지는 router에서 동적으로 대체됨
                 */
                "/api/v1": {
                    target: `http://localhost:${BACKEND_PORT}`, // 기본값(필수), 실제로는 router가 덮어씀
                    changeOrigin: true,
                    secure: false,
                    router: dynamicRouter,
                },

                /**
                 * OAuth2 프록시 (개발에서 소셜 로그인 테스트 시)
                 */
                "/oauth2": {
                    target: `http://localhost:${BACKEND_PORT}`,
                    changeOrigin: true,
                    secure: false,
                    router: dynamicRouter,
                },

                /**
                 * (선택) DB 콘솔 등 개발 편의용
                 */
                "/h2-console": {
                    target: `http://localhost:${BACKEND_PORT}`,
                    changeOrigin: true,
                    secure: false,
                    router: dynamicRouter,
                },
            },
        },
    });
};
