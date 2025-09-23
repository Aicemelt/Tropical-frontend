// GoogleButton.jsx - 수정
import SocialButton from "./SocialButton";
import styles from "../../styles/components/GoogleButton.module.scss";
import {ReactComponent as GoogleIcon} from "../../asset/google_g_logo.svg";

export default function GoogleButton({onClick}) {
    return (
        <SocialButton
            label="Google 로그인"
            ariaLabel="Google 로그인"
            onClick={onClick}
            icon={<GoogleIcon/>}
            className={styles.google}
        />
    );
}