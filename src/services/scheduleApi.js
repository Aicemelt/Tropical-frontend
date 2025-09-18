/**
 * @fileoverview 일정 관리 API 클라이언트 모듈
 * @description 일정 CRUD API 호출 및 FullCalendar 연동을 위한 데이터 변환 유틸리티 제공
 * @author 신동준
 * @since 2025-09-17
 * @version 1.0.0
 */

import { apiMethods } from './api.js';

/**
 * @description 일정 관리 API 클라이언트 객체
 * @author 신동준
 * @since 2025-09-17
 *
 * 백엔드 API 엔드포인트:
 * - POST /schedules - 일정 생성
 * - GET /schedules/{scheduleId} - 특정 일정 조회
 * - PUT /schedules/{scheduleId} - 일정 수정
 * - DELETE /schedules/{scheduleId} - 일정 삭제
 * - PUT /schedules/{scheduleId}/complete - 일정 완료/미완료 토글
 * - GET /calendar?year={year}&month={month} - 월별 일정 조회
 */
export const scheduleApi = {
  /**
   * @description 새 일정 생성
   * @author 신동준
   * @since 2025-09-17
   * @param {Object} scheduleData - 일정 데이터
   * @param {string} scheduleData.title - 일정 제목
   * @param {string} scheduleData.memo - 일정 메모
   * @param {string} scheduleData.scheduleDate - 일정 날짜 (YYYY-MM-DD)
   * @param {string} scheduleData.startTime - 시작 시간 (HH:MM)
   * @param {string} scheduleData.endTime - 종료 시간 (HH:MM)
   * @param {string} scheduleData.location - 장소
   * @param {string} scheduleData.attendees - 참여자
   * @returns {Promise<Object>} 생성된 일정 데이터
   */
  create: async (scheduleData) => {
    const response = await apiMethods.post('/schedules', scheduleData);
    return response.data;
  },

  /**
   * @description 특정 일정 조회
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 일정 ID
   * @returns {Promise<Object>} 일정 데이터
   */
  getById: async (scheduleId) => {
    const response = await apiMethods.get(`/schedules/${scheduleId}`);
    return response.data;
  },

  /**
   * @description 일정 수정
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 일정 ID
   * @param {Object} scheduleData - 수정할 일정 데이터
   * @returns {Promise<Object>} 수정된 일정 데이터
   */
  update: async (scheduleId, scheduleData) => {
    const response = await apiMethods.put(`/schedules/${scheduleId}`, scheduleData);
    return response.data;
  },

  /**
   * @description 일정 삭제
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 일정 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  delete: async (scheduleId) => {
    const response = await apiMethods.delete(`/schedules/${scheduleId}`);
    return response.data;
  },

  /**
   * @description 일정 완료/미완료 상태 토글
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 일정 ID
   * @param {boolean} isCompleted - 완료 상태 (true: 완료, false: 미완료)
   * @returns {Promise<Object>} 업데이트된 일정 데이터
   */
  toggleComplete: async (scheduleId, isCompleted) => {
    const response = await apiMethods.put(`/schedules/${scheduleId}/complete`, {
      isCompleted
    });
    return response.data;
  },

  /**
   * @description 월별 일정 조회 (캘린더용)
   * @author 신동준
   * @since 2025-09-17
   * @param {number} year - 조회할 연도
   * @param {number} month - 조회할 월 (1-12)
   * @returns {Promise<Array>} 해당 월의 일정 배열
   */
  getByMonth: async (year, month) => {
    const response = await apiMethods.get(`/calendar?year=${year}&month=${month}`);
    return response.data.schedules || [];
  },

  /**
   * @description 특정 날짜의 일정 조회
   * @author 신동준
   * @since 2025-09-17
   * @param {string} date - 조회할 날짜 (YYYY-MM-DD 형식)
   * @returns {Promise<Array>} 해당 날짜의 일정 배열
   */
  getByDate: async (date) => {
    // date는 'YYYY-MM-DD' 형식
    const [year, month] = date.split('-');
    const monthData = await scheduleApi.getByMonth(year, month);
    return monthData.filter(schedule => schedule.scheduleDate === date);
  },
};

/**
 * @description 일정 데이터 변환 및 검증 유틸리티 객체
 * @author 신동준
 * @since 2025-09-17
 *
 * 주요 기능:
 * - FullCalendar 이벤트 형식으로 데이터 변환
 * - 일정 데이터 유효성 검증
 * - 기본 일정 데이터 생성
 */
export const scheduleUtils = {
  /**
   * @description 일정 데이터를 FullCalendar 이벤트 형식으로 변환
   * @author 신동준
   * @since 2025-09-17
   * @param {Object} schedule - 일정 데이터
   * @param {number} schedule.scheduleId - 일정 ID
   * @param {string} schedule.title - 일정 제목
   * @param {string} schedule.scheduleDate - 일정 날짜
   * @param {string} schedule.startTime - 시작 시간 (선택사항)
   * @param {string} schedule.endTime - 종료 시간 (선택사항)
   * @param {boolean} schedule.isCompleted - 완료 상태
   * @returns {Object} FullCalendar 이벤트 객체
   */
  toFullCalendarEvent: (schedule) => ({
    id: schedule.scheduleId,
    title: schedule.title,
    start: schedule.startTime
      ? `${schedule.scheduleDate}T${schedule.startTime}`
      : schedule.scheduleDate,
    end: schedule.endTime
      ? `${schedule.scheduleDate}T${schedule.endTime}`
      : null,
    allDay: !schedule.startTime && !schedule.endTime,
    backgroundColor: schedule.isCompleted ? '#28a745' : '#007bff',
    borderColor: schedule.isCompleted ? '#28a745' : '#007bff',
    textColor: '#ffffff',
    extendedProps: {
      memo: schedule.memo,
      location: schedule.location,
      attendees: schedule.attendees,
      isCompleted: schedule.isCompleted,
    },
  }),

  /**
   * @description 일정 배열을 FullCalendar 이벤트 배열로 변환
   * @author 신동준
   * @since 2025-09-17
   * @param {Array} schedules - 일정 데이터 배열
   * @returns {Array} FullCalendar 이벤트 객체 배열
   */
  toFullCalendarEvents: (schedules) => {
    return schedules.map(schedule => scheduleUtils.toFullCalendarEvent(schedule));
  },

  /**
   * @description 일정 데이터 유효성 검증
   * @author 신동준
   * @since 2025-09-17
   * @param {Object} data - 검증할 일정 데이터
   * @returns {Object} 검증 결과 객체
   * @returns {boolean} returns.isValid - 유효성 검증 통과 여부
   * @returns {Object} returns.errors - 에러 메시지 객체 (필드명: 에러메시지)
   */
  validateScheduleData: (data) => {
    const errors = {};

    if (!data.title?.trim()) {
      errors.title = '일정 제목을 입력해주세요.';
    }

    if (!data.scheduleDate) {
      errors.scheduleDate = '일정 날짜를 선택해주세요.';
    }

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * @description 기본 일정 데이터 객체 생성
   * @author 신동준
   * @since 2025-09-17
   * @param {string|null} date - 기본 날짜 (YYYY-MM-DD 형식, null이면 오늘 날짜)
   * @returns {Object} 기본 일정 데이터 객체
   */
  createDefaultSchedule: (date = null) => ({
    title: '',
    memo: '',
    scheduleDate: date || new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    location: '',
    attendees: '',
  }),
};
