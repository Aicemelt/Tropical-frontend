import {useEffect, useRef} from "react";
import {API_ENDPOINT, getOAuthStartUrl} from "../services/api";
import styles from "../styles/pages/WelcomePage.module.scss";

// Components
import WelcomeHeader from "../components/welcome/WelcomeHeader";
import WelcomeFooter from "../components/welcome/WelcomeFooter";
import Logo from "../components/welcome/Logo";
import WelcomeTagline from "../components/welcome/WelcomeTagline";
import EmailLoginButton from "../components/welcome/EmailLoginButton";
import GoogleButton from "../components/welcome/GoogleButton";
import KakaoButton from "../components/welcome/KakaoButton";
import NaverButton from "../components/welcome/NaverButton";

export default function WelcomePage() {
    const containerRef = useRef(null);
    const originalRootStyle = useRef({});
    const originalBodyStyle = useRef({});

    useEffect(() => {
        const rootElement = document.getElementById('root');
        const bodyElement = document.body;

        // 원본 스타일 백업
        if (rootElement) {
            originalRootStyle.current = {
                width: rootElement.style.width || '',
                maxWidth: rootElement.style.maxWidth || '',
                padding: rootElement.style.padding || '',
                margin: rootElement.style.margin || '',
                display: rootElement.style.display || '',
                flexDirection: rootElement.style.flexDirection || '',
                gap: rootElement.style.gap || '',
                position: rootElement.style.position || '',
            };
        }

        if (bodyElement) {
            originalBodyStyle.current = {
                height: bodyElement.style.height || '',
                overflow: bodyElement.style.overflow || '',
                margin: bodyElement.style.margin || '',
                padding: bodyElement.style.padding || '',
            };
        }

        // WelcomePage 전용 스타일 적용
        if (rootElement) {
            rootElement.style.width = '100%';
            rootElement.style.maxWidth = 'none';
            rootElement.style.padding = '0';
            rootElement.style.margin = '0';
            rootElement.style.display = 'block';
            rootElement.style.flexDirection = 'unset';
            rootElement.style.gap = 'unset';
            rootElement.style.position = 'relative';
        }

        if (bodyElement) {
            bodyElement.style.height = '100vh';
            bodyElement.style.overflow = 'hidden';
            bodyElement.style.margin = '0';
            bodyElement.style.padding = '0';
        }

        // 정리 함수 - 컴포넌트 언마운트 시 원본 스타일 복원
        return () => {
            if (rootElement && originalRootStyle.current) {
                Object.assign(rootElement.style, originalRootStyle.current);
            }

            if (bodyElement && originalBodyStyle.current) {
                Object.assign(bodyElement.style, originalBodyStyle.current);
            }
        };
    }, []);

    // Constants
    const DEFAULT_CALLBACK_PATH = "/onboarding";

    // Navigation handlers
    const goSignup = () => {
        window.location.href = "/signup";
    };

    const goToLogin = () => {
        window.location.href = "/login";
    };

    const startOAuth = (provider) => {
        const callbackPath = ""; // Use empty string to default to API's callback path
        const url = getOAuthStartUrl(provider, callbackPath);
        window.location.assign(url);
    };

    return (
        <div ref={containerRef} className={styles.container}>
            <WelcomeHeader onClickSignUp={goSignup}/>
            <main className={styles.main}>
                <Logo/>
                <WelcomeTagline/>
                <div className={styles.buttonStack}>
                    <EmailLoginButton onClick={goToLogin}/>
                    <GoogleButton onClick={() => startOAuth("google")}/>
                    <KakaoButton onClick={() => startOAuth("kakao")}/>
                    <NaverButton onClick={() => startOAuth("naver")}/>
                </div>
            </main>
            <WelcomeFooter apiEndpoint={API_ENDPOINT}/>
        </div>
    );
}