import React from 'react';
import '../../styles/global.scss';
import styles from '../../styles/components/ConsentList.module.scss';
import ConsentItem from './ConsentItem.jsx';

/**
 * props:
 * - requiredTerms: [{consentType, title, version, required}]
 * - optionalTerms: same
 * - consents: { [consentType]: boolean }
 * - onToggle: (consentType, checked) => void
 * - onShowDetail: (termsData) => void - 약관 상세 모달 열기
 * - onSelectAllRequired: (checked) => void - 필수 전체 선택
 * - onSelectAllOptional: (checked) => void - 선택 전체 선택
 * - allRequiredChecked: boolean - 모든 필수 항목 체크 여부
 * - allOptionalChecked: boolean - 모든 선택 항목 체크 여부
 */
export default function ConsentList({
                                        requiredTerms,
                                        optionalTerms,
                                        consents,
                                        onToggle,
                                        onShowDetail,
                                        onSelectAllRequired,
                                        onSelectAllOptional,
                                        allRequiredChecked,
                                        allOptionalChecked
                                    }) {
    return (
        <section className={styles.section}>
            {/* 필수 동의 섹션 */}
            <div className={`${styles.group} ${styles.required}`}>
                <div className={styles.groupHeader}>
                    <label className={styles.selectAll}>
                        <input
                            type="checkbox"
                            checked={allRequiredChecked}
                            onChange={(e) => onSelectAllRequired(e.target.checked)}
                            className={styles.selectAllCheckbox}
                        />
                        <h2 className={styles.groupTitle}>
                            필수 동의
                            <span className={styles.selectAllText}>(모두 선택)</span>
                        </h2>
                    </label>
                    <div className={styles.badge}>
                        <span className={styles.badgeText}>필수</span>
                    </div>
                </div>
                <div className={styles.list}>
                    {requiredTerms.map(t => (
                        <ConsentItem
                            key={t.consentType}
                            consent={t}
                            checked={!!consents[t.consentType]}
                            onChange={(v) => onToggle(t.consentType, v)}
                            onShowDetail={onShowDetail}
                        />
                    ))}
                </div>
            </div>

            {/* 선택 동의 섹션 */}
            {optionalTerms.length > 0 && (
                <div className={`${styles.group} ${styles.optional}`}>
                    <div className={styles.groupHeader}>
                        <label className={styles.selectAll}>
                            <input
                                type="checkbox"
                                checked={allOptionalChecked}
                                onChange={(e) => onSelectAllOptional(e.target.checked)}
                                className={styles.selectAllCheckbox}
                            />
                            <h2 className={styles.groupTitle}>
                                선택 동의
                                <span className={styles.selectAllText}>(모두 선택)</span>
                            </h2>
                        </label>
                        <div className={styles.badge}>
                            <span className={styles.badgeText}>선택</span>
                        </div>
                    </div>
                    <div className={styles.list}>
                        {optionalTerms.map(t => (
                            <ConsentItem
                                key={t.consentType}
                                consent={t}
                                checked={!!consents[t.consentType]}
                                onChange={(v) => onToggle(t.consentType, v)}
                                onShowDetail={onShowDetail}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}