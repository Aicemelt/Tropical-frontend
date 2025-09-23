import styles from "../../styles/components/WelcomeTagline.module.scss";

export default function WelcomeTagline() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>TropiCal</h1>
            <p className={styles.description}>
                당신의 일정에서 바로 꺼내 쓸 수 있는 스몰토크 주제를 만나보세요.
            </p>
        </div>
    );
}