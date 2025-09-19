/**
 * @fileoverview 일정 관리 커스텀 훅 모듈
 * @description React 커스텀 훅을 통한 일정 CRUD 로직 및 상태 관리 제공
 * @author 신동준
 * @since 2025-09-17
 * @version 1.0.0
 * @lastModified 2025-09-19
 * @dependencies scheduleApi, scheduleUtils
 * @exports useSchedule
 */

import { useState, useCallback } from 'react';
import { scheduleApi, scheduleUtils } from '../../services/scheduleApi.js';

/**
 * @description 일정 관리를 위한 커스텀 훅
 * @author 신동준
 * @since 2025-09-17
 * @version 1.0.0
 *
 * @returns {Object} 일정 관리 관련 상태 및 함수들
 * @returns {Array} returns.schedules - 일정 목록 배열
 * @returns {Object|null} returns.selectedSchedule - 현재 선택된 일정
 * @returns {boolean} returns.loading - 로딩 상태
 * @returns {string|null} returns.error - 에러 메시지
 * @returns {Function} returns.createSchedule - 일정 생성 함수
 * @returns {Function} returns.fetchSchedule - 특정 일정 조회 함수
 * @returns {Function} returns.updateSchedule - 일정 수정 함수
 * @returns {Function} returns.deleteSchedule - 일정 삭제 함수
 * @returns {Function} returns.toggleScheduleComplete - 일정 완료 상태 토글 함수
 * @returns {Function} returns.fetchSchedulesByMonth - 월별 일정 조회 함수
 * @returns {Function} returns.fetchSchedulesByDate - 날짜별 일정 조회 함수
 * @returns {Function} returns.getFullCalendarEvents - FullCalendar 이벤트 변환 함수
 * @returns {Function} returns.clearSelectedSchedule - 선택된 일정 초기화 함수
 * @returns {Function} returns.clearError - 에러 초기화 함수
 * @returns {Object} returns.utils - 일정 유틸리티 함수들
 *
 * @example
 * const {
 *   schedules,
 *   loading,
 *   error,
 *   createSchedule,
 *   fetchSchedulesByMonth
 * } = useSchedule();
 *
 * // 새 일정 생성
 * await createSchedule({
 *   title: '회의',
 *   startDate: '2025-09-19',
 *   startTime: '14:00',
 *   endTime: '15:00'
 * });
 *
 * // 월별 일정 조회
 * await fetchSchedulesByMonth(2025, 9);
 */
export const useSchedule = () => {
  /**
   * @description 일정 목록 상태
   * @type {Array<Object>}
   * @default []
   */
  const [schedules, setSchedules] = useState([]);

  /**
   * @description 현재 선택된 일정 상태
   * @type {Object|null}
   * @default null
   */
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  /**
   * @description 로딩 상태
   * @type {boolean}
   * @default false
   */
  const [loading, setLoading] = useState(false);

  /**
   * @description 에러 상태
   * @type {string|null}
   * @default null
   */
  const [error, setError] = useState(null);

  /**
   * @description 에러 상태 초기화 함수
   * @author 신동준
   * @since 2025-09-17
   * @returns {void}
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * @description 비동기 작업에 로딩 상태 관리를 적용하는 고차 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {Function} asyncFunction - 실행할 비동기 함수
   * @returns {Promise<any>} 비동기 함수 실행 결과
   * @throws {Error} 비동기 함수 실행 중 발생한 에러
   */
  const withLoading = useCallback(async (asyncFunction) => {
    setLoading(true);
    setError(null);
    try {
      return await asyncFunction();
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
   * @version 1.1.0 - 2025-09-19 500 에러 방지 로직 추가
   * @param {Object} scheduleData - 생성할 일정 데이터
   * @param {string} scheduleData.title - 일정 제목 (필수)
   * @param {string} scheduleData.startDate - 시작 날짜 YYYY-MM-DD (필수)
   * @param {string} [scheduleData.startTime] - 시작 시간 HH:MM (선택)
   * @param {string} [scheduleData.endTime] - 종료 시간 HH:MM (선택)
   * @param {boolean} [scheduleData.isAllDay=false] - 종일 일정 여부
   * @param {string} [scheduleData.location] - 장소
   * @param {string} [scheduleData.memo] - 메모
   * @param {string} [scheduleData.participants] - 참여자
   * @returns {Promise<Object>} 생성된 일정 데이터
   * @throws {Error} 유효성 검증 실패 또는 API 호출 실패 시
   * @example
   * await createSchedule({
   *   title: '팀 회의',
   *   startDate: '2025-09-19',
   *   startTime: '14:00',
   *   endTime: '15:00',
   *   location: '회의실 A',
   *   memo: '주간 업무 보고'
   * });
   */
  const createSchedule = useCallback(async (scheduleData) => {
    return withLoading(async () => {
      const validation = scheduleUtils.validateScheduleData(scheduleData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const newSchedule = await scheduleApi.create(scheduleData);

      // 생성 후 재조회 로직을 간소화하여 500 에러 방지
      try {
        // 단순히 새로 생성된 일정을 리스트에 추가
        setSchedules(prev => [...prev, newSchedule]);
      } catch (refreshError) {
        console.warn('일정 상태 업데이트 실패:', refreshError);
      }

      return newSchedule;
    });
  }, [withLoading]);

  /**
   * @description 특정 일정 조회 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {number|string} scheduleId - 조회할 일정 ID
   * @returns {Promise<Object>} 조회된 일정 데이터
   * @throws {Error} API 호출 실패 시
   * @example
   * const schedule = await fetchSchedule(123);
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
   * @param {number|string} scheduleId - 수정할 일정 ID
   * @param {Object} scheduleData - 수정할 일정 데이터 (createSchedule과 동일한 구조)
   * @returns {Promise<Object>} 수정된 일정 데이터
   * @throws {Error} 유효성 검증 실패 또는 API 호출 실패 시
   * @example
   * await updateSchedule(123, {
   *   title: '수정된 회의',
   *   startTime: '15:00'
   * });
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
   * @param {number|string} scheduleId - 삭제할 일정 ID
   * @returns {Promise<void>}
   * @throws {Error} API 호출 실패 시
   * @example
   * await deleteSchedule(123);
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
   * @param {number|string} scheduleId - 상태를 변경할 일정 ID
   * @param {boolean} isCompleted - 완료 상태 (true: 완료, false: 미완료)
   * @returns {Promise<Object>} 업데이트된 일정 데이터
   * @throws {Error} API 호출 실패 시
   * @example
   * await toggleScheduleComplete(123, true); // 완료로 변경
   * await toggleScheduleComplete(123, false); // 미완료로 변경
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
   * @description 월별 일정 조회 함수 (캘린더용)
   * @author 신동준
   * @since 2025-09-17
   * @param {number} year - 조회할 연도 (예: 2025)
   * @param {number} month - 조회할 월 (1-12)
   * @returns {Promise<Array<Object>>} 해당 월의 일정 배열
   * @throws {Error} API 호출 실패 시
   * @example
   * const schedules = await fetchSchedulesByMonth(2025, 9);
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
   * @returns {Promise<Array<Object>>} 해당 날짜의 일정 배열
   * @throws {Error} API 호출 실패 시
   * @example
   * const schedules = await fetchSchedulesByDate('2025-09-19');
   */
  const fetchSchedulesByDate = useCallback(async (date) => {
    return withLoading(async () => {
      return await scheduleApi.getByDate(date);
    });
  }, [withLoading]);

  /**
   * @description 현재 일정 목록을 FullCalendar 이벤트 형식으로 변환
   * @author 신동준
   * @since 2025-09-17
   * @returns {Array<Object>} FullCalendar 이벤트 객체 배열
   * @example
   * const calendarEvents = getFullCalendarEvents();
   */
  const getFullCalendarEvents = useCallback(() => {
    return scheduleUtils.toFullCalendarEvents(schedules);
  }, [schedules]);

  /**
   * @description 선택된 일정 초기화 함수
   * @author 신동준
   * @since 2025-09-17
   * @returns {void}
   * @example
   * clearSelectedSchedule();
   */
  const clearSelectedSchedule = useCallback(() => {
    setSelectedSchedule(null);
  }, []);

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
