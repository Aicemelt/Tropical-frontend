/**
 * @fileoverview 일정 관리 API 클라이언트 모듈
 * @description 일정 CRUD API 호출 및 FullCalendar 연동을 위한 데이터 변환 유틸리티 제공
 * @author 신동준
 * @since 2025-09-17
 * @version 1.1.0
 * @lastModified 2025-09-19
 * @note 종일 일정 시간 처리 로직 추가 (00:00-23:59), 모든 구문 에러 수정
 * @dependencies apiMethods
 * @exports scheduleApi, scheduleUtils
 */

import { apiMethods } from './api.js';

/**
 * @description 일정 관리 API 클라이언트 객체
 * @author 신동준
 * @since 2025-09-17
 * @version 1.1.0
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
   * @version 1.1.0 - 종일 일정 시간 처리 로직 추가
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
   * @throws {Error} API 호출 실패 시
   * @example
   * await scheduleApi.create({
   *   title: '팀 회의',
   *   startDate: '2025-09-19',
   *   startTime: '14:00',
   *   endTime: '15:00',
   *   location: '회의실 A',
   *   memo: '주간 업무 보고'
   * });
   */
  create: async (scheduleData) => {
    const apiData = {
      title: scheduleData.title,
      memo: scheduleData.memo || '',
      scheduleDate: scheduleData.startDate || scheduleData.date,
      location: scheduleData.location || '',
      attendees: scheduleData.participants || scheduleData.attendees || '',
      startTime: scheduleData.isAllDay ? '00:00' : (scheduleData.startTime && scheduleData.startTime.trim() ? scheduleData.startTime : null),
      endTime: scheduleData.isAllDay ? '23:59' : (scheduleData.endTime && scheduleData.endTime.trim() ? scheduleData.endTime : null),
      isAllDay: scheduleData.isAllDay || false
    };

    if (!scheduleData.isAllDay) {
      if (apiData.startTime === '') apiData.startTime = null;
      if (apiData.endTime === '') apiData.endTime = null;
    }

    console.log('📅 일정 생성 API 호출:', apiData);

    try {
      const response = await apiMethods.post('/schedules', apiData);
      console.log('📅 일정 생성 응답:', response.data);

      // 생성 성공 시 해당 월의 캐시에 추가
      const scheduleDate = new Date(apiData.scheduleDate);
      const year = scheduleDate.getFullYear();
      const month = scheduleDate.getMonth() + 1;
      const cacheKey = `schedules_${year}_${month}`;

      try {
        const cachedData = localStorage.getItem(cacheKey);
        let existingSchedules = [];
        if (cachedData) {
          existingSchedules = JSON.parse(cachedData);
        }

        // 새 일정을 캐시에 추가
        const newScheduleForCache = {
          ...response.data,
          scheduleDate: apiData.scheduleDate
        };
        existingSchedules.push(newScheduleForCache);

        localStorage.setItem(cacheKey, JSON.stringify(existingSchedules));
        console.log('✅ 새 일정이 캐시에 저장됨');
      } catch (cacheError) {
        console.warn('캐시 저장 실패:', cacheError);
      }

      return response.data;
    } catch (error) {
      console.error('📅 일정 생성 실패:', error);
      throw error;
    }
  },

  /**
   * @description 특정 일정 조회
   * @author 신동준
   * @since 2025-09-17
   * @param {number|string} scheduleId - 조회할 일정 ID
   * @returns {Promise<Object>} 조회된 일정 데이터
   * @throws {Error} API 호출 실패 시
   * @example
   * const schedule = await scheduleApi.getById(123);
   */
  getById: async (scheduleId) => {
    console.log('📅 일정 조회 API 호출:', scheduleId);
    const response = await apiMethods.get(`/schedules/${scheduleId}`);
    console.log('📅 일정 조회 응답:', response.data);
    return response.data;
  },

  /**
   * @description 일정 수정
   * @author 신동준
   * @since 2025-09-17
   * @version 1.1.0 - 종일 일정 시간 처리 로직 추가
   * @param {number|string} scheduleId - 수정할 일정 ID
   * @param {Object} scheduleData - 수정할 일정 데이터 (create와 동일한 구조)
   * @returns {Promise<Object>} 수정된 일정 데이터
   * @throws {Error} API 호출 실패 시
   * @example
   * await scheduleApi.update(123, {
   *   title: '수정된 회의',
   *   startTime: '15:00'
   * });
   */
  update: async (scheduleId, scheduleData) => {
    const apiData = {
      title: scheduleData.title,
      memo: scheduleData.memo || '',
      scheduleDate: scheduleData.startDate || scheduleData.date,
      location: scheduleData.location || '',
      attendees: scheduleData.participants || scheduleData.attendees || '',
      startTime: scheduleData.isAllDay ? '00:00' : (scheduleData.startTime && scheduleData.startTime.trim() ? scheduleData.startTime : null),
      endTime: scheduleData.isAllDay ? '23:59' : (scheduleData.endTime && scheduleData.endTime.trim() ? scheduleData.endTime : null),
      isAllDay: scheduleData.isAllDay || false
    };

    if (!scheduleData.isAllDay) {
      if (apiData.startTime === '') apiData.startTime = null;
      if (apiData.endTime === '') apiData.endTime = null;
    }

    console.log('📅 일정 수정 API 호출:', scheduleId, apiData);

    try {
      const response = await apiMethods.put(`/schedules/${scheduleId}`, apiData);
      console.log('📅 일정 수정 응답:', response.data);

      // 수정 성공 시 해당 월의 캐시도 업데이트
      const scheduleDate = new Date(apiData.scheduleDate);
      const year = scheduleDate.getFullYear();
      const month = scheduleDate.getMonth() + 1;
      const cacheKey = `schedules_${year}_${month}`;

      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          let existingSchedules = JSON.parse(cachedData);

          // 기존 일정을 수정된 일정으로 교체
          existingSchedules = existingSchedules.map(schedule =>
            schedule.scheduleId === scheduleId
              ? { ...response.data, scheduleDate: apiData.scheduleDate }
              : schedule
          );

          localStorage.setItem(cacheKey, JSON.stringify(existingSchedules));
          console.log('✅ 수정된 일정이 캐시에 반영됨');
        }
      } catch (cacheError) {
        console.warn('캐시 업데이트 실패:', cacheError);
      }

      return response.data;
    } catch (error) {
      console.error('📅 일정 수정 실패:', error);
      throw error;
    }
  },

  /**
   * @description 일정 삭제
   * @author 신동준
   * @since 2025-09-17
   * @param {number|string} scheduleId - 삭제할 일정 ID
   * @returns {Promise<Object>} 삭제 결과
   * @throws {Error} API 호출 실패 시
   * @example
   * await scheduleApi.delete(123);
   */
  delete: async (scheduleId) => {
    console.log('📅 일정 삭제 API 호출:', scheduleId);

    try {
      const response = await apiMethods.delete(`/schedules/${scheduleId}`);
      console.log('📅 일정 삭제 응답:', response.data);

      // 삭제 성공 시 모든 월의 캐시에서 해당 일정 제거
      try {
        const currentYear = new Date().getFullYear();
        for (let month = 1; month <= 12; month++) {
          const cacheKey = `schedules_${currentYear}_${month}`;
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            let existingSchedules = JSON.parse(cachedData);
            const filteredSchedules = existingSchedules.filter(schedule =>
              schedule.scheduleId !== scheduleId
            );

            if (filteredSchedules.length !== existingSchedules.length) {
              localStorage.setItem(cacheKey, JSON.stringify(filteredSchedules));
              console.log(`✅ ${month}월 캐시에서 삭제된 일정 제거됨`);
            }
          }
        }
      } catch (cacheError) {
        console.warn('캐시에서 삭제 실패:', cacheError);
      }

      return response.data;
    } catch (error) {
      console.error('📅 일정 삭제 실패:', error);
      throw error;
    }
  },

  /**
   * @description 일정 완료/미완료 상태 토글
   * @author 신동준
   * @since 2025-09-17
   * @param {number|string} scheduleId - 상태를 변경할 일정 ID
   * @param {boolean} isCompleted - 완료 상태 (true: 완료, false: 미완료)
   * @returns {Promise<Object>} 업데이트된 일정 데이터
   * @throws {Error} API 호출 실패 시
   * @example
   * await scheduleApi.toggleComplete(123, true); // 완료로 변경
   * await scheduleApi.toggleComplete(123, false); // 미완료로 변경
   */
  toggleComplete: async (scheduleId, isCompleted) => {
    console.log('📅 일정 완료 상태 토글 API 호출:', scheduleId, isCompleted);
    const response = await apiMethods.put(`/schedules/${scheduleId}/complete`, {
      isCompleted
    });
    console.log('📅 일정 완료 상태 토글 응답:', response.data);
    return response.data;
  },

  /**
   * @description 월별 일정 조회 (캘린더용)
   * @author 신동준
   * @since 2025-09-17
   * @param {number} year - 조회할 연도 (예: 2025)
   * @param {number} month - 조회할 월 (1-12)
   * @returns {Promise<Array<Object>>} 해당 월의 일정 배열
   * @throws {Error} API 호출 실패 시
   * @example
   * const schedules = await scheduleApi.getByMonth(2025, 9);
   */
  getByMonth: async (year, month) => {
    console.log('📅 월별 일정 조회 API 호출:', year, month);

    const cacheKey = `schedules_${year}_${month}`;

    try {
      // 첫 번째 시도: 새로 추가된 월별 API 사용
      console.log('📅 시도 1/3: /schedules/month/{year}/{month} 엔드포인트');
      const response = await apiMethods.get(`/schedules/month/${year}/${month}`);
      console.log('✅ 월별 API 성공:', response.data);
      const schedules = response.data || [];

      // 성공 시 로컬 스토리지에 캐시
      localStorage.setItem(cacheKey, JSON.stringify(schedules));
      return schedules;
    } catch (error) {
      console.warn('❌ 월별 API 실패 (상태:', error.response?.status, '), 전체 조회로 재시도');

      try {
        // 두 번째 시도: 전체 일정 조회 후 클라이언트에서 필터링
        console.log('📅 시도 2/3: /schedules 전체 조회 후 필터링');
        const response = await apiMethods.get('/schedules');
        console.log('✅ 전체 조회 성공:', response.data);
        const allSchedules = response.data || [];

        // 클라이언트에서 월별 필터링
        const filteredSchedules = allSchedules.filter(schedule => {
          const scheduleDate = schedule.scheduleDate || schedule.date || schedule.startDate;
          if (!scheduleDate) return false;

          const date = new Date(scheduleDate);
          return date.getFullYear() === year && (date.getMonth() + 1) === month;
        });

        console.log(`✅ 클라이언트 필터링 완료: ${filteredSchedules.length}개 일정`);

        // 성공 시 로컬 스토리지에 캐시
        localStorage.setItem(cacheKey, JSON.stringify(filteredSchedules));
        return filteredSchedules;
      } catch (secondError) {
        console.warn('❌ 전체 조회도 실패 (상태:', secondError.response?.status, '), 로컬 캐시 확인');

        // 세 번째 시도: 로컬 스토리지에서 캐시된 데이터 사용
        try {
          console.log('📅 시도 3/3: 로컬 스토리지 캐시 사용');
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            const cachedSchedules = JSON.parse(cachedData);
            console.log(`✅ 캐시에서 복원: ${cachedSchedules.length}개 일정 (오프라인 모드)`);
            return cachedSchedules;
          } else {
            console.log('📦 캐시 데이터 없음');
          }
        } catch (cacheError) {
          console.warn('❌ 캐시 읽기 실패:', cacheError);
        }

        // 모든 방법이 실패한 경우
        console.error('❌ 모든 일정 조회 방법 실패');

        // 개발 모드에서는 더미 데이터 반환
        if (import.meta.env.DEV) {
          console.log('🧪 개발 모드: 더미 데이터 반환');
          const today = new Date();
          const dummySchedules = [
            {
              scheduleId: 999,
              title: '[개발모드] API 연결 테스트',
              scheduleDate: `${year}-${month.toString().padStart(2, '0')}-21`,
              startTime: '10:00',
              endTime: '11:00',
              memo: 'GET /schedules/month API 연결 테스트용 더미 데이터',
              location: '개발 환경',
              attendees: '',
              isAllDay: false,
              isCompleted: false
            }
          ];

          // 더미 데이터도 캐시에 저장
          localStorage.setItem(cacheKey, JSON.stringify(dummySchedules));
          return dummySchedules;
        }

        return [];
      }
    }
  },

  /**
   * @description 특정 날짜의 일정 조회
   * @author 신동준
   * @since 2025-09-17
   * @param {string} date - 조회할 날짜 (YYYY-MM-DD 형식)
   * @returns {Promise<Array<Object>>} 해당 날짜의 일정 배열
   * @throws {Error} API 호출 실패 시
   * @example
   * const schedules = await scheduleApi.getByDate('2025-09-19');
   */
  getByDate: async (date) => {
    console.log('📅 날짜별 일정 조회 API 호출:', date);
    try {
      const response = await apiMethods.get(`/schedules/date/${date}`);
      console.log('📅 날짜별 일정 조회 응답:', response.data);
      return response.data;
    } catch (error) {
      console.log('📅 날짜별 API 없음, 월별 조회 후 필터링 사용');
      const [year, month] = date.split('-');
      const monthData = await scheduleApi.getByMonth(parseInt(year), parseInt(month));
      return monthData.filter(schedule =>
        schedule.scheduleDate === date ||
        schedule.startDate === date ||
        schedule.date === date
      );
    }
  }
};

/**
 * @description 일정 데이터 변환 및 검증 유틸리티 객체
 * @author 신동준
 * @since 2025-09-17
 * @version 1.0.0
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
   * @param {string} [schedule.startTime] - 시작 시간 (선택사항)
   * @param {string} [schedule.endTime] - 종료 시간 (선택사항)
   * @param {boolean} schedule.isCompleted - 완료 상태
   * @returns {Object} FullCalendar 이벤트 객체
   * @example
   * const event = scheduleUtils.toFullCalendarEvent(schedule);
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
   * @param {Array<Object>} schedules - 일정 데이터 배열
   * @returns {Array<Object>} FullCalendar 이벤트 객체 배열
   * @example
   * const events = scheduleUtils.toFullCalendarEvents(schedules);
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
   * @example
   * const validation = scheduleUtils.validateScheduleData(data);
   * if (!validation.isValid) {
   *   console.log(validation.errors);
   * }
   */
  validateScheduleData: (data) => {
    const errors = {};

    if (!data.title?.trim()) {
      errors.title = '일정 제목을 입력해주세요.';
    }

    const dateField = data.startDate || data.date || data.scheduleDate;
    if (!dateField) {
      errors.date = '일정 날짜를 선택해주세요.';
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
   * @param {string|null} [date=null] - 기본 날짜 (YYYY-MM-DD 형식, null이면 오늘 날짜)
   * @returns {Object} 기본 일정 데이터 객체
   * @example
   * const defaultSchedule = scheduleUtils.createDefaultSchedule('2025-09-19');
   */
  createDefaultSchedule: (date = null) => ({
    title: '',
    memo: '',
    scheduleDate: date || new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    location: '',
    attendees: '',
  })
};
