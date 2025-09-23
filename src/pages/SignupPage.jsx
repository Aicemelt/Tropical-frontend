// src/pages/SignupPage.jsx
import React, {useMemo, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.scss';
import styles from '../styles/pages/SignupPage.module.scss';

import SignupHeader from '../components/auth/signup/SignupHeader.jsx';
import SignupStep1 from '../components/auth/signup/SignupStep1.jsx';
import SignupStep2 from '../components/auth/signup/SignupStep2.jsx';
import SignupNavigation from '../components/auth/signup/SignupNavigation.jsx';
import SignupErrorModal from '../components/auth/signup/SignupErrorModal.jsx';
import {apiMethods} from '../services/api.js';

export default function SignupPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    const [agreements, setAgreements] = useState({
        terms_of_service: false,
        privacy_policy: false,
        calendar_personalization: false,
        diary_personalization: false,
        todo_personalization: false,
        bucket_personalization: false,
    });

    const [userInfo, setUserInfo] = useState({
        nickname: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 에러 모달 상태 추가
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        type: null,
        email: null
    });

    // (1) 필수 약관 모두 동의 여부
    const allRequiredAgreed = useMemo(() =>
            agreements.terms_of_service &&
            agreements.privacy_policy &&
            agreements.calendar_personalization
        , [agreements]);

    // (2) 사용자 정보 유효 여부
    const isUserInfoValid = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return userInfo.nickname.trim().length >= 2 &&
            emailRegex.test(userInfo.email) &&
            userInfo.password.length >= 8 &&
            userInfo.password === userInfo.passwordConfirm;
    }, [userInfo]);

    // (3) 진행률 계산: 상태 기반
    const progress = useMemo(() => {
        // Step 기반 기본 진행률
        const baseProgress = (currentStep / 2) * 100; // Step 1: 50%, Step 2: 100%

        // Step 1에서 필수 약관 미완료 시에만 0%로 조정
        if (currentStep === 1 && !allRequiredAgreed) {
            return 0;
        }

        return baseProgress;
    }, [currentStep, allRequiredAgreed]);

    const handleAgreementToggle = (consentType) => {
        setAgreements(prev => ({ ...prev, [consentType]: !prev[consentType] }));
    };

    const handleSelectAllRequired = (checked) => {
        setAgreements(prev => ({
            ...prev,
            terms_of_service: checked,
            privacy_policy: checked,
            calendar_personalization: checked
        }));
    };

    const handleSelectAllOptional = (checked) => {
        setAgreements(prev => ({
            ...prev,
            diary_personalization: checked,
            todo_personalization: checked,
            bucket_personalization: checked
        }));
    };

    const handleUserInfoChange = (field, value) => {
        setUserInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleNextStep = () => {
        if (currentStep === 1 && allRequiredAgreed) {
            setError('');
            setCurrentStep(2);
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 2) {
            setError('');
            setCurrentStep(1);
        }
    };

    // 에러 모달 핸들러들
    const handleCloseErrorModal = () => {
        setErrorModal({ isOpen: false, type: null, email: null });
    };

    const handleRetrySignup = () => {
        setErrorModal({ isOpen: false, type: null, email: null });
        setError('');
        // 이메일 중복인 경우 이메일 필드 포커스
        if (errorModal.type === 'EMAIL_DUPLICATE') {
            setUserInfo(prev => ({ ...prev, email: '' }));
            // 이메일 입력 필드에 포커스
            setTimeout(() => {
                const emailInput = document.querySelector('input[name="email"]');
                if (emailInput) emailInput.focus();
            }, 100);
        }
    };

    const handleSubmit = async () => {
        if (!isUserInfoValid) {
            setError('입력 정보를 다시 확인해 주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                email: userInfo.email,
                password: userInfo.password,
                nickname: userInfo.nickname,
                requiredConsents: {
                    termsOfService: agreements.terms_of_service,
                    privacyPolicy: agreements.privacy_policy,
                    calendarPersonalization: agreements.calendar_personalization
                },
                optionalConsents: {
                    diaryPersonalization: agreements.diary_personalization,
                    todoPersonalization: agreements.todo_personalization,
                    bucketPersonalization: agreements.bucket_personalization
                }
            };

            const response = await apiMethods.post('/auth/signup', payload);

            if (response.data?.success) {
                // 회원가입 성공 시 이메일과 함께 인증 페이지로 이동
                navigate('/verify-required', {
                    state: {
                        email: userInfo.email,
                        message: '회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.'
                    }
                });
            } else {
                throw new Error(response.data?.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원가입 에러:', error);

            // 에러 타입별 처리
            const errorMessage = error.response?.data?.message || error.message;

            if (errorMessage.includes('이미 사용 중인') ||
                errorMessage.includes('중복') ||
                errorMessage.includes('이미 존재하는')) {
                // 이메일 중복 모달 표시
                setErrorModal({
                    isOpen: true,
                    type: 'EMAIL_DUPLICATE',
                    email: userInfo.email
                });
            } else if (error.response?.status >= 500) {
                // 서버 에러 모달
                setErrorModal({
                    isOpen: true,
                    type: 'SERVER_ERROR',
                    email: userInfo.email
                });
            } else if (error.code === 'NETWORK_ERROR') {
                // 네트워크 에러 모달
                setErrorModal({
                    isOpen: true,
                    type: 'NETWORK_ERROR',
                    email: userInfo.email
                });
            } else {
                // 일반 에러는 기존 방식대로 페이지에 표시
                if (errorMessage.includes('동의')) {
                    setError('필수 약관에 모두 동의해 주세요.');
                    setCurrentStep(1);
                } else {
                    setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <SignupHeader currentStep={currentStep} totalSteps={2} />

                <div className={styles.content}>
                    {currentStep === 1 && (
                        <SignupStep1
                            agreements={agreements}
                            onAgreementToggle={handleAgreementToggle}
                            onSelectAllRequired={handleSelectAllRequired}
                            onSelectAllOptional={handleSelectAllOptional}
                            allRequiredAgreed={allRequiredAgreed}
                            error={error}
                        />
                    )}

                    {currentStep === 2 && (
                        <SignupStep2
                            userInfo={userInfo}
                            onUserInfoChange={handleUserInfoChange}
                            isValid={isUserInfoValid}
                            loading={loading}
                            error={error}
                        />
                    )}
                </div>

                <SignupNavigation
                    currentStep={currentStep}
                    totalSteps={2}
                    canProceed={currentStep === 1 ? allRequiredAgreed : isUserInfoValid}
                    loading={loading}
                    onNext={handleNextStep}
                    onPrev={handlePrevStep}
                    onSubmit={handleSubmit}
                    progress={progress}
                />

                <div className={styles.footer}>
                    <p className={styles.loginLink}>
                        이미 계정이 있으신가요? <a href="/login" className={styles.link}>로그인</a>
                    </p>
                </div>
            </div>

            {/* 에러 모달 추가 */}
            <SignupErrorModal
                isOpen={errorModal.isOpen}
                errorType={errorModal.type}
                email={errorModal.email}
                onClose={handleCloseErrorModal}
                onRetry={handleRetrySignup}
            />
        </main>
    );
}