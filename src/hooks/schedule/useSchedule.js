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
   * @version 1.3.0 - 2025-09-22 중복 생성 방지 강화
   * @param {Object} scheduleData - 생성할 일정 데이터
   * @param {string} scheduleData.title - 일정 제목 (필수)
   * @param {string} scheduleData.startDate - 시작 날짜 YYYY-MM-DD (필수)
   * @param {string} [scheduleData.startTime] - 시작 시간 HH:MM (선택)
   * @param {string} [scheduleData.endTime] - 종료 시간 HH:MM (선택)
   * @param {boolean} [scheduleData.isAllDay=false] - 종일 일정 여부
   * @param {string} [scheduleData.location] - 장소
   * @param {string} [scheduleData.memo] - 메모
   * @param {string} [scheduleData.attendees] - 참여자
   * @returns {Promise<Object>} 생성된 일정 데이터
   * @throws {Error} 유효성 검증 실패 또는 API 호출 실패 시
   */
  const createSchedule = useCallback(async (scheduleData) => {
    return withLoading(async () => {
      try {
        const validation = scheduleUtils.validateScheduleData(scheduleData);
        if (!validation.isValid) {
          throw new Error(Object.values(validation.errors)[0]);
        }

        console.log('📅 일정 생성 API 호출:', scheduleData);
        const newSchedule = await scheduleApi.create(scheduleData);
        console.log('📅 일정 생성 성공:', newSchedule);

        // 상태 업데이트를 한 번만 수행
        if (newSchedule && (newSchedule.id || newSchedule.scheduleId)) {
          const scheduleId = newSchedule.id || newSchedule.scheduleId;

          setSchedules(prev => {
            // 중복 방지: 이미 존재하는지 체크
            const exists = prev.some(schedule =>
              schedule.id === scheduleId ||
              schedule.scheduleId === scheduleId ||
              schedule.schedule_id === scheduleId
            );

            if (exists) {
              console.log('📅 이미 존재하는 일정, 업데이트:', scheduleId);
              return prev.map(schedule =>
                (schedule.id === scheduleId || schedule.scheduleId === scheduleId || schedule.schedule_id === scheduleId)
                  ? newSchedule
                  : schedule
              );
            }

            console.log('📅 새 일정 추가:', scheduleId);
            return [...prev, newSchedule];
          });
        }

        return newSchedule;
      } catch (error) {
        console.error('📅 일정 생성 실패:', error);
        throw error; // 에러 발생 시 재조회 로직 제거 (중복 방지)
      }
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
   * @version 1.2.0 - 2025-09-22 상태 업데이트 로직 개선
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
    // 1. 낙관적 업데이트: UI를 먼저 업데이트
    let originalSchedules = [];
    setSchedules(prev => {
      originalSchedules = prev;
      return prev.map(schedule => {
        // ID 매칭 로직 개선
        const isMatch = schedule.id == scheduleId ||
                       schedule.scheduleId == scheduleId ||
                       schedule.schedule_id == scheduleId;

        if (isMatch) {
          console.log('🎯 즉시 UI 업데이트 (수정):', schedule.title, '→', scheduleData.title);
          // 기존 데이터와 새 데이터 병합
          return {
            ...schedule,
            ...scheduleData,
            id: schedule.id || schedule.scheduleId || schedule.schedule_id,
            scheduleId: schedule.scheduleId || schedule.id,
            schedule_id: schedule.schedule_id || schedule.id
          };
        }
        return schedule;
      });
    });

    // 2. API 호출
    try {
      const validation = scheduleUtils.validateScheduleData(scheduleData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      console.log('📅 일정 수정 API 호출:', { scheduleId, scheduleData });
      const updatedSchedule = await scheduleApi.update(scheduleId, scheduleData);
      console.log('📅 일정 수정 API 성공:', updatedSchedule);

      // 3. API 성공 시 정확한 데이터로 다시 업데이트
      if (updatedSchedule) {
        setSchedules(prev =>
          prev.map(schedule => {
            const isMatch = schedule.id == scheduleId ||
                           schedule.scheduleId == scheduleId ||
                           schedule.schedule_id == scheduleId;
            return isMatch ? updatedSchedule : schedule;
          })
        );

        if (selectedSchedule && (
          selectedSchedule.id == scheduleId ||
          selectedSchedule.scheduleId == scheduleId ||
          selectedSchedule.schedule_id == scheduleId
        )) {
          setSelectedSchedule(updatedSchedule);
        }
      }

      return updatedSchedule;
    } catch (error) {
      console.error('📅 일정 수정 API 실패:', error);
      // 4. 실패 시 원래 상태로 복구
      setSchedules(originalSchedules);
      console.log('🔄 API 실패, 수정 상태를 원래대로 복구했습니다.');
      throw error;
    }
  }, [selectedSchedule]);

  /**
   * @description 일정 삭제 함수 (API 통신만 담당)
   * @author 신동준
   * @since 2025-09-17
   * @version 2.0.0 - 2025-09-22 책임 분리: API 통신만 담당, 상태 관리는 컴포넌트에서 처리
   * @param {number|string} scheduleId - 삭제할 일정 ID
   * @returns {Promise<void>}
   * @throws {Error} API 호출 실패 시
   * @example
   * await deleteSchedule(123);
   */
  const deleteSchedule = useCallback(async (scheduleId) => {
    console.log('🗑️ 일정 삭제 API 호출 시작:', scheduleId);

    try {
      // 오직 API 통신만 담당 - 상태 관리는 컴포넌트에서 처리
      await scheduleApi.delete(scheduleId);
      console.log('✅ 일정 삭제 API 성공:', scheduleId);
    } catch (error) {
      console.error('❌ 일정 삭제 API 실패:', error);
      throw error;
    }
  }, []); // 의존성 없음 - 순수한 API 호출 함수

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
   * 월별 일정 조회 함수 (로컬 캐시 기반)
   * @author 신동준
   * @since 2025-09-17
   * @version 1.4.0 - 2025-09-22 강제 새로고침 기능 추가
   * @param {number} year - 조회할 년도
   * @param {number} month - 조회할 월 (1-12)
   * @param {boolean} forceRefresh - 캐시 무시하고 강제 새로고침 여부
   * @returns {Promise<Array<Object>>} 월별 일정 배열
   * @example
   * const schedules = await fetchSchedulesByMonth(2025, 9, true); // 강제 새로고침
   */
  const fetchSchedulesByMonth = useCallback(async (year, month, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📥 일정 조회 시작: ${year}년 ${month}월 ${forceRefresh ? '(강제 새로고침)' : '(로컬 캐시 기반)'}`);

      // 강제 새로고침 시 상태 초기화
      if (forceRefresh) {
        console.log('🔄 강제 새로고침: 기존 상태 초기화');
        setSchedules([]);
      }

      const monthSchedules = await scheduleApi.getByMonth(year, month, forceRefresh);

      if (Array.isArray(monthSchedules)) {
        setSchedules(monthSchedules);
        console.log(`✅ 일정 조회 성공: ${monthSchedules.length}개 ${forceRefresh ? '(새로고침 완료)' : ''}`);
      } else {
        console.warn('⚠️ 응답이 배열이 아닙니다:', monthSchedules);
        setSchedules([]);
      }

      return monthSchedules || [];
    } catch (err) {
      console.error('❌ 월별 일정 조회 실패:', err);

      // 백엔드 API 없음을 사용자에게 알림
      let errorMessage = '월별 일정 조회 기능이 아직 구현되지 않았습니다.';

      if (err.response?.status === 405) {
        errorMessage = '백엔드에 월별 조회 API가 구현되지 않았습니다. 개발 모드로 사용하세요.';
      } else if (err.response?.status === 500) {
        errorMessage = '서버에 일시적인 문제가 발생했습니다.';
      } else if (err.message?.includes('Network') || err.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      }

      setError(errorMessage);

      // 에러 발생 시에도 더미 데이터 로드 (개발 모드)
      if (import.meta.env.DEV) {
        console.log('🧪 개발 모드: 에러 발생해도 더미 데이터 로드');
        try {
          const fallbackSchedules = await scheduleApi.getByMonth(year, month, forceRefresh);
          setSchedules(fallbackSchedules);
          console.log(`📦 더미 데이터 로드 완료: ${fallbackSchedules.length}개`);
          return fallbackSchedules;
        } catch (fallbackError) {
          console.warn('더미 데이터 로드도 실패:', fallbackError);
        }
      }

      setSchedules([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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
    // 상태 조작 함수 (완료 토글 최적화용)
    setSchedules,
    // 유틸리티
    utils: scheduleUtils,
  };
};
