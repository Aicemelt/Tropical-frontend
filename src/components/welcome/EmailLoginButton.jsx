import styles from "../../styles/components/EmailLoginButton.module.scss";
import {MdEmail} from 'react-icons/md'; // Material Design 메일 아이콘

export default function EmailLoginButton({onClick}) {
    return (
        <button type="button" className={styles.email} onClick={onClick} aria-label="이메일 로그인">
            <MdEmail size={20}/>
            이메일 로그인
        </button>
    );
}