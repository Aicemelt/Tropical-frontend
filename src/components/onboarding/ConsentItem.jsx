import React from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/ConsentItem.module.scss';

/**
 * consent: { consentType, title, version, required }
 * checked: boolean
 * onChange: (checked:boolean) => void
 */
export default function ConsentItem({consent, checked, onChange}) {
    const {title, version, required} = consent;

    const handleDetail = async () => {
        // TODO: 약관 상세 모달 열기
        // - GET /api/v1/terms/{consentType} 호출하여 전문 로드
        // - 이 컴포넌트는 트리거만 담당 (모달은 부모에서 제어 권장)
        // - 뼈대 단계에서는 비워둠
        alert('약관 상세(전문) 모달은 다음 단계에서 연결합니다.');
    };

    return (
        <label className={styles.item}>
            <input
                type="checkbox"
                className={styles.checkbox}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className={styles.body}>
                <div className={styles.titleRow}>
          <span className={styles.titleText}>
            {title} {required && <span className={styles.required}>(필수)</span>}
          </span>
                    {version && <span className={styles.version}>v{version}</span>}
                </div>
                <button type="button" className={styles.detailBtn} onClick={handleDetail}>
                    자세히 보기
                </button>
            </div>
        </label>
    );
}
