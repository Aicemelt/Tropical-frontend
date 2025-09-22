import React from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/SocialLoginList.module.scss';
import SocialLoginButton from './SocialLoginButton.jsx';

export default function SocialLoginList() {
    return (
        <section className={styles.section} aria-label="소셜 로그인">
            <div className={styles.stack}>
                <SocialLoginButton provider="google" label="Google로 시작하기"/>
                <SocialLoginButton provider="kakao" label="Kakao로 시작하기"/>
                <SocialLoginButton provider="naver" label="Naver로 시작하기"/>
            </div>
        </section>
    );
}
