/**
 * @fileoverview 일정 관리 커스텀 훅 모듈
 * @description React 커스텀 훅을 통한 일정 CRUD 로직 및 상태 관리 제공
 * @author 신동준
 * @since 2025-09-17
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { scheduleApi, scheduleUtils } from '../../services/scheduleApi.js';

/**
 * @description 일정 관리를 위한 커스텀 훅
 * @author 신동준
 * @since 2025-09-17
 *
 * 주요 기능:
 * - 일정 CRUD 작업 (생성, 조회, 수정, 삭제)
 * - 일정 완료/미완료 상태 토글
 * - 월별/날짜별 일정 조회
 * - 로딩 및 에러 상태 관리
 * - FullCalendar 이벤트 형식 변환
 *
 * @returns {Object} 일정 관리 관련 상태 및 함수들
 */
export const useSchedule = () => {
  /**
   * @description 일정 목록 상태
   * @type {Array<Object>}
   */
  const [schedules, setSchedules] = useState([]);

  /**
   * @description 현재 선택된 일정 상태
   * @type {Object|null}
   */
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  /**
   * @description 로딩 상태
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);

  /**
   * @description 에러 상태
   * @type {string|null}
   */
  const [error, setError] = useState(null);

  /**
   * @description 에러 상태 초기화 함수
   * @author 신동준
   * @since 2025-09-17
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * @description 비동기 작업에 로딩 상태 관리를 적용하는 고차 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {Function} asyncFunction - 실행할 비동기 함수
   * @returns {Promise} 비동기 함수 실행 결과
   */
  const withLoading = useCallback(async (asyncFunction) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || '오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * @description 새 일정 생성 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {Object} scheduleData - 생성할 일정 데이터
   * @returns {Promise<Object>} 생성된 일정 데이터
   * @throws {Error} 유효성 검증 실패 또는 API 호출 실패 시
   */
  const createSchedule = useCallback(async (scheduleData) => {
    return withLoading(async () => {
      const validation = scheduleUtils.validateScheduleData(scheduleData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const newSchedule = await scheduleApi.create(scheduleData);
      setSchedules(prev => [...prev, newSchedule]);
      return newSchedule;
    });
  }, [withLoading]);

  /**
   * @description 특정 일정 조회 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 조회할 일정 ID
   * @returns {Promise<Object>} 조회된 일정 데이터
   */
  const fetchSchedule = useCallback(async (scheduleId) => {
    return withLoading(async () => {
      const schedule = await scheduleApi.getById(scheduleId);
      setSelectedSchedule(schedule);
      return schedule;
    });
  }, [withLoading]);

  /**
   * @description 일정 수정 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 수정할 일정 ID
   * @param {Object} scheduleData - 수정할 일정 데이터
   * @returns {Promise<Object>} 수정된 일정 데이터
   * @throws {Error} 유효성 검증 실패 또는 API 호출 실패 시
   */
  const updateSchedule = useCallback(async (scheduleId, scheduleData) => {
    return withLoading(async () => {
      const validation = scheduleUtils.validateScheduleData(scheduleData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const updatedSchedule = await scheduleApi.update(scheduleId, scheduleData);
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.scheduleId === scheduleId ? updatedSchedule : schedule
        )
      );
      setSelectedSchedule(updatedSchedule);
      return updatedSchedule;
    });
  }, [withLoading]);

  /**
   * @description 일정 삭제 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 삭제할 일정 ID
   * @returns {Promise<void>}
   */
  const deleteSchedule = useCallback(async (scheduleId) => {
    return withLoading(async () => {
      await scheduleApi.delete(scheduleId);
      setSchedules(prev => prev.filter(schedule => schedule.scheduleId !== scheduleId));
      if (selectedSchedule?.scheduleId === scheduleId) {
        setSelectedSchedule(null);
      }
    });
  }, [withLoading, selectedSchedule]);

  /**
   * @description 일정 완료/미완료 상태 토글 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 상태를 변경할 일정 ID
   * @param {boolean} isCompleted - 완료 상태 (true: 완료, false: 미완료)
   * @returns {Promise<Object>} 업데이트된 일정 데이터
   */
  const toggleScheduleComplete = useCallback(async (scheduleId, isCompleted) => {
    return withLoading(async () => {
      const updatedSchedule = await scheduleApi.toggleComplete(scheduleId, isCompleted);
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.scheduleId === scheduleId ? updatedSchedule : schedule
        )
      );
      if (selectedSchedule?.scheduleId === scheduleId) {
        setSelectedSchedule(updatedSchedule);
      }
      return updatedSchedule;
    });
  }, [withLoading, selectedSchedule]);

  /**
   * @description 월별 일정 조회 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {number} year - 조회할 연도
   * @param {number} month - 조회할 월 (1-12)
   * @returns {Promise<Array>} 해당 월의 일정 배열
   */
  const fetchSchedulesByMonth = useCallback(async (year, month) => {
    return withLoading(async () => {
      const monthSchedules = await scheduleApi.getByMonth(year, month);
      setSchedules(monthSchedules);
      return monthSchedules;
    });
  }, [withLoading]);

  /**
   * @description 특정 날짜 일정 조회 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {string} date - 조회할 날짜 (YYYY-MM-DD 형식)
   * @returns {Promise<Array>} 해당 날짜의 일정 배열
   */
  const fetchSchedulesByDate = useCallback(async (date) => {
    return withLoading(async () => {
      const dateSchedules = await scheduleApi.getByDate(date);
      return dateSchedules;
    });
  }, [withLoading]);

  /**
   * @description 특정 날짜 일정 조회 함수 (별칭)
   * @author 신동준
   * @since 2025-09-19
   * @param {string} date - 조회할 날짜 (YYYY-MM-DD 형식)
   * @returns {Promise<Array>} 해당 날짜의 일정 배열
   */
  const getSchedulesByDate = useCallback(async (date) => {
    return fetchSchedulesByDate(date);
  }, [fetchSchedulesByDate]);

  /**
   * @description 현재 일정 목록을 FullCalendar 이벤트 형식으로 변환
   * @author 신동준
   * @since 2025-09-17
   * @returns {Array} FullCalendar 이벤트 객체 배열
   */
  const getFullCalendarEvents = useCallback(() => {
    return scheduleUtils.toFullCalendarEvents(schedules);
  }, [schedules]);

  /**
   * @description 선택된 일정 초기화 함수
   * @author 신동준
   * @since 2025-09-17
   */
  const clearSelectedSchedule = useCallback(() => {
    setSelectedSchedule(null);
  }, []);

  /**
   * @description 훅에서 반환하는 객체
   * @author 신동준
   * @since 2025-09-17
   *
   * @returns {Object} 일정 관리 관련 상태 및 함수들
   * @returns {Array} returns.schedules - 일정 목록
   * @returns {Object|null} returns.selectedSchedule - 선택된 일정
   * @returns {boolean} returns.loading - 로딩 상태
   * @returns {string|null} returns.error - 에러 메시지
   * @returns {Function} returns.createSchedule - 일정 생성 함수
   * @returns {Function} returns.fetchSchedule - 일정 조회 함수
   * @returns {Function} returns.updateSchedule - 일정 수정 함수
   * @returns {Function} returns.deleteSchedule - 일정 삭제 함수
   * @returns {Function} returns.toggleScheduleComplete - 완료 상태 토글 함수
   * @returns {Function} returns.fetchSchedulesByMonth - 월별 일정 조회 함수
   * @returns {Function} returns.fetchSchedulesByDate - 날짜별 일정 조회 함수
   * @returns {Function} returns.getFullCalendarEvents - FullCalendar 이벤트 변환 함수
   * @returns {Function} returns.clearSelectedSchedule - 선택된 일정 초기화 함수
   * @returns {Function} returns.clearError - 에러 초기화 함수
   * @returns {Object} returns.utils - 일정 유틸리티 함수들
   */
  return {
    // 상태
    schedules,
    selectedSchedule,
    loading,
    error,

    // 액션
    createSchedule,
    fetchSchedule,
    updateSchedule,
    deleteSchedule,
    toggleScheduleComplete,
    fetchSchedulesByMonth,
    fetchSchedulesByDate,
    getFullCalendarEvents,
    clearSelectedSchedule,
    clearError,

    // 유틸리티
    utils: scheduleUtils,
  };
};
