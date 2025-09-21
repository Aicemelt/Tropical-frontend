// src/pages/OnboardingPage.jsx
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import '../styles/global.scss';
import styles from '../styles/pages/OnboardingPage.module.scss';
import {useNavigatorSetup} from '../hooks/welcome/useNavigatorSetup.js';
import useAuthStore from '../store/authStore';

import OnboardingIntro from '../components/onboarding/OnboardingIntro.jsx';
import ConsentList from '../components/onboarding/ConsentList.jsx';
import OnboardingActions from '../components/onboarding/OnboardingActions.jsx';
import TermsModal from '../components/onboarding/TermsModal.jsx';

/**
 * 소셜 온보딩 페이지 (ROLE_ONBOARDING 토큰 전제)
 * - 소셜 로그인 후 약관 동의가 필요한 사용자만 접근
 * - 약관 SUMMARY 목록을 type별(REQUIRED/OPTIONAL)로 조회
 * - 제출 시 /api/v1/auth/onboarding 호출 (쿠키 포함)
 * - "자세히 보기" 클릭 시 약관 전문 모달 표시
 */
export default function OnboardingPage() {
    useNavigatorSetup();

    const {user, nextStep} = useAuthStore();

    // 접근 권한 검증
    useEffect(() => {
        // 소셜 로그인 후 온보딩이 필요한 상태가 아니면 리다이렉트
        if (nextStep !== 'onboarding') {
            if (nextStep === 'email_verification') {
                window.location.assign('/verify-required');
            } else if (!nextStep) {
                window.location.assign('/dashboard');
            } else {
                window.location.assign('/login');
            }
        }
    }, [nextStep]);

    // 페이지 상태
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [terms, setTerms] = useState([]);
    const [consents, setConsents] = useState({});
    const [error, setError] = useState(null);

    // 모달 상태
    const [modalTerms, setModalTerms] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 필수/선택 분리 및 통계
    const {requiredTerms, optionalTerms, progressStats} = useMemo(() => {
        const required = terms.filter(t => t.required);
        const optional = terms.filter(t => !t.required);

        const checkedRequired = required.filter(t => consents[t.consentType] === true).length;
        const checkedOptional = optional.filter(t => consents[t.consentType] === true).length;

        return {
            requiredTerms: required,
            optionalTerms: optional,
            progressStats: {
                required: {
                    checked: checkedRequired,
                    total: required.length,
                    percentage: required.length > 0 ? Math.round((checkedRequired / required.length) * 100) : 0
                },
                optional: {
                    checked: checkedOptional,
                    total: optional.length,
                    percentage: optional.length > 0 ? Math.round((checkedOptional / optional.length) * 100) : 0
                }
            }
        };
    }, [terms, consents]);

    // API 호출 함수들
    const fetchTermsByType = useCallback(async (type) => {
        try {
            const response = await fetch(`/api/v1/terms?type=${type}&format=SUMMARY`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`약관 조회 실패: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : (data.data ?? []);
        } catch (error) {
            throw new Error(`${type} 약관 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }, []);

    // 약관 데이터 초기 로딩
    useEffect(() => {
        const loadTerms = async () => {
            try {
                setLoading(true);
                setError(null);

                const [requiredList, optionalList] = await Promise.all([
                    fetchTermsByType('REQUIRED'),
                    fetchTermsByType('OPTIONAL'),
                ]);

                const allTerms = [...requiredList, ...optionalList];
                setTerms(allTerms);

                // 동의 상태 초기화 (모든 항목을 false로)
                const initialConsents = {};
                allTerms.forEach(term => {
                    initialConsents[term.consentType] = false;
                });
                setConsents(initialConsents);

            } catch (error) {
                console.error('약관 로딩 실패:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        // nextStep이 onboarding일 때만 약관 로딩
        if (nextStep === 'onboarding') {
            loadTerms();
        }
    }, [fetchTermsByType, nextStep]);

    // 개별 동의 토글
    const toggleConsent = useCallback((consentType, value) => {
        setConsents(prev => ({
            ...prev,
            [consentType]: value
        }));
    }, []);

    // 필수 전체 선택/해제
    const handleSelectAllRequired = useCallback((checked) => {
        setConsents(prev => {
            const updated = {...prev};
            requiredTerms.forEach(term => {
                updated[term.consentType] = checked;
            });
            return updated;
        });
    }, [requiredTerms]);

    // 선택 전체 선택/해제
    const handleSelectAllOptional = useCallback((checked) => {
        setConsents(prev => {
            const updated = {...prev};
            optionalTerms.forEach(term => {
                updated[term.consentType] = checked;
            });
            return updated;
        });
    }, [optionalTerms]);

    // 약관 상세 모달 핸들러
    const handleShowTermsDetail = useCallback((termsData) => {
        setModalTerms(termsData);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setModalTerms(null);
    }, []);

    // 온보딩 제출
    const handleSubmit = useCallback(async () => {
        if (submitting) return; // 중복 제출 방지

        setError(null);

        // 필수 항목 검증
        const missingRequired = requiredTerms.filter(term => !consents[term.consentType]);
        if (missingRequired.length > 0) {
            setError(`필수 동의 항목을 모두 체크해 주세요. (${missingRequired.length}개 누락)`);
            return;
        }

        setSubmitting(true);

        try {
            // 페이로드 구성 - 백엔드 API 스펙에 맞춤
            const requiredConsentsPayload = {};
            const optionalConsentsPayload = {};

            requiredTerms.forEach(term => {
                requiredConsentsPayload[term.consentType] = !!consents[term.consentType];
            });

            optionalTerms.forEach(term => {
                optionalConsentsPayload[term.consentType] = !!consents[term.consentType];
            });

            const payload = {
                requiredConsents: requiredConsentsPayload,
                optionalConsents: optionalConsentsPayload
            };

            const response = await fetch('/api/v1/auth/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            let responseData = {};
            try {
                responseData = await response.json();
            } catch (parseError) {
                console.warn('응답 JSON 파싱 실패:', parseError);
            }

            if (!response.ok) {
                const errorMessage = responseData?.message || `서버 오류 (${response.status})`;
                throw new Error(errorMessage);
            }

            if (responseData?.success === false) {
                throw new Error(responseData?.message || '온보딩 처리에 실패했습니다.');
            }

            // 성공 시 auth 상태 업데이트 후 대시보드로 이동
            useAuthStore.getState().setAuthState({
                authenticated: true,
                user: user,
                nextStep: null // 온보딩 완료
            });

            window.location.assign('/dashboard');

        } catch (error) {
            console.error('온보딩 제출 실패:', error);
            setError(error.message || '온보딩 처리 중 예기치 못한 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    }, [submitting, requiredTerms, optionalTerms, consents, user]);

    // 계산된 값들
    const allRequiredChecked = progressStats.required.total > 0 &&
        progressStats.required.checked === progressStats.required.total;
    const allOptionalChecked = progressStats.optional.total > 0 &&
        progressStats.optional.checked === progressStats.optional.total;

    // nextStep이 onboarding가 아니면 로딩 상태 표시
    if (nextStep !== 'onboarding') {
        return (
            <main className={styles.container}>
                <div className={styles.center}>
                    <div className={styles.skeleton} aria-busy="true" role="status">
                        <span>권한을 확인하는 중...</span>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.center}>
                <OnboardingIntro/>

                {loading ? (
                    <div className={styles.skeleton} aria-busy="true" role="status">
                        <span>약관을 불러오는 중…</span>
                    </div>
                ) : (
                    <div className={styles.content}>
                        <ConsentList
                            requiredTerms={requiredTerms}
                            optionalTerms={optionalTerms}
                            consents={consents}
                            onToggle={toggleConsent}
                            onShowDetail={handleShowTermsDetail}
                            onSelectAllRequired={handleSelectAllRequired}
                            onSelectAllOptional={handleSelectAllOptional}
                            allRequiredChecked={allRequiredChecked}
                            allOptionalChecked={allOptionalChecked}
                        />
                    </div>
                )}

                <OnboardingActions
                    error={error}
                    onSubmit={handleSubmit}
                    allRequiredChecked={allRequiredChecked}
                    disabled={loading || submitting}
                    submitting={submitting}
                />
            </div>

            <TermsModal
                isOpen={isModalOpen}
                terms={modalTerms}
                onClose={handleCloseModal}
            />
        </main>
    );
}