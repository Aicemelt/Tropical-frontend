import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import styles from '../styles/pages/EmailVerifiedPage.module.scss';

function EmailVerifiedPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'already', 'failed'
    const [message, setMessage] = useState('이메일 인증을 확인하고 있습니다...');
    const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(5);

    // URL 파라미터에서 상태 확인
    useEffect(() => {
        const status = searchParams.get('status');

        if (status === 'success') {
            setVerificationStatus('success');
            setMessage('이메일 인증이 완료되었습니다!');
            setAutoRedirectCountdown(5);
        } else if (status === 'already') {
            setVerificationStatus('already');
            setMessage('이미 인증이 완료된 계정입니다.');
            setAutoRedirectCountdown(3);
        } else {
            setVerificationStatus('failed');
            setMessage('인증에 실패했습니다. 인증 링크가 만료되었거나 잘못된 링크입니다.');
        }
    }, [searchParams]);

    // 성공/이미인증 시 자동 리다이렉션 카운트다운
    useEffect(() => {
        if ((verificationStatus === 'success' || verificationStatus === 'already') && autoRedirectCountdown > 0) {
            const timer = setTimeout(() => {
                setAutoRedirectCountdown(autoRedirectCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if ((verificationStatus === 'success' || verificationStatus === 'already') && autoRedirectCountdown === 0) {
            navigate('/login');
        }
    }, [verificationStatus, autoRedirectCountdown, navigate]);

    // 수동 로그인 페이지 이동
    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className={styles.emailVerifiedPage}>
            <div className={styles.verifyContainer}>
                {/* 헤더 */}
                <header className={styles.verifyHeader}>
                    <Link to="/" className={styles.backLink}>← 홈으로</Link>

                    {/* 상태별 아이콘 */}
                    <div className={styles.iconWrapper}>
                        {verificationStatus === 'verifying' && (
                            <div className={styles.loadingIcon}>⏳</div>
                        )}
                        {(verificationStatus === 'success' || verificationStatus === 'already') && (
                            <div className={styles.successIcon}>✅</div>
                        )}
                        {verificationStatus === 'failed' && (
                            <div className={styles.errorIcon}>❌</div>
                        )}
                    </div>

                    {/* 상태별 제목 */}
                    <h1>
                        {verificationStatus === 'verifying' && '인증 확인 중'}
                        {verificationStatus === 'success' && '인증 완료'}
                        {verificationStatus === 'already' && '인증 완료'}
                        {verificationStatus === 'failed' && '인증 실패'}
                    </h1>
                </header>

                <main className={styles.verifyMain}>
                    {/* 메시지 */}
                    <div className={`${styles.statusMessage} ${styles[verificationStatus]}`}>
                        <p>{message}</p>
                    </div>

                    {/* 인증 성공 */}
                    {verificationStatus === 'success' && (
                        <div className={styles.successContent}>
                            <div className={styles.successMessageBox}>
                                <h3>🎉 환영합니다!</h3>
                                <p>
                                    이제 Tropical의 모든 기능을 이용하실 수 있습니다.<br />
                                    스마트한 일정 관리를 시작해보세요!
                                </p>
                            </div>

                            {/* 자동 리다이렉션 안내 */}
                            <div className={styles.autoRedirect}>
                                <p>
                                    {autoRedirectCountdown > 0 ? (
                                        <>
                                            <strong>{autoRedirectCountdown}초</strong> 후 로그인 페이지로 이동합니다
                                        </>
                                    ) : (
                                        '로그인 페이지로 이동합니다...'
                                    )}
                                </p>
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    onClick={handleGoToLogin}
                                >
                                    지금 로그인하기
                                </button>
                            </div>

                            {/* 추가 안내 */}
                            <div className={styles.nextSteps}>
                                <h4>다음 단계:</h4>
                                <ol>
                                    <li>로그인 페이지에서 이메일과 비밀번호를 입력하세요</li>
                                    <li>대시보드에서 첫 번째 일정을 만들어보세요</li>
                                    <li>AI 추천 기능으로 더 스마트하게 관리하세요</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {/* 이미 인증된 계정 */}
                    {verificationStatus === 'already' && (
                        <div className={styles.successContent}>
                            <div className={styles.successMessageBox}>
                                <h3>✅ 이미 인증된 계정입니다</h3>
                                <p>
                                    해당 계정은 이미 이메일 인증이 완료되었습니다.<br />
                                    바로 로그인하여 서비스를 이용하세요!
                                </p>
                            </div>

                            {/* 자동 리다이렉션 안내 */}
                            <div className={styles.autoRedirect}>
                                <p>
                                    {autoRedirectCountdown > 0 ? (
                                        <>
                                            <strong>{autoRedirectCountdown}초</strong> 후 로그인 페이지로 이동합니다
                                        </>
                                    ) : (
                                        '로그인 페이지로 이동합니다...'
                                    )}
                                </p>
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    onClick={handleGoToLogin}
                                >
                                    지금 로그인하기
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 인증 실패 */}
                    {verificationStatus === 'failed' && (
                        <div className={styles.failedContent}>
                            <div className={styles.errorMessageBox}>
                                <h3>인증에 실패했습니다</h3>
                                <p>다음과 같은 이유로 인증이 실패할 수 있습니다:</p>
                                <ul>
                                    <li>인증 링크가 만료되었습니다 (24시간 유효)</li>
                                    <li>이미 인증이 완료된 계정입니다</li>
                                    <li>잘못된 인증 링크입니다</li>
                                </ul>
                            </div>

                            {/* 해결 방법 */}
                            <div className={styles.resolutionSteps}>
                                <h4>해결 방법:</h4>
                                <div className={styles.actionButtons}>
                                    <button
                                        type="button"
                                        className={`${styles.btn} ${styles.btnPrimary}`}
                                        onClick={handleGoToLogin}
                                    >
                                        로그인 시도하기
                                    </button>

                                    <Link to="/signup" className={`${styles.btn} ${styles.btnSecondary}`}>
                                        새 계정 만들기
                                    </Link>
                                </div>
                            </div>

                            {/* 추가 도움말 */}
                            <div className={styles.helpInfo}>
                                <p>
                                    문제가 계속되면{' '}
                                    <Link to="/support">고객지원</Link>에 문의하시거나{' '}
                                    <Link to="/signup">새 계정</Link>을 만들어보세요.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default EmailVerifiedPage;