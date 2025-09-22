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
 */
export default function ConsentList({requiredTerms, optionalTerms, consents, onToggle}) {
    return (
        <section className={styles.section}>
            <div className={styles.group}>
                <h2 className={styles.groupTitle}>필수 동의</h2>
                <div className={styles.list}>
                    {requiredTerms.map(t => (
                        <ConsentItem
                            key={t.consentType}
                            consent={t}
                            checked={!!consents[t.consentType]}
                            onChange={(v) => onToggle(t.consentType, v)}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.group}>
                <h2 className={styles.groupTitle}>선택 동의</h2>
                <div className={styles.list}>
                    {optionalTerms.map(t => (
                        <ConsentItem
                            key={t.consentType}
                            consent={t}
                            checked={!!consents[t.consentType]}
                            onChange={(v) => onToggle(t.consentType, v)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
