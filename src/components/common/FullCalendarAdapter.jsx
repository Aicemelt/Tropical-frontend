/**
 * @fileoverview FullCalendar와 일정/일기 데이터 연동을 위한 어댑터
 * @description 기존 useSchedule.js 훅과 호환되며 팀원 Calendar.jsx와 완벽 연동
 * @author 신동준
 * @since 2025-09-21
 * @version 1.0.0
 *
 * 주요 기능:
 * - 일정/일기 데이터 → FullCalendar 이벤트 자동 변환
 * - 날짜 클릭 시 시작날짜 자동 고정
 * - 이벤트 클릭, 월 변경 등 모든 이벤트 처리
 * - 기존 useSchedule 훅과 완벽 호환
 * - 팀원 Calendar.jsx와 즉시 연동 가능
 */

import { useCallback } from 'react';

/**
 * 일정 데이터를 FullCalendar 이벤트로 변환
 *
 * @param {Array} schedules - 일정 데이터 배열
 * @returns {Array} FullCalendar 이벤트 배열
 */
const mapSchedulesToEvents = (schedules = []) => {
  return schedules.map(schedule => {
    // 종일 일정 여부 판단 (00:00-23:59 또는 시간이 없는 경우)
    const isAllDay = !schedule.startTime || !schedule.endTime ||
                     (schedule.startTime === '00:00' && schedule.endTime === '23:59');

    return {
      id: `schedule-${schedule.id}`,
      title: schedule.title,
      start: isAllDay ? schedule.date : `${schedule.date}T${schedule.startTime}`,
      end: isAllDay ? schedule.date : `${schedule.date}T${schedule.endTime}`,
      allDay: isAllDay,
      backgroundColor: '#4A90E2',
      borderColor: '#357ABD',
      textColor: '#FFFFFF',
      className: 'schedule-event',
      extendedProps: {
        type: 'schedule',
        originalData: schedule,
        description: schedule.description,
        location: schedule.location
      }
    };
  });
};

/**
 * 일기 데이터를 FullCalendar 이벤트로 변환
 *
 * @param {Array} diaries - 일기 데이터 배열
 * @returns {Array} FullCalendar 이벤트 배열
 */
const mapDiariesToEvents = (diaries = []) => {
  return diaries.map(diary => ({
    id: `diary-${diary.id}`,
    title: `📔 ${diary.title || '일기'}`,
    start: diary.date,
    allDay: true,
    backgroundColor: '#E67E22',
    borderColor: '#D35400',
    textColor: '#FFFFFF',
    className: 'diary-event',
    extendedProps: {
      type: 'diary',
      originalData: diary,
      content: diary.content,
      emotion: diary.emotion
    }
  }));
};

/**
 * FullCalendar 어댑터 훅
 * 기존 일정/일기 데이터와 팀원 Calendar.jsx를 연동하는 모든 기능을 제공
 *
 * @param {Object} options - 어댑터 옵션
 * @param {Array} options.schedules - 일정 데이터 배열
 * @param {Array} options.diaries - 일기 데이터 배열
 * @param {Function} options.onDateSelect - 날짜 선택 콜백
 * @param {Function} options.onEventUpdate - 이벤트 업데이트 콜백
 * @param {Function} options.onMonthChange - 월 변경 콜백
 * @returns {Object} FullCalendar 설정 객체 및 이벤트 핸들러
 *
 * @example
 * ```jsx
 * const adapter = useFullCalendarAdapter({
 *   schedules: scheduleData,
 *   diaries: diaryData,
 *   onDateSelect: handleDateSelect,
 *   onEventUpdate: handleEventUpdate,
 *   onMonthChange: handleMonthChange
 * });
 *
 * // 팀원 Calendar.jsx에 onDateClick 콜백으로 전달
 * <Calendar onDateClick={adapter.handleDateClick} />
 * ```
 */
export const useFullCalendarAdapter = ({
  schedules = [],
  diaries = [],
  onDateSelect,
  onEventUpdate,
  onMonthChange
}) => {

  /**
   * 모든 이벤트 데이터를 FullCalendar 형식으로 변환
   *
   * @returns {Array} 변환된 이벤트 배열
   */
  const getAllEvents = useCallback(() => {
    const scheduleEvents = mapSchedulesToEvents(schedules);
    const diaryEvents = mapDiariesToEvents(diaries);
    return [...scheduleEvents, ...diaryEvents];
  }, [schedules, diaries]);

  /**
   * 날짜 클릭 이벤트 핸들러 (팀원 Calendar.jsx와 호환)
   * 선택한 날짜를 시작날짜로 고정하여 ModalManager 통해 일정 생성 모달 오픈
   *
   * @param {Object} dateInfo - 팀원 Calendar.jsx에서 전달되는 날짜 정보
   */
  const handleDateClick = useCallback((dateInfo) => {
    // 팀원 Calendar.jsx의 dateInfo 구조에 맞춰 처리
    const selectedDate = dateInfo.iso || dateInfo.dateStr || dateInfo;

    console.log(`📅 날짜 클릭됨: ${selectedDate}`);

    // 상위 컴포넌트에 날짜 선택 알림
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }

    // ModalManager를 통해 일정 생성 모달 오픈 (시작날짜 자동 고정)
    if (window.ModalManager) {
      window.ModalManager.openScheduleCreate(selectedDate);
    }
  }, [onDateSelect]);

  /**
   * 이벤트 클릭 핸들러
   * 일정/일기 유형에 따라 적절한 수정 모달 오픈
   *
   * @param {Object} eventInfo - FullCalendar 이벤트 정보 객체
   */
  const handleEventClick = useCallback((eventInfo) => {
    const { extendedProps } = eventInfo.event;
    const { type, originalData } = extendedProps;

    console.log(`🎯 이벤트 클릭됨: ${type}`, originalData);

    if (window.ModalManager) {
      if (type === 'schedule') {
        window.ModalManager.openScheduleEdit(originalData);
      } else if (type === 'diary') {
        window.ModalManager.openDiaryEdit(originalData);
      }
    }
  }, []);

  /**
   * 월 변경 이벤트 핸들러
   * 월이 변경될 때 새로운 데이터 로딩을 위해 콜백 호출
   *
   * @param {Object} dateInfo - FullCalendar 날짜 정보 객체
   */
  const handleDatesSet = useCallback((dateInfo) => {
    if (onMonthChange) {
      const year = dateInfo.start.getFullYear();
      const month = dateInfo.start.getMonth() + 1;
      console.log(`📆 월 변경됨: ${year}년 ${month}월`);
      onMonthChange(year, month);
    }
  }, [onMonthChange]);

  /**
   * 이벤트 드롭 핸들러 (드래그 앤 드롭으로 날짜 변경)
   *
   * @param {Object} eventDropInfo - FullCalendar 이벤트 드롭 정보
   */
  const handleEventDrop = useCallback((eventDropInfo) => {
    const { event } = eventDropInfo;
    const { extendedProps } = event;
    const { type, originalData } = extendedProps;

    const newDate = event.startStr.split('T')[0]; // YYYY-MM-DD 형식 추출

    console.log(`🖱️ 이벤트 이동됨: ${type} → ${newDate}`);

    if (onEventUpdate) {
      onEventUpdate(type, 'move', {
        ...originalData,
        date: newDate
      });
    }
  }, [onEventUpdate]);

  /**
   * 이벤트 리사이즈 핸들러 (일정 길이 변경)
   *
   * @param {Object} eventResizeInfo - FullCalendar 이벤트 리사이즈 정보
   */
  const handleEventResize = useCallback((eventResizeInfo) => {
    const { event } = eventResizeInfo;
    const { extendedProps } = event;
    const { type, originalData } = extendedProps;

    if (type === 'schedule') {
      const newEndTime = event.endStr.split('T')[1]?.substring(0, 5) || '23:59';

      console.log(`↔️ 일정 길이 변경됨: ${originalData.title} → ${newEndTime}`);

      if (onEventUpdate) {
        onEventUpdate('schedule', 'resize', {
          ...originalData,
          endTime: newEndTime
        });
      }
    }
  }, [onEventUpdate]);

  /**
   * 팀원 Calendar.jsx에 추가할 이벤트 데이터 반환
   * 기존 공휴일 데이터와 합쳐서 사용
   *
   * @returns {Array} FullCalendar 이벤트 배열
   */
  const getCalendarEvents = useCallback(() => {
    return getAllEvents();
  }, [getAllEvents]);

  return {
    // 팀원 Calendar.jsx와 연동용 핸들러
    handleDateClick,
    handleEventClick,
    handleDatesSet,
    handleEventDrop,
    handleEventResize,

    // 데이터 관련 함수
    getAllEvents,
    getCalendarEvents,

    // 유틸리티 함수
    mapSchedulesToEvents: (schedules) => mapSchedulesToEvents(schedules),
    mapDiariesToEvents: (diaries) => mapDiariesToEvents(diaries)
  };
};

/**
 * 팀원 Calendar.jsx와 즉시 연동을 위한 헬퍼 함수
 * 기존 Calendar.jsx의 onDateClick prop에 바로 사용 가능
 *
 * @param {Function} onDateSelect - 날짜 선택 콜백
 * @returns {Function} Calendar.jsx onDateClick용 핸들러
 *
 * @example
 * ```jsx
 * const handleDateClick = createDateClickHandler(setSelectedDate);
 * <Calendar onDateClick={handleDateClick} />
 * ```
 */
export const createDateClickHandler = (onDateSelect) => {
  return (dateInfo) => {
    // 팀원 Calendar.jsx에서 전달되는 dateInfo 구조 처리
    const selectedDate = dateInfo.iso || dateInfo.dateStr || dateInfo;

    console.log(`📅 FullCalendarAdapter: 날짜 클릭 처리됨 - ${selectedDate}`, dateInfo);

    // 상위 컴포넌트에 날짜 전달만 수행 (ModalManager 호출 제거)
    if (onDateSelect) {
      onDateSelect(dateInfo); // 전체 dateInfo 객체 전달
    }
  };
};

/**
 * FullCalendar 어댑터 기본 설정 객체
 * 간단한 사용을 위한 기본 설정
 */
export const FullCalendarAdapter = {
  /**
   * 기본 설정 객체 반환
   *
   * @param {Object} options - 설정 옵션
   * @returns {Object} FullCalendar 기본 설정
   */
  getDefaultConfig: (options = {}) => ({
    plugins: [
      require('@fullcalendar/daygrid').default,
      require('@fullcalendar/interaction').default
    ],
    initialView: 'dayGridMonth',
    locale: 'ko',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    selectable: true,
    editable: true,
    dayMaxEvents: 3,
    moreLinkText: '더보기',
    height: 'auto',
    aspectRatio: 1.35,
    ...options
  }),

  /**
   * 일정/일기 데이터 변환 유틸리티
   */
  mapSchedulesToEvents,
  mapDiariesToEvents,

  /**
   * 날짜 클릭 핸들러 생성 유틸리티
   */
  createDateClickHandler
};

export default FullCalendarAdapter;
