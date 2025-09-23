import styles from "../../styles/components/SocialButton.module.scss";

/** 공통 소셜 버튼 베이스 */
export default function SocialButton({label, onClick, icon, className, ariaLabel}) {
    return (
        <button
            type="button"
            className={`${styles.button} ${className ?? ""}`}
            onClick={onClick}
            aria-label={ariaLabel || label}
        >
            {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
            <span className={styles.label}>{label}</span>
        </button>
    );
}
