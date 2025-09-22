// src/components/auth/signup/SignupStep1.jsx
import React, {useState} from 'react';
import styles from '../../../styles/components/SignupStep1.module.scss';
import ErrorMessage from './ErrorMessage.jsx';
import TermsDetailModal from './TermsDetailModal.jsx';

/**
 * 회원가입 1단계: 약관 동의
 */
export default function SignupStep1({
                                        agreements,
                                        onAgreementToggle,
                                        onSelectAllRequired,
                                        onSelectAllOptional,
                                        allRequiredAgreed,
                                        error
                                    }) {
    // 모달 상태 관리
    const [modalState, setModalState] = useState({
        isOpen: false,
        termKey: null,
        title: ''
    });

    // 필수 약관 목록
    const requiredTerms = [
        {
            key: 'terms_of_service',
            title: '서비스 이용약관',
            required: true
        },
        {
            key: 'privacy_policy',
            title: '개인정보 처리방침',
            required: true
        },
        {
            key: 'calendar_personalization',
            title: '일정 기반 AI 추천 서비스 동의',
            required: true
        }
    ];

    // 선택 약관 목록
    const optionalTerms = [
        {
            key: 'diary_personalization',
            title: '다이어리 기반 AI 추천 서비스 동의',
            required: false
        },
        {
            key: 'todo_personalization',
            title: '할일 기반 AI 추천 서비스 동의',
            required: false
        },
        {
            key: 'bucket_personalization',
            title: '버킷리스트 기반 AI 추천 서비스 동의',
            required: false
        }
    ];

    // 선택 약관 모두 동의 여부
    const allOptionalAgreed = optionalTerms.every(term => agreements[term.key]);

    // 약관 상세보기 핸들러
    const handleShowTerms = (termKey, title) => {
        setModalState({
            isOpen: true,
            termKey,
            title
        });
    };

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setModalState({
            isOpen: false,
            termKey: null,
            title: ''
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                {/* 필수 약관 섹션 */}
                <div className={styles.termsGroup}>
                    <div className={styles.groupHeader}>
                        <label className={styles.selectAllLabel}>
                            <input
                                type="checkbox"
                                className={styles.selectAllCheckbox}
                                checked={allRequiredAgreed}
                                onChange={(e) => onSelectAllRequired(e.target.checked)}
                            />
                            <span className={styles.groupTitle}>
                                필수 약관
                                <span className={styles.selectAllText}>(모두 동의)</span>
                            </span>
                        </label>
                        <div className={styles.badge}>
                            <span className={styles.badgeText}>필수</span>
                        </div>
                    </div>

                    <div className={styles.termsList}>
                        {requiredTerms.map(term => (
                            <div key={term.key} className={styles.termItem}>
                                <label className={styles.termLabel}>
                                    <input
                                        type="checkbox"
                                        className={styles.termCheckbox}
                                        checked={agreements[term.key] || false}
                                        onChange={() => onAgreementToggle(term.key)}
                                    />
                                    <span className={styles.termTitle}>
                                        {term.title}
                                        {term.required && (
                                            <span className={styles.requiredMark}>(필수)</span>
                                        )}
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    className={styles.detailBtn}
                                    onClick={() => handleShowTerms(term.key, term.title)}
                                >
                                    자세히 보기
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 선택 약관 섹션 */}
                <div className={styles.termsGroup}>
                    <div className={styles.groupHeader}>
                        <label className={styles.selectAllLabel}>
                            <input
                                type="checkbox"
                                className={styles.selectAllCheckbox}
                                checked={allOptionalAgreed}
                                onChange={(e) => onSelectAllOptional(e.target.checked)}
                            />
                            <span className={styles.groupTitle}>
                                선택 약관
                                <span className={styles.selectAllText}>(모두 동의)</span>
                            </span>
                        </label>
                        <div className={`${styles.badge} ${styles.optional}`}>
                            <span className={styles.badgeText}>선택</span>
                        </div>
                    </div>

                    <div className={styles.termsList}>
                        {optionalTerms.map(term => (
                            <div key={term.key} className={styles.termItem}>
                                <label className={styles.termLabel}>
                                    <input
                                        type="checkbox"
                                        className={styles.termCheckbox}
                                        checked={agreements[term.key] || false}
                                        onChange={() => onAgreementToggle(term.key)}
                                    />
                                    <span className={styles.termTitle}>
                                        {term.title}
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    className={styles.detailBtn}
                                    onClick={() => handleShowTerms(term.key, term.title)}
                                >
                                    자세히 보기
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 에러 메시지 */}
                <ErrorMessage message={error}/>

                {/* 안내 메시지 */}
                {!allRequiredAgreed && (
                    <div className={styles.helpText}>
                        필수 약관에 모두 동의하셔야 다음 단계로 진행할 수 있습니다.
                    </div>
                )}
            </div>

            {/* 약관 상세보기 모달 */}
            <TermsDetailModal
                isOpen={modalState.isOpen}
                termKey={modalState.termKey}
                title={modalState.title}
                onClose={handleCloseModal}
            />
        </div>
    );
}