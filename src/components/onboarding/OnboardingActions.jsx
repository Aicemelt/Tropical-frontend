import React from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/OnboardingActions.module.scss';

export default function OnboardingActions({disabled, error, onSubmit}) {
    return (
        <section className={styles.section}>
            {error && <div role="alert" className={styles.error}>{error}</div>}
            <button type="button" className={styles.submitBtn} onClick={onSubmit} disabled={disabled}>
                온보딩 완료하기
            </button>
        </section>
    );
}
