// src/components/auth/signup/SignupStep2.jsx
import React, {useState} from 'react';
import '../../../styles/global.scss';
import styles from '../../../styles/components/SignupStep2.module.scss';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * 회원가입 2단계: 사용자 정보 입력
 */
export default function SignupStep2({
                                        userInfo,
                                        onUserInfoChange,
                                        isValid,
                                        loading,
                                        error
                                    }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // 입력 핸들러
    const handleInputChange = (field) => (e) => {
        onUserInfoChange(field, e.target.value);
    };

    // 유효성 검사 상태
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validation = {
        nickname: {
            isValid: userInfo.nickname.trim().length >= 2,
            message: '닉네임은 2자 이상 입력해주세요.'
        },
        email: {
            isValid: emailRegex.test(userInfo.email),
            message: '올바른 이메일 형식을 입력해주세요.'
        },
        password: {
            isValid: userInfo.password.length >= 8,
            message: '비밀번호는 8자 이상 입력해주세요.'
        },
        passwordConfirm: {
            isValid: userInfo.password === userInfo.passwordConfirm && userInfo.passwordConfirm.length > 0,
            message: '비밀번호가 일치하지 않습니다.'
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                {/* 닉네임 입력 */}
                <div className={styles.field}>
                    <label className={styles.label}>
                        닉네임 <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        className={`${styles.input} ${
                            userInfo.nickname && !validation.nickname.isValid ? styles.invalid : ''
                        }`}
                        placeholder="사용하실 닉네임을 입력해주세요"
                        value={userInfo.nickname}
                        onChange={handleInputChange('nickname')}
                        maxLength={20}
                        autoComplete="username"
                    />
                    {userInfo.nickname && !validation.nickname.isValid && (
                        <div className={styles.fieldError}>{validation.nickname.message}</div>
                    )}
                </div>

                {/* 이메일 입력 */}
                <div className={styles.field}>
                    <label className={styles.label}>
                        이메일 <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="email"
                        className={`${styles.input} ${
                            userInfo.email && !validation.email.isValid ? styles.invalid : ''
                        }`}
                        placeholder="example@tropical.com"
                        value={userInfo.email}
                        onChange={handleInputChange('email')}
                        autoComplete="email"
                    />
                    {userInfo.email && !validation.email.isValid && (
                        <div className={styles.fieldError}>{validation.email.message}</div>
                    )}
                </div>

                {/* 비밀번호 입력 */}
                <div className={styles.field}>
                    <label className={styles.label}>
                        비밀번호 <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordField}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className={`${styles.input} ${
                                userInfo.password && !validation.password.isValid ? styles.invalid : ''
                            }`}
                            placeholder="8자 이상의 비밀번호를 입력해주세요"
                            value={userInfo.password}
                            onChange={handleInputChange('password')}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className={styles.toggleBtn}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? '숨기기' : '표시'}
                        </button>
                    </div>
                    {userInfo.password && !validation.password.isValid && (
                        <div className={styles.fieldError}>{validation.password.message}</div>
                    )}
                </div>

                {/* 비밀번호 확인 */}
                <div className={styles.field}>
                    <label className={styles.label}>
                        비밀번호 확인 <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordField}>
                        <input
                            type={showPasswordConfirm ? 'text' : 'password'}
                            className={`${styles.input} ${
                                userInfo.passwordConfirm && !validation.passwordConfirm.isValid ? styles.invalid : ''
                            }`}
                            placeholder="비밀번호를 다시 입력해주세요"
                            value={userInfo.passwordConfirm}
                            onChange={handleInputChange('passwordConfirm')}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className={styles.toggleBtn}
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        >
                            {showPasswordConfirm ? '숨기기' : '표시'}
                        </button>
                    </div>
                    {userInfo.passwordConfirm && !validation.passwordConfirm.isValid && (
                        <div className={styles.fieldError}>{validation.passwordConfirm.message}</div>
                    )}
                </div>

                {/* 에러 메시지 */}
                <ErrorMessage message={error}/>

                {/* 유효성 상태 표시 */}
                {!isValid && Object.values(userInfo).some(value => value.length > 0) && (
                    <div className={styles.validationSummary}>
                        <div className={styles.validationTitle}>입력 정보를 확인해주세요:</div>
                        <ul className={styles.validationList}>
                            {!validation.nickname.isValid && userInfo.nickname && (
                                <li>닉네임: 2자 이상 입력</li>
                            )}
                            {!validation.email.isValid && userInfo.email && (
                                <li>이메일: 올바른 형식 입력</li>
                            )}
                            {!validation.password.isValid && userInfo.password && (
                                <li>비밀번호: 8자 이상 입력</li>
                            )}
                            {!validation.passwordConfirm.isValid && userInfo.passwordConfirm && (
                                <li>비밀번호 확인: 비밀번호와 일치</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}