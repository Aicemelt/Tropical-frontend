// services/holidayService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9005';

export const holidayService = {
    // 월별 공휴일 조회
    async getMonthlyHolidays(year, month) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/holidays/monthly?year=${year}&month=${month}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('월별 공휴일 조회 실패:', error);
            return [];
        }
    },

    // FullCalendar용 공휴일 이벤트 조회
    async getHolidayEvents(start, end) {
        try {
            const startDate = start.toISOString().split('T')[0];
            const endDate = end.toISOString().split('T')[0];

            const response = await fetch(
                `${API_BASE_URL}/api/v1/holidays/events?start=${startDate}&end=${endDate}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('공휴일 데이터 조회 실패:', error);
            return [];
        }
    },

    // 특정 날짜 공휴일 확인
    async checkHolidayStatus(date) {
        try {
            const dateStr = date.toISOString().split('T')[0];
            const response = await fetch(
                `${API_BASE_URL}/api/v1/holidays/check?date=${dateStr}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('공휴일 상태 확인 실패:', error);
            return { isHoliday: false, holidayName: null };
        }
    }
};