// src/components/auth/signup/SignupHeader.jsx
import React from 'react';
import styles from '../../../styles/components/SignupHeader.module.scss';

/**
 * 회원가입 헤더 컴포넌트
 * - 단계 표시기
 * - 제목 및 설명
 */
export default function SignupHeader({currentStep, totalSteps}) {
    const getStepInfo = (step) => {
        switch (step) {
            case 1:
                return {
                    title: '약관 동의',
                    description: 'TropiCal 서비스 이용을 위한 약관에 동의해주세요.'
                };
            case 2:
                return {
                    title: '계정 정보 입력',
                    description: '서비스 이용을 위한 기본 정보를 입력해주세요.'
                };
            default:
                return {
                    title: '회원가입',
                    description: 'TropiCal과 함께 시작하세요.'
                };
        }
    };

    const stepInfo = getStepInfo(currentStep);

    return (
        <header className={styles.header}>
            {/* 단계 표시기 */}
            <div className={styles.stepIndicator}>
                {Array.from({length: totalSteps}, (_, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div
                            key={stepNumber}
                            className={`${styles.step} ${
                                isActive ? styles.active :
                                    isCompleted ? styles.completed : styles.pending
                            }`}
                        >
                            <div className={styles.stepCircle}>
                                {isCompleted ? (
                                    <span className={styles.checkIcon}>✓</span>
                                ) : (
                                    <span className={styles.stepNumber}>{stepNumber}</span>
                                )}
                            </div>
                            {stepNumber < totalSteps && (
                                <div className={styles.stepLine}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 제목 및 설명 */}
            <div className={styles.titleSection}>
                <h1 className={styles.title}>{stepInfo.title}</h1>
                <p className={styles.description}>{stepInfo.description}</p>
            </div>

            {/* 단계 텍스트 */}
            <div className={styles.stepText}>
                <span className={styles.currentStep}>{currentStep}</span>
                <span className={styles.separator}>/</span>
                <span className={styles.totalSteps}>{totalSteps}</span>
            </div>
        </header>
    );
}