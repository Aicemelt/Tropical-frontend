// src/components/auth/signup/SignupNavigation.jsx
import React from 'react';
import styles from '../../../styles/components/SignupNavigation.module.scss';

/**
 * 회원가입 네비게이션 컴포넌트
 * - 이전/다음 버튼
 * - 진행률 표시
 * - 제출 버튼
 */
export default function SignupNavigation({
                                             currentStep,
                                             totalSteps,
                                             canProceed,
                                             loading,
                                             onNext,
                                             onPrev,
                                             onSubmit,
                                             progress
                                         }) {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;
    const progressPercentage =
        typeof progress === 'number'
            ? Math.max(0, Math.min(100, Math.round(progress)))
            : Math.round((currentStep / totalSteps) * 100);

    return (
        <div className={styles.navigation}>
            {/* 진행률 바 */}
            <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{width: `${progressPercentage}%`}}
                    />
                </div>
                <div className={styles.progressText}>
                    {currentStep} / {totalSteps} 단계
                </div>
            </div>

            {/* 버튼 영역 */}
            <div className={styles.buttonContainer}>
                {/* 이전 버튼 */}
                {!isFirstStep && (
                    <button
                        type="button"
                        className={styles.prevBtn}
                        onClick={onPrev}
                        disabled={loading}
                    >
                        ← 이전
                    </button>
                )}

                {/* 다음/완료 버튼 */}
                {isLastStep ? (
                    <button
                        type="button"
                        className={`${styles.submitBtn} ${
                            canProceed && !loading ? styles.enabled : styles.disabled
                        }`}
                        onClick={onSubmit}
                        disabled={!canProceed || loading}
                    >
                        {loading ? (
                            <>
                                <span className={styles.spinner}>⟳</span>
                                가입 중...
                            </>
                        ) : (
                            <>
                                가입하기
                                <span className={styles.buttonIcon}>✓</span>
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        className={`${styles.nextBtn} ${
                            canProceed ? styles.enabled : styles.disabled
                        }`}
                        onClick={onNext}
                        disabled={!canProceed || loading}
                    >
                        다음 →
                    </button>
                )}
            </div>

            {/* 도움말 텍스트 */}
            {!canProceed && (
                <div className={styles.helpSection}>
                    {currentStep === 1 ? (
                        <p className={styles.helpText}>
                            필수 약관에 모두 동의하시면 다음 단계로 진행할 수 있습니다.
                        </p>
                    ) : (
                        <p className={styles.helpText}>
                            모든 정보를 올바르게 입력하시면 회원가입을 완료할 수 있습니다.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}