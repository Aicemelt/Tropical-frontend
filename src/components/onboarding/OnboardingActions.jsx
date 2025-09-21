import React from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/OnboardingActions.module.scss';

/**
 * 온보딩 액션 컴포넌트
 * @param {Object} props
 * @param {boolean} props.disabled - 버튼 비활성화 여부
 * @param {boolean} props.submitting - 제출 중 여부
 * @param {string|null} props.error - 에러 메시지
 * @param {Function} props.onSubmit - 제출 핸들러
 * @param {boolean} props.allRequiredChecked - 모든 필수 항목 체크 여부
 */
export default function OnboardingActions({
                                              disabled = false,
                                              submitting = false,
                                              error,
                                              onSubmit,
                                              allRequiredChecked
                                          }) {
    const isButtonDisabled = disabled || !allRequiredChecked;

    return (
        <section className={styles.section}>
            {/* 에러 메시지 표시 */}
            {error && (
                <div role="alert" className={styles.error}>
                    <span className={styles.errorIcon}>⚠️</span>
                    <span className={styles.errorText}>{error}</span>
                </div>
            )}

            <div className={styles.buttonContainer}>
                <button
                    type="button"
                    className={`${styles.submitBtn} ${
                        isButtonDisabled ? styles.disabled : styles.enabled
                    }`}
                    onClick={onSubmit}
                    disabled={isButtonDisabled}
                    aria-describedby={!allRequiredChecked ? "help-text" : undefined}
                >
                    <span className={styles.buttonText}>
                        {submitting ? '처리 중...' : '동의하고 시작하기'}
                    </span>
                    {!isButtonDisabled && !submitting && (
                        <span className={styles.buttonIcon} aria-hidden="true">→</span>
                    )}
                    {submitting && (
                        <span className={styles.spinner} aria-hidden="true">⟳</span>
                    )}
                </button>

                {/* 도움말 텍스트 */}
                {!allRequiredChecked && (
                    <p id="help-text" className={styles.helpText}>
                        필수 동의 항목을 모두 체크하시면 서비스를 이용하실 수 있습니다.
                    </p>
                )}
            </div>
        </section>
    );
}