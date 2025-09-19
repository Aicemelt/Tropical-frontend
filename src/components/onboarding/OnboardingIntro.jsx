import React from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/OnboardingIntro.module.scss';

export default function OnboardingIntro() {
    return (
        <section className={styles.section}>
            <h1 className={styles.title}>온보딩을 완료해 주세요</h1>
            <p className={styles.subtitle}>
                서비스 이용을 위해 필수 약관에 동의하고, 필요 시 선택 항목을 설정할 수 있습니다.
            </p>
        </section>
    );
}
