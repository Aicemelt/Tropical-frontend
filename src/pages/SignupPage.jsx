// src/pages/SignupPage.jsx
import React, {useMemo, useState} from 'react';
import '../styles/global.scss';
import styles from '../styles/pages/SignupPage.module.scss';

import SignupHeader from '../components/auth/signup/SignupHeader.jsx';
import SignupStep1 from '../components/auth/signup/SignupStep1.jsx';
import SignupStep2 from '../components/auth/signup/SignupStep2.jsx';
import SignupNavigation from '../components/auth/signup/SignupNavigation.jsx';
import {apiMethods} from '../services/api.js';

/**
 * 회원가입 페이지 (2단계 프로세스)
 * 1단계: 약관 동의
 * 2단계: 사용자 정보 입력 + 가입 처리
 */
export default function SignupPage() {
    // 단계 관리
    const [currentStep, setCurrentStep] = useState(1);

    // 약관 동의 상태 (1단계)
    const [agreements, setAgreements] = useState({
        terms_of_service: false,
        privacy_policy: false,
        calendar_personalization: false,
        // 선택 동의
        diary_personalization: false,
        todo_personalization: false,
        bucket_personalization: false,
    });

    // 사용자 정보 상태 (2단계)
    const [userInfo, setUserInfo] = useState({
        nickname: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    // 전체 상태 관리
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 필수 약관 모두 동의했는지 확인
    const allRequiredAgreed = useMemo(() =>
            agreements.terms_of_service &&
            agreements.privacy_policy &&
            agreements.calendar_personalization,
        [agreements]
    );

    // 사용자 정보 유효성 검사
    const isUserInfoValid = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return userInfo.nickname.trim().length >= 2 &&
            emailRegex.test(userInfo.email) &&
            userInfo.password.length >= 8 &&
            userInfo.password === userInfo.passwordConfirm;
    }, [userInfo]);

    // 약관 동의 토글
    const handleAgreementToggle = (consentType) => {
        setAgreements(prev => ({
            ...prev,
            [consentType]: !prev[consentType]
        }));
    };

    // 필수 약관 전체 동의
    const handleSelectAllRequired = (checked) => {
        setAgreements(prev => ({
            ...prev,
            terms_of_service: checked,
            privacy_policy: checked,
            calendar_personalization: checked
        }));
    };

    // 선택 약관 전체 동의
    const handleSelectAllOptional = (checked) => {
        setAgreements(prev => ({
            ...prev,
            diary_personalization: checked,
            todo_personalization: checked,
            bucket_personalization: checked
        }));
    };

    // 사용자 정보 입력 핸들러
    const handleUserInfoChange = (field, value) => {
        setUserInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 다음 단계로 이동
    const handleNextStep = () => {
        if (currentStep === 1 && allRequiredAgreed) {
            setError('');
            setCurrentStep(2);
        }
    };

    // 이전 단계로 이동
    const handlePrevStep = () => {
        if (currentStep === 2) {
            setError('');
            setCurrentStep(1);
        }
    };

    // 회원가입 제출
    const handleSubmit = async () => {
        if (!isUserInfoValid) {
            setError('입력 정보를 다시 확인해 주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 백엔드 API 스펙에 맞는 페이로드 구성
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
                // 회원가입 성공 - 이메일 인증 페이지로 이동
                window.location.assign('/verify-required');
            } else {
                throw new Error(response.data?.message || '회원가입에 실패했습니다.');
            }

        } catch (error) {
            console.error('회원가입 실패:', error);

            // 에러 메시지 처리
            const errorMessage = error.response?.data?.message || error.message;

            if (errorMessage.includes('이메일')) {
                setError('이미 사용 중인 이메일입니다.');
            } else if (errorMessage.includes('동의')) {
                setError('필수 약관에 모두 동의해 주세요.');
                setCurrentStep(1); // 1단계로 되돌리기
            } else {
                setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <SignupHeader
                    currentStep={currentStep}
                    totalSteps={2}
                />

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
                />

                <div className={styles.footer}>
                    <p className={styles.loginLink}>
                        이미 계정이 있으신가요?{' '}
                        <a href="/login" className={styles.link}>로그인</a>
                    </p>
                </div>
            </div>
        </main>
    );
}