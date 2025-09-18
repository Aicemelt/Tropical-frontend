import React from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/WelcomeFooter.module.scss';

export default function WelcomeFooter() {
    return (
        <footer className={styles.footer}>
            <small className={styles.copy}>© {new Date().getFullYear()} Tropical</small>
        </footer>
    );
}
