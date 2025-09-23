import styles from "../../styles/components/Logo.module.scss";
import logo from "../../asset/logo.png";

export default function Logo() {
    return (
        <div className={styles.logo}>
            <img src={logo} alt="TropiCal 로고" className={styles.image}/>
        </div>
    );
}
