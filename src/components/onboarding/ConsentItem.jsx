import React, {useState} from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/ConsentItem.module.scss';

/**
 * consent: { consentType, title, version, required }
 * checked: boolean
 * onChange: (checked:boolean) => void
 * onShowDetail: (termsData) => void - 약관 상세 모달 열기
 */
export default function ConsentItem({consent, checked, onChange, onShowDetail}) {
    const [isLoading, setIsLoading] = useState(false);
    const {title, version, required, consentType} = consent;

    const handleDetail = async () => {
        // onShowDetail이 없으면 동작하지 않음 (안전장치)
        if (!onShowDetail) {
            console.warn('onShowDetail handler가 제공되지 않았습니다.');
            return;
        }

        setIsLoading(true);

        try {
            // API 호출로 약관 전문 조회
            const response = await fetch(`/api/v1/terms/${consentType}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`약관 조회 실패: ${response.status}`);
            }

            const termsData = await response.json();

            // 모달 열기 (부모 컴포넌트에 이벤트 전달)
            onShowDetail(termsData);
        } catch (error) {
            console.error('약관 상세 조회 오류:', error);

            // 더 구체적인 에러 메시지 제공
            const errorMessage = error.message.includes('404')
                ? '해당 약관을 찾을 수 없습니다.'
                : '약관을 불러오는데 실패했습니다. 잠시 후 다시 시도해 주세요.';

            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <label className={styles.item}>
            <input
                type="checkbox"
                className={styles.checkbox}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                aria-describedby={`${consentType}-description`}
            />
            <div className={styles.body}>
                <div className={styles.titleRow}>
                    <span className={styles.titleText} id={`${consentType}-description`}>
                        {title} {required && <span className={styles.required}>(필수)</span>}
                    </span>
                    {version && <span className={styles.version}>v{version}</span>}
                </div>
                <button
                    type="button"
                    className={styles.detailBtn}
                    onClick={handleDetail}
                    disabled={isLoading}
                    aria-label={`${title} 상세 내용 보기`}
                >
                    {isLoading ? '로딩 중...' : '자세히 보기'}
                </button>
            </div>
        </label>
    );
}