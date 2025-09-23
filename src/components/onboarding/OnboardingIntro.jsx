import React from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/OnboardingIntro.module.scss';

export default function OnboardingIntro() {
    return (
        <section className={styles.section}>
            <h1 className={styles.title}>서비스 이용약관 동의</h1>
            <p className={styles.subtitle}>
                TropiCal 서비스 이용을 위해 아래 약관을 확인하고 동의해주세요.
            </p>
        </section>
    );
}