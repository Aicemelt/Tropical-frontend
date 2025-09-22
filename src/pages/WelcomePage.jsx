import { useEffect } from "react";
import { getOAuthStartUrl, API_ENDPOINT } from "../services/api";
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
    // (전역 충돌 없이 풀스크린) - 이전에 안내드린 body.fullscreen 방식
    useEffect(() => {
        document.body.classList.add("fullscreen");
        return () => document.body.classList.remove("fullscreen");
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
        <div className={styles.container}>
            <WelcomeHeader onClickSignUp={goSignup}/>
            <main className={styles.main}>
                <Logo/>
                <WelcomeTagline/>
                <div className={styles.buttonStack}>
                    <EmailLoginButton onClick={goToLogin} />
                    <GoogleButton onClick={() => startOAuth("google")} />
                    <KakaoButton onClick={() => startOAuth("kakao")} />
                    <NaverButton onClick={() => startOAuth("naver")} />
                </div>
            </main>
            <WelcomeFooter apiEndpoint={API_ENDPOINT} />
        </div>
    );
}
