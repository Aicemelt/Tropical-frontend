import {useEffect} from 'react';
import styles from '../../styles/components/TermsModal.module.scss';

export default function TermsModal({isOpen, terms, onClose}) {
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

    if (!isOpen || !terms) return null;

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
                    <h2 className={styles.title}>{terms.title}</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="모달 닫기"
                    >
                        ×
                    </button>
                </header>

                <div className={styles.content}>
                    {terms.version && (
                        <div className={styles.version}>버전: {terms.version}</div>
                    )}
                    <div
                        className={styles.termsContent}
                        dangerouslySetInnerHTML={{__html: formatContent(terms.content)}}
                    />
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