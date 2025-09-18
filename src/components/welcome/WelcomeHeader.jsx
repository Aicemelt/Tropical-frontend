import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../../styles/global.scss';
import styles from '../../styles/components/WelcomeHeader.module.scss';

export default function WelcomeHeader() {
    const navigate = useNavigate();

    return (
        <header className={styles.header}>
            <button
                type="button"
                className={styles.logoBtn}
                aria-label="Tropical 홈으로"
                onClick={() => navigate('/')}
            >
                <span className={styles.logoCircle} aria-hidden/>
                <span className={styles.logoText}>Tropical</span>
            </button>

            <nav className={styles.nav}>
                <Link to="/signup" className={styles.signupBtn}>회원가입</Link>
            </nav>
        </header>
    );
}
