// src/components/welcome/NaverButton.jsx
import SocialButton from "./SocialButton";
import styles from "../../styles/components/NaverButton.module.scss";
import {ReactComponent as NaverIcon} from "../../asset/naver_n_white.svg";

export default function NaverButton({onClick}) {
    return (
        <SocialButton
            label="네이버 로그인"
            ariaLabel="네이버 로그인"
            onClick={onClick}
            icon={<NaverIcon/>}
            className={styles.naver}
        />
    );
}
