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