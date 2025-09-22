import React from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/SocialLoginButton.module.scss';
import {getOAuthStartUrl} from '../../services/api.js';

export default function SocialLoginButton({provider, label}) {
    const handleClick = () => {
        const cb = import.meta.env.VITE_OAUTH_CALLBACK || '/onboarding';
        const url = getOAuthStartUrl(provider, cb);
        window.location.assign(url);
    };

    return (
        <button type="button" className={styles.button} onClick={handleClick} aria-label={label}>
            <span className={styles.icon} aria-hidden>{getIcon(provider)}</span>
            <span className={styles.label}>{label}</span>
        </button>
    );
}

/** 파일 내 단일 아이콘 유틸(중복 선언 방지) */
function getIcon(provider) {
    switch (provider) {
        case 'google':
            return '🟦';
        case 'kakao':
            return '🟨';
        case 'naver':
            return '🟩';
        default:
            return '🔑';
    }
}
