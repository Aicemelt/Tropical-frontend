/**
 * React Router 설정
 *
 * 인증 플로우를 포함한 전체 라우트 구조를 정의합니다.
 * Welcome → 인증 → 보호된 라우트 플로우를 지원합니다.
 *
 * @author 왕택준
 * @version 0.2
 * @since 2025.09.18
 */

import {createBrowserRouter} from "react-router-dom";
import RootLayout from "../layouts/RootLayout.jsx";
import WelcomePage from '../pages/WelcomePage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import LoginPage from "../pages/LoginPage.jsx";  // 활성화
import SignupPage from "../pages/SignupPage.jsx";
import CalendarPage from "../pages/CalendarPage.jsx";
import TodoPage from "../pages/TodoPage.jsx";
import BucketPage from "../pages/BucketPage.jsx";
import ProtectedRoute from "../components/auth/Guards/ProtectedRoute.jsx";
import VerifyRequiredPage from "../pages/VerifyRequiredPage.jsx";  // 활성화
import EmailVerifiedPage from "../pages/EmailVerifiedPage.jsx";  // 활성화

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
                element: <WelcomePage/>
            },
            {
                path: 'login',
                element: <LoginPage/>  // 활성화
            },
            {
                path: 'signup',
                element: <SignupPage/>
            },
            {
                path: 'onboarding',
                element: <OnboardingPage/>
            },

            // ================================
            // 이메일 인증 관련 라우트
            // ================================
            {
                path: 'verify-required',
                element: <VerifyRequiredPage/>  // 활성화
            },
            {
                path: 'verified',
                element: <EmailVerifiedPage/>  // 활성화
            },
            {
                path: 'verify-failed',
                element: <EmailVerifiedPage/>  // 활성화 (같은 컴포넌트, 다른 상태)
            },

            // ================================
            // 보호된 라우트 (인증 필요)
            // ================================
            {
                path: 'dashboard',
                element: <ProtectedRoute><RootLayout/></ProtectedRoute>,
                children: [
                    {
                        index: true,
                        element: <CalendarPage/>
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