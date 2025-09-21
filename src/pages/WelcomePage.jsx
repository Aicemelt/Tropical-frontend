// src/pages/WelcomePage.jsx
import {useEffect} from "react";
import styles from "../styles/pages/WelcomePage.module.scss";

import WelcomeHeader from "../components/welcome/WelcomeHeader";
import WelcomeFooter from "../components/welcome/WelcomeFooter";
import Logo from "../components/welcome/Logo";
import WelcomeTagline from "../components/welcome/WelcomeTagline";
import EmailLoginButton from "../components/welcome/EmailLoginButton";
import GoogleButton from "../components/welcome/GoogleButton";
import KakaoButton from "../components/welcome/KakaoButton";
import NaverButton from "../components/welcome/NaverButton";
import {getOAuthStartUrl} from "../services/api";

export default function WelcomePage() {
    // (전역 충돌 없이 풀스크린) - 이전에 안내드린 body.fullscreen 방식
    useEffect(() => {
        document.body.classList.add("fullscreen");
        return () => document.body.classList.remove("fullscreen");
    }, []);

    const goSignup = () => (window.location.href = "/signup");
    const startOAuth = (provider) => {
        const callback = import.meta.env.VITE_OAUTH_CALLBACK || "/onboarding";
        const url = getOAuthStartUrl(provider, callback);
        window.location.assign(url);
    };

    return (
        <div className={styles.container}>
            <WelcomeHeader onClickSignUp={goSignup}/>
            <main className={styles.main}>
                <Logo/>
                <WelcomeTagline/>
                <div className={styles.buttonStack}>
                    <EmailLoginButton onClick={() => (window.location.href = "/login")}/>
                    <GoogleButton onClick={() => startOAuth("google")}/>
                    <KakaoButton onClick={() => startOAuth("kakao")}/>
                    <NaverButton onClick={() => startOAuth("naver")}/>
                </div>
            </main>
            <WelcomeFooter/>
        </div>
    );
}
