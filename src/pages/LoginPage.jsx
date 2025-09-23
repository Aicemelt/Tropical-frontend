import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/api.js';
import GoogleButton from '../components/welcome/GoogleButton';
import KakaoButton from '../components/welcome/KakaoButton';
import NaverButton from '../components/welcome/NaverButton';
import styles from '../styles/pages/LoginPage.module.scss';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // 회원가입 완료 메시지 확인
    const successMessage = location.state?.message;
    const prefillEmail = location.state?.email;

    const [formData, setFormData] = useState({
        email: prefillEmail || '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // 입력 필드 변경 처리
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // 에러 메시지 초기화
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 폼 유효성 검사
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = '이메일을 입력해주세요.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식을 입력해주세요.';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 로그인 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await apiClient.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                const { nextStep, user } = response.data.data;

                // nextStep에 따른 리다이렉션
                switch (nextStep) {
                    case 'email_verification':
                        navigate('/verify-required', {
                            state: {
                                email: formData.email,
                                message: '이메일 인증이 필요합니다.'
                            }
                        });
                        break;
                    case 'onboarding':
                        navigate('/onboarding');
                        break;
                    case 'dashboard':
                    default:
                        navigate('/dashboard');
                        break;
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.';
            const errorCode = error.response?.data?.errorCode;

            // 특정 에러 코드별 처리
            switch (errorCode) {
                case 'EMAIL_NOT_VERIFIED': // 이메일 미인증
                    setErrors({ general: '이메일 인증이 필요합니다.' });
                    setTimeout(() => {
                        navigate('/verify-required', {
                            state: {
                                email: formData.email,
                                message: '이메일 인증을 완료해주세요.'
                            }
                        });
                    }, 2000);
                    break;
                case 'LOGIN_FAILED': // 잘못된 자격증명
                    setErrors({ general: '이메일 또는 비밀번호가 올바르지 않습니다.' });
                    break;
                default:
                    setErrors({ general: errorMessage });
            }
        } finally {
            setLoading(false);
        }
    };

    // 소셜 로그인 처리
    const handleGoogleLogin = () => {
        window.location.href = '/oauth2/authorization/google';
    };

    const handleKakaoLogin = () => {
        window.location.href = '/oauth2/authorization/kakao';
    };

    const handleNaverLogin = () => {
        window.location.href = '/oauth2/authorization/naver';
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                {/* 헤더 */}
                <header className={styles.loginHeader}>
                    <Link to="/" className={styles.backLink}>← 홈으로</Link>
                    <h1 className={styles.title}>로그인</h1>
                    <p className={styles.subtitle}>TropiCal에 오신 것을 환영합니다</p>
                </header>

                <main className={styles.loginMain}>
                    {/* 회원가입 완료 메시지 */}
                    {successMessage && (
                        <div className={styles.successMessage} role="alert">
                            {successMessage}
                        </div>
                    )}

                    {/* 로그인 폼 */}
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        {/* 일반 에러 메시지 */}
                        {errors.general && (
                            <div className={styles.errorMessage} role="alert">
                                {errors.general}
                            </div>
                        )}

                        {/* 이메일 입력 */}
                        <div className={styles.formGroup}>
                            <label htmlFor="email">이메일</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="이메일을 입력하세요"
                                required
                                disabled={loading}
                                autoComplete="email"
                                autoFocus
                            />
                            {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
                        </div>

                        {/* 비밀번호 입력 */}
                        <div className={styles.formGroup}>
                            <label htmlFor="password">비밀번호</label>
                            <div className={styles.passwordInputWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="비밀번호를 입력하세요"
                                    required
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
                        </div>

                        {/* 로그인 유지 + 비밀번호 찾기 */}
                        <div className={styles.loginOptions}>
                            <label className={styles.rememberMe}>
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                                <span>로그인 상태 유지</span>
                            </label>
                            <Link to="/forgot-password" className={styles.forgotPassword}>
                                비밀번호를 잊으셨나요?
                            </Link>
                        </div>

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            className={styles.loginBtn}
                            disabled={loading}
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>

                    {/* 구분선 */}
                    <div className={styles.divider}>
                        <span>또는</span>
                    </div>

                    {/* 소셜 로그인 */}
                    <section className={styles.socialLogin}>
                        <h3>간편 로그인</h3>
                        <div className={styles.socialButtons}>
                            <GoogleButton onClick={handleGoogleLogin} />
                            <KakaoButton onClick={handleKakaoLogin} />
                            <NaverButton onClick={handleNaverLogin} />
                        </div>
                    </section>

                    {/* 회원가입 링크 */}
                    <div className={styles.signupLink}>
                        <p>
                            아직 계정이 없으신가요?{' '}
                            <Link to="/signup">회원가입</Link>
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default LoginPage;