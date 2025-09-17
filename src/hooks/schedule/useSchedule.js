import { useState, useCallback } from 'react';
import { scheduleApi, scheduleUtils } from '../../services/scheduleApi.js';

// 일정 관리 커스텀 훅
export const useSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 로딩 상태 관리
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

  // 새 일정 생성
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

  // 일정 조회
  const fetchSchedule = useCallback(async (scheduleId) => {
    return withLoading(async () => {
      const schedule = await scheduleApi.getById(scheduleId);
      setSelectedSchedule(schedule);
      return schedule;
    });
  }, [withLoading]);

  // 일정 수정
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

  // 일정 삭제
  const deleteSchedule = useCallback(async (scheduleId) => {
    return withLoading(async () => {
      await scheduleApi.delete(scheduleId);
      setSchedules(prev => prev.filter(schedule => schedule.scheduleId !== scheduleId));
      if (selectedSchedule?.scheduleId === scheduleId) {
        setSelectedSchedule(null);
      }
    });
  }, [withLoading, selectedSchedule]);

  // 일정 완료/미완료 토글
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

  // 월별 일정 조회
  const fetchSchedulesByMonth = useCallback(async (year, month) => {
    return withLoading(async () => {
      const monthSchedules = await scheduleApi.getByMonth(year, month);
      setSchedules(monthSchedules);
      return monthSchedules;
    });
  }, [withLoading]);

  // 특정 날짜 일정 조회
  const fetchSchedulesByDate = useCallback(async (date) => {
    return withLoading(async () => {
      const dateSchedules = await scheduleApi.getByDate(date);
      return dateSchedules;
    });
  }, [withLoading]);

  // FullCalendar 이벤트 형식으로 변환
  const getFullCalendarEvents = useCallback(() => {
    return scheduleUtils.toFullCalendarEvents(schedules);
  }, [schedules]);

  // 선택된 일정 초기화
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
