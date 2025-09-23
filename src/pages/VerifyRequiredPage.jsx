// src/pages/VerifyRequiredPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import styles from "../styles/pages/VerifyRequiredPage.module.scss";

export default function VerifyRequiredPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const stateEmail = location.state?.email;
    const queryEmail = searchParams.get("email");
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("pendingEmail") : null;

    const email = useMemo(() => stateEmail || queryEmail || storedEmail || "", [stateEmail, queryEmail, storedEmail]);
    const message = location.state?.message || "가입 시 입력한 이메일로 인증 메일을 보냈습니다.";

    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!email) {
            navigate("/login", { replace: true });
        }
    }, [email, navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResend = async () => {
        if (!email || countdown > 0) return;
        setResendLoading(true);
        setResendMessage("");
        try {
            const base = import.meta.env.VITE_API_BASE_URL || "";
            const res = await axios.post(
                `${base}/api/auth/verify/resend`,
                { email },
                { withCredentials: true }
            );
            const ok = res?.data?.success ?? true;
            if (!ok) throw new Error(res?.data?.message || "재전송에 실패했습니다.");

            setResendMessage("인증 메일이 다시 전송되었습니다. 메일함을 확인해 주세요.");
            setCountdown(60);
            localStorage.setItem("pendingEmail", email);
        } catch (err) {
            const m = err?.response?.data?.message || err?.message || "재전송 중 문제가 발생했습니다.";
            setResendMessage(m);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className={styles.verifyPage}>
            <div className={styles.verifyCard}>
                {/* 헤더 */}
                <div className={styles.header}>
                    <h1 className={styles.title}>이메일 인증 대기</h1>
                    <p className={styles.subtitle}>{message}</p>
                </div>

                {/* 이메일 표시 */}
                {email && (
                    <div className={styles.emailContainer}>
                        <span className={styles.emailLabel}>대상 이메일:</span>
                        <span className={styles.emailValue}>{email}</span>
                    </div>
                )}

                {/* 상태 메시지 */}
                {resendMessage && (
                    <div className={`${styles.statusMessage} ${resendMessage.includes('전송') ? styles.success : styles.error}`}>
                        {resendMessage}
                    </div>
                )}

                {/* 버튼 그룹 */}
                <div className={styles.buttonGroup}>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading || countdown > 0}
                        aria-busy={resendLoading ? "true" : "false"}
                    >
                        {countdown > 0 ? `${countdown}초 후 재전송` : "인증 메일 재전송"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className={styles.secondaryBtn}
                    >
                        로그인으로 돌아가기
                    </button>
                </div>

                {/* 도움말 섹션 */}
                <div className={styles.helpSection}>
                    <h4>메일이 오지 않나요?</h4>
                    <ul>
                        <li><strong>스팸함</strong>을 확인해보세요</li>
                        <li><strong>이메일 주소</strong>가 정확한지 확인해보세요</li>
                        <li>몇 분 후에 다시 시도해보세요</li>
                        <li>문제가 계속되면 고객지원에 문의하세요</li>
                    </ul>
                </div>

                {/* 하단 링크 */}
                <div className={styles.bottomLinks}>
                    <a href="/signup">새 계정 만들기</a>
                    <a href="/support">고객지원</a>
                </div>
            </div>
        </div>
    );
}