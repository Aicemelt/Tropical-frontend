import React from 'react';
import {Link} from 'react-router-dom';
import '../../styles/global.scss';
import styles from '../../styles/components/WelcomeContent.module.scss';

export default function WelcomeContent() {
    return (
        <section className={styles.section}>
            {/* 로고 자리(가로형 16:9 영역) — 실제 이미지로 교체 가능 */}
            <div className={styles.hero} aria-hidden>
                <div className={styles.heroBox}>로고</div>
            </div>

            <h1 className={styles.title}>Tropical</h1>
            <p className={styles.subtitle}>
                일정 관리를 위해 개인화된 스몰토크 주제를 추천받아 보세요.
            </p>

            <Link to="/login" className={styles.emailLoginBtn}>
                이메일로 로그인
            </Link>
        </section>
    );
}
