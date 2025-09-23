/**
 * @fileoverview Navigator 설정 커스텀 훅
 * @description API 클라이언트에서 사용할 navigate 함수를 자동으로 설정합니다.
 * @author 왕택준
 * @version 0.1
 * @since 2025-09-21
 */

import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {setNavigator} from '../../services/api.js';

/**
 * Navigator 설정 훅
 *
 * React Router의 navigate 함수를 API 클라이언트에 주입하여
 * API 호출 중 발생하는 인증 오류 시 자동 리다이렉트가 가능하도록 합니다.
 *
 * 사용법:
 * - 각 페이지 컴포넌트에서 한 번씩 호출
 * - 라우터 컨텍스트 내부에서만 사용 가능
 *
 * @example
 * function MyPage() {
 *   useNavigatorSetup(); // API 클라이언트에 navigate 함수 주입
 *   return <div>페이지 내용</div>;
 * }
 *
 * @returns {void}
 */
export function useNavigatorSetup() {
    const navigate = useNavigate();

    useEffect(() => {
        // API 클라이언트에 navigate 함수 주입
        // 인증 실패 시 자동 리다이렉트에 사용됨
        setNavigator(navigate);
    }, [navigate]);
}

export default useNavigatorSetup;