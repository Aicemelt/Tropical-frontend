import { apiMethods } from './api.js';

// 일정 API 클라이언트
export const scheduleApi = {
  // 새 일정 생성
  create: async (scheduleData) => {
    const response = await apiMethods.post('/schedules', scheduleData);
    return response.data;
  },

  // 특정 일정 조회
  getById: async (scheduleId) => {
    const response = await apiMethods.get(`/schedules/${scheduleId}`);
    return response.data;
  },

  // 일정 수정
  update: async (scheduleId, scheduleData) => {
    const response = await apiMethods.put(`/schedules/${scheduleId}`, scheduleData);
    return response.data;
  },

  // 일정 삭제
  delete: async (scheduleId) => {
    const response = await apiMethods.delete(`/schedules/${scheduleId}`);
    return response.data;
  },

  // 일정 완료/미완료 토글
  toggleComplete: async (scheduleId, isCompleted) => {
    const response = await apiMethods.put(`/schedules/${scheduleId}/complete`, {
      isCompleted
    });
    return response.data;
  },

  // 월별 일정 조회 (캘린더용)
  getByMonth: async (year, month) => {
    const response = await apiMethods.get(`/calendar?year=${year}&month=${month}`);
    return response.data.schedules || [];
  },

  // 특정 날짜의 일정 조회
  getByDate: async (date) => {
    // date는 'YYYY-MM-DD' 형식
    const [year, month] = date.split('-');
    const monthData = await scheduleApi.getByMonth(year, month);
    return monthData.filter(schedule => schedule.scheduleDate === date);
  },
};

// 일정 데이터 변환 유틸리티
export const scheduleUtils = {
  // FullCalendar 이벤트 형식으로 변환
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

  // FullCalendar 이벤트 배열로 변환
  toFullCalendarEvents: (schedules) => {
    return schedules.map(schedule => scheduleUtils.toFullCalendarEvent(schedule));
  },

  // 폼 데이터 검증
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

  // 기본 일정 데이터 생성
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
