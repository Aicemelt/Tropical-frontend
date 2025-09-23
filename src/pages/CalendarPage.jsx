/**
 * @fileoverview 캘린더 메인 페이지
 * @description FullCalendar + 일정/일기 통합 기능 제공
 * @author 신동준
 * @since 2025-09-21
 * @version 1.0.0
 */

import React from 'react';
import IntegratedCalendar from "../components/calendar/IntegratedCalendar.jsx";

const CalendarPage = () => {
    useEffect(() => {
        console.log('CalendarPage 스타일 강제 적용 시작');

        // EmailVerifiedPage, VerifyRequiredPage CSS 완전 무력화
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.style.cssText = `
                width: 100% !important;
                max-width: 1200px !important;
                margin: 0 auto !important;
                display: flex !important;
                padding: 60px 0 0 !important;
                flex-direction: row !important;
                gap: 4.67% !important;
                position: relative !important;
                background: #fff !important;
                height: auto !important;
                top: auto !important;
                left: auto !important;
                z-index: auto !important;
            `;
        }

        // body 스타일도 강제 복원
        document.body.style.cssText = `
            font-family: var(--font-primary) !important;
            font-size: 16px !important;
            font-weight: 400 !important;
            line-height: 1.5 !important;
            color: #212121 !important;
            background-color: #fff !important;
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: auto !important;
        `;

        // html도 초기화
        document.documentElement.style.cssText = `
            background: #fff !important;
            height: auto !important;
        `;

        console.log('CalendarPage 스타일 강제 적용 완료');

        // 정리 함수는 없음 (다른 페이지에서 각자 처리)
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            {/* 페이지 헤더 */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
                    📅 캘린더
                </h1>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                    일정과 일기를 한눈에 관리해보세요
                </p>
            </div>

            {/* 통합 캘린더 컴포넌트 */}
            <IntegratedCalendar />
        </div>
    );
};

export default CalendarPage;