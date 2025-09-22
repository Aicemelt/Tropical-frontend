import React, {useEffect, useMemo, useState} from 'react';
import '../styles/global.scss';
import styles from '../styles/pages/OnboardingPage.module.scss';

import OnboardingIntro from '../components/onboarding/OnboardingIntro.jsx';
import ConsentList from '../components/onboarding/ConsentList.jsx';
import OnboardingActions from '../components/onboarding/OnboardingActions.jsx';

/**
 * 소셜 온보딩 페이지 (ROLE_ONBOARDING 토큰 전제)
 * - 약관 SUMMARY 목록을 type별(REQUIRED/OPTIONAL)로 조회
 * - 제출 시 /api/v1/auth/onboarding 호출 (쿠키 포함)
 */
export default function OnboardingPage() {
    const [loading, setLoading] = useState(true);
    const [terms, setTerms] = useState([]); // [{consentType, title, required, version, ...}]
    const [consents, setConsents] = useState({}); // { [consentType]: boolean }
    const [error, setError] = useState(null);

    // 필수/선택 분리
    const {requiredTerms, optionalTerms} = useMemo(() => {
        const req = terms.filter(t => t.required);
        const opt = terms.filter(t => !t.required);
        return {requiredTerms: req, optionalTerms: opt};
    }, [terms]);

    // 약관 요약 불러오기 (대문자 ENUM + 타입별 2회 호출)
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);

                const fetchTerms = async (type) => {
                    const res = await fetch(`/api/v1/terms?type=${type}&format=SUMMARY`, {
                        credentials: 'include',
                    });
                    if (!res.ok) throw new Error(`약관 조회 실패 (${type}, ${res.status})`);
                    const json = await res.json();
                    return Array.isArray(json) ? json : (json.data ?? []);
                };

                const [reqList, optList] = await Promise.all([
                    fetchTerms('REQUIRED'),
                    fetchTerms('OPTIONAL'),
                ]);

                const merged = [...reqList, ...optList];
                setTerms(merged);

                // 동의 상태 초기화
                const initial = {};
                merged.forEach(t => {
                    initial[t.consentType] = false;
                });
                setConsents(initial);
            } catch (e) {
                setError(e.message || '약관 조회 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // 제출 핸들러
    const handleSubmit = async () => {
        setError(null);

        // 필수 미체크 검증
        const missingRequired = requiredTerms.filter(t => !consents[t.consentType]);
        if (missingRequired.length > 0) {
            setError('필수 동의 항목을 모두 체크해 주세요.');
            return;
        }

        try {
            // ✅ 서버 DTO(OnboardingRequest) 규격: requiredConsents(필수), optionalConsents(선택)
            const requiredConsentsPayload = {};
            requiredTerms.forEach(t => {
                requiredConsentsPayload[t.consentType] = !!consents[t.consentType];
            });

            const optionalConsentsPayload = {};
            optionalTerms.forEach(t => {
                // 선택 항목은 체크하지 않으면 false로 보냅니다(혹은 생략 가능)
                optionalConsentsPayload[t.consentType] = !!consents[t.consentType];
            });

            const payload = {
                requiredConsents: requiredConsentsPayload,           // @NotNull 필드
                optionalConsents: optionalConsentsPayload            // null 가능하지만 빈 객체로 통일
            };

            const res = await fetch('/api/v1/auth/onboarding', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok || json?.success === false) {
                setError(json?.message || '온보딩 처리 중 오류가 발생했습니다.');
                return;
            }

            // 성공 → 정식 토큰이 쿠키로 교체됨 → 대시보드 이동
            window.location.assign('/dashboard');
        } catch (e) {
            setError(e.message || '네트워크 오류가 발생했습니다.');
        }
    };

    const toggleConsent = (consentType, value) => {
        setConsents(prev => ({...prev, [consentType]: value}));
    };

    return (
        <main className={styles.container}>
            <div className={styles.center}>
                <OnboardingIntro/>

                {loading ? (
                    <div className={styles.skeleton} aria-busy="true">약관을 불러오는 중…</div>
                ) : (
                    <>
                        <ConsentList
                            requiredTerms={requiredTerms}
                            optionalTerms={optionalTerms}
                            consents={consents}
                            onToggle={toggleConsent}
                        />
                        <OnboardingActions
                            disabled={loading}
                            error={error}
                            onSubmit={handleSubmit}
                        />
                    </>
                )}
            </div>
        </main>
    );
}
