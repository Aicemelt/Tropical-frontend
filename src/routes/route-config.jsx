/**
 * React Router 설정
 *
 * 인증 플로우를 포함한 전체 라우트 구조를 정의합니다.
 * Welcome → 인증 → 보호된 라우트 플로우를 지원합니다.
 *
 * @author 왕택준
 * @version 0.1
 * @since 2025.09.18
 */

import {createBrowserRouter} from "react-router-dom";
import RootLayout from "../layouts/RootLayout.jsx";
import WelcomePage from '../pages/WelcomePage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import SignupPage from "../pages/SignupPage.jsx";
import CalendarPage from "../pages/CalendarPage.jsx";
import TodoPage from "../pages/TodoPage.jsx";
import BucketPage from "../pages/BucketPage.jsx";
import ProtectedRoute from "../components/auth/Guards/ProtectedRoute.jsx";
// import VerifyRequiredPage from "../pages/VerifyRequiredPage.jsx";
// import EmailVerifiedPage from "../pages/EmailVerifiedPage.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        errorElement: <div>에러가 발생했습니다. 잠시 후 다시 시도해주세요.</div>,
        children: [
            // ================================
            // 공개 라우트 (인증 불필요)
            // ================================
            {
                index: true,
                element: <WelcomePage/>  // 첫 진입점을 WelcomePage로 변경
            },
            // {
            //     path: 'login',
            //     element: <LoginPage/>
            // },
            {
                path: 'signup',
                element: <SignupPage/>
            },
            {
                path: 'onboarding',
                element: <OnboardingPage/>
            },

            // ================================
            // 이메일 인증 관련 라우트 (추후 추가)
            // ================================
            /*
            {
              path: 'verify-required',
              element: <VerifyRequiredPage />
            },
            {
              path: 'verified',
              element: <EmailVerifiedPage />
            },
            {
              path: 'verify-failed',
              element: <EmailVerifiedPage />
            },
            */

            // ================================
            // 보호된 라우트 (인증 필요)
            // ================================
            {
                path: 'dashboard',
                element: <ProtectedRoute><RootLayout/></ProtectedRoute>,
                children: [
                    {
                        index: true,
                        element: <CalendarPage/>  // 대시보드 기본 페이지
                    },
                    {
                        path: 'calendar',
                        element: <CalendarPage/>
                    },
                    {
                        path: 'todo',
                        element: <TodoPage/>
                    },
                    {
                        path: 'bucket',
                        element: <BucketPage/>
                    }
                ]
            },

            // ================================
            // 호환성을 위한 레거시 라우트 (리다이렉트)
            // ================================
            {
                path: 'todo',
                element: <div>리다이렉트 중...</div>,
                loader: () => {
                    // /dashboard/todo로 리다이렉트
                    throw new Response("", {
                        status: 302,
                        headers: {
                            Location: "/dashboard/todo",
                        },
                    });
                }
            },
            {
                path: 'bucket',
                element: <div>리다이렉트 중...</div>,
                loader: () => {
                    // /dashboard/bucket으로 리다이렉트
                    throw new Response("", {
                        status: 302,
                        headers: {
                            Location: "/dashboard/bucket",
                        },
                    });
                }
            },

            // ================================
            // 404 처리
            // ================================
            {
                path: '*',
                element: <div>404 - 페이지를 찾을 수 없습니다.</div>
            }
        ]
    }
]);

export default router;

/*
 * 라우트 구조 설명:
 *
 * 1. 공개 라우트 (/)
 *    - WelcomePage: 서비스 랜딩 페이지
 *    - LoginPage: 로컬 계정 로그인
 *    - SignupPage: 회원가입
 *    - OnboardingPage: 소셜 계정 온보딩
 *
 * 2. 보호된 라우트 (/dashboard)
 *    - RootLayout 하위에 실제 서비스 페이지들
 *    - 인증 가드로 보호 예정
 *
 * 3. 인증 플로우:
 *    - 소셜: WelcomePage → OAuth → OnboardingPage → /dashboard
 *    - 로컬: WelcomePage → SignupPage → 인증대기 → LoginPage → /dashboard
 *    - 기존: WelcomePage → LoginPage → /dashboard
 *
 * 4. URL 구조:
 *    - / : 서비스 랜딩
 *    - /login : 로그인
 *    - /signup : 회원가입
 *    - /onboarding : 온보딩 (소셜 전용)
 *    - /dashboard : 메인 서비스 (인증 필요)
 *    - /dashboard/todo : 할 일 관리
 *    - /dashboard/bucket : 버킷리스트
 */