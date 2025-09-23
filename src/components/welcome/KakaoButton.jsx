// src/components/welcome/KakaoButton.jsx
import SocialButton from "./SocialButton";
import styles from "../../styles/components/KakaoButton.module.scss";
import {ReactComponent as KakaoIcon} from "../../asset/kakao_symbol.svg";

export default function KakaoButton({onClick}) {
    return (
        <SocialButton
            label="카카오 로그인"
            ariaLabel="카카오 로그인"
            onClick={onClick}
            icon={<KakaoIcon/>}
            className={styles.kakao}
        />
    );
}
