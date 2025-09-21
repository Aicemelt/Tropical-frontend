import styles from "../../styles/components/WelcomeHeader.module.scss";

export default function WelcomeHeader({onClickSignUp}) {
    return (
        <header className={styles.header}>
            <div className={styles.right}>
                <button type="button" onClick={onClickSignUp} className={styles.signupBtn}>
                    회원가입
                </button>
            </div>
        </header>
    );
}
