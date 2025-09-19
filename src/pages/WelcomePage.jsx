import React from 'react';
import '../styles/global.scss';
import styles from '../styles/pages/WelcomePage.module.scss';

import WelcomeHeader from '../components/welcome/WelcomeHeader.jsx';
import WelcomeContent from '../components/welcome/WelcomeContent.jsx';
import SocialLoginList from '../components/welcome/SocialLoginList.jsx';
import WelcomeFooter from '../components/welcome/WelcomeFooter.jsx';

export default function WelcomePage() {
    return (
        <main className={styles.container}>
            <WelcomeHeader/>
            <section className={styles.center}>
                <WelcomeContent/>
                <SocialLoginList/>
            </section>
            <WelcomeFooter/>
        </main>
    );
}
