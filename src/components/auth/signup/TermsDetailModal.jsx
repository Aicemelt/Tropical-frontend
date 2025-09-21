// src/components/auth/signup/TermsDetailModal.jsx
import React, {useEffect, useState} from 'react';
import '../../../styles/global.scss';
import styles from '../../../styles/components/TermsDetailModal.module.scss';
import {apiMethods} from '../../../services/api.js';

/**
 * 약관 상세보기 모달 컴포넌트
 */
export default function TermsDetailModal({isOpen, termKey, title, onClose}) {
    const [loading, setLoading] = useState(false);
    const [termsData, setTermsData] = useState(null);
    const [error, setError] = useState('');

    // API 호출로 약관 상세 정보 가져오기
    useEffect(() => {
        const fetchTermsDetail = async () => {
            if (!isOpen || !termKey) return;

            setLoading(true);
            setError('');

            try {
                // 백엔드 API 스펙에 맞춰 consentType으로 조회
                const consentTypeMap = {
                    'terms_of_service': 'TERMS_OF_SERVICE',
                    'privacy_policy': 'PRIVACY_POLICY',
                    'calendar_personalization': 'CALENDAR_PERSONALIZATION',
                    'diary_personalization': 'DIARY_PERSONALIZATION',
                    'todo_personalization': 'TODO_PERSONALIZATION',
                    'bucket_personalization': 'BUCKET_PERSONALIZATION'
                };

                const consentType = consentTypeMap[termKey];
                if (!consentType) {
                    throw new Error('지원하지 않는 약관 타입입니다.');
                }

                const response = await apiMethods.get(`/terms/${consentType}`);
                setTermsData(response.data);

            } catch (error) {
                console.error('약관 조회 실패:', error);
                setError('약관을 불러오는데 실패했습니다. 잠시 후 다시 시도해 주세요.');
            } finally {
                setLoading(false);
            }
        };

        fetchTermsDetail();
    }, [isOpen, termKey]);

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // 간단한 마크다운 처리 함수
    const formatContent = (content) => {
        if (!content) return '';

        return content
            .replace(/^# (.+)/gm, '<h1>$1</h1>')
            .replace(/^## (.+)/gm, '<h2>$1</h2>')
            .replace(/^### (.+)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)/, '<p>$1')
            .replace(/(.+)$/, '$1</p>')
            .replace(/- (.+)/g, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2 className={styles.title}>
                        {termsData?.title || title || '약관 상세보기'}
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="모달 닫기"
                    >
                        ×
                    </button>
                </header>

                <div className={styles.content}>
                    {loading && (
                        <div className={styles.loading}>
                            <div className={styles.loadingSpinner}>⟳</div>
                            <p>약관을 불러오는 중...</p>
                        </div>
                    )}

                    {error && (
                        <div className={styles.error}>
                            <p>⚠️ {error}</p>
                            <button
                                className={styles.retryBtn}
                                onClick={() => window.location.reload()}
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {termsData && !loading && !error && (
                        <>
                            {termsData.version && (
                                <div className={styles.version}>
                                    버전: {termsData.version} |
                                    시행일: {new Date(termsData.effectiveAt).toLocaleDateString('ko-KR')}
                                </div>
                            )}

                            <div
                                className={styles.termsContent}
                                dangerouslySetInnerHTML={{
                                    __html: formatContent(termsData.content)
                                }}
                            />
                        </>
                    )}
                </div>

                <footer className={styles.footer}>
                    <button className={styles.confirmBtn} onClick={onClose}>
                        확인
                    </button>
                </footer>
            </div>
        </div>
    );
}