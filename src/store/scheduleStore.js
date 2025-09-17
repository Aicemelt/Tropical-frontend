/**
 * @fileoverview 일정 관리 전역 상태 모듈
 * @description Zustand 기반의 일정 관리 전역 상태 및 모달 상태 관리
 * @author 신동준
 * @since 2025-09-17
 * @version 1.0.0
 */

import { create } from 'zustand';

/**
 * @description 일정 관리 전역 상태 스토어
 * @author 신동준
 * @since 2025-09-17
 *
 * 주요 기능:
 * - 일정 목록 상태 관리
 * - 선택된 날짜/일정 상태 관리
 * - 모달 상태 관리 (등록/수정/상세보기)
 * - 로딩/에러 상태 관리
 * - 일정 CRUD 액션 함수들
 *
 * @returns {Object} 일정 관리 스토어 객체
 */
export const useScheduleStore = create((set, get) => ({
  /**
   * @description 전체 일정 목록
   * @type {Array<Object>}
   */
  schedules: [],

  /**
   * @description 현재 선택된 날짜 (YYYY-MM-DD 형식)
   * @type {string|null}
   */
  selectedDate: null,

  /**
   * @description 현재 선택된 일정 객체
   * @type {Object|null}
   */
  selectedSchedule: null,

  /**
   * @description 로딩 상태
   * @type {boolean}
   */
  loading: false,

  /**
   * @description 에러 메시지
   * @type {string|null}
   */
  error: null,

  /**
   * @description 일정 모달 열림/닫힘 상태
   * @type {boolean}
   */
  isScheduleModalOpen: false,

  /**
   * @description 일정 모달 타입 ('create' | 'edit')
   * @type {string|null}
   */
  scheduleModalType: null,

  /**
   * @description 일정 상세보기 모달 열림/닫힘 상태
   * @type {boolean}
   */
  isScheduleDetailOpen: false,

  /**
   * @description 일정 목록 설정 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {Array<Object>} schedules - 설정할 일정 배열
   */
  setSchedules: (schedules) => set({ schedules }),

  /**
   * @description 새 일정 추가 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {Object} schedule - 추가할 일정 객체
   */
  addSchedule: (schedule) => set((state) => ({
    schedules: [...state.schedules, schedule]
  })),

  /**
   * @description 기존 일정 업데이트 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 업데이트할 일정 ID
   * @param {Object} updatedSchedule - 업데이트된 일정 객체
   */
  updateSchedule: (scheduleId, updatedSchedule) => set((state) => ({
    schedules: state.schedules.map(schedule =>
      schedule.scheduleId === scheduleId ? updatedSchedule : schedule
    ),
    selectedSchedule: state.selectedSchedule?.scheduleId === scheduleId
      ? updatedSchedule
      : state.selectedSchedule
  })),

  /**
   * @description 일정 삭제 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {number} scheduleId - 삭제할 일정 ID
   */
  removeSchedule: (scheduleId) => set((state) => ({
    schedules: state.schedules.filter(schedule => schedule.scheduleId !== scheduleId),
    selectedSchedule: state.selectedSchedule?.scheduleId === scheduleId
      ? null
      : state.selectedSchedule
  })),

  /**
   * @description 선택된 날짜 설정 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {string} date - 선택할 날짜 (YYYY-MM-DD 형식)
   */
  setSelectedDate: (date) => set({ selectedDate: date }),

  /**
   * @description 선택된 일정 설정 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {Object} schedule - 선택할 일정 객체
   */
  setSelectedSchedule: (schedule) => set({ selectedSchedule: schedule }),

  /**
   * @description 선택된 일정 초기화 함수
   * @author 신동준
   * @since 2025-09-17
   */
  clearSelectedSchedule: () => set({ selectedSchedule: null }),

  /**
   * @description 특정 날짜의 일정들 조회 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {string} date - 조회할 날짜 (YYYY-MM-DD 형식)
   * @returns {Array<Object>} 해당 날짜의 일정 배열
   */
  getSchedulesByDate: (date) => {
    const { schedules } = get();
    return schedules.filter(schedule => schedule.scheduleDate === date);
  },

  /**
   * @description 로딩 상태 설정 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {boolean} loading - 로딩 상태
   */
  setLoading: (loading) => set({ loading }),

  /**
   * @description 에러 메시지 설정 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {string} error - 에러 메시지
   */
  setError: (error) => set({ error }),

  /**
   * @description 에러 상태 초기화 함수
   * @author 신동준
   * @since 2025-09-17
   */
  clearError: () => set({ error: null }),

  /**
   * @description 일정 모달 열기 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {string} type - 모달 타입 ('create' | 'edit')
   * @param {Object|null} schedule - 편집할 일정 객체 (edit 모드일 때)
   */
  openScheduleModal: (type = 'create', schedule = null) => set({
    isScheduleModalOpen: true,
    scheduleModalType: type,
    selectedSchedule: schedule
  }),

  /**
   * @description 일정 모달 닫기 함수
   * @author 신동준
   * @since 2025-09-17
   */
  closeScheduleModal: () => set({
    isScheduleModalOpen: false,
    scheduleModalType: null,
    selectedSchedule: null
  }),

  /**
   * @description 일정 상세보기 모달 열기 함수
   * @author 신동준
   * @since 2025-09-17
   * @param {Object} schedule - 상세보기할 일정 객체
   */
  openScheduleDetail: (schedule) => set({
    isScheduleDetailOpen: true,
    selectedSchedule: schedule
  }),

  /**
   * @description 일정 상세보기 모달 닫기 함수
   * @author 신동준
   * @since 2025-09-17
   */
  closeScheduleDetail: () => set({
    isScheduleDetailOpen: false,
    selectedSchedule: null
  }),

  /**
   * @description 스토어 상태 전체 초기화 함수
   * @author 신동준
   * @since 2025-09-17
   *
   * 사용 시나리오:
   * - 로그아웃 시
   * - 컴포넌트 언마운트 시
   * - 데이터 리셋이 필요한 경우
   */
  resetScheduleStore: () => set({
    schedules: [],
    selectedDate: null,
    selectedSchedule: null,
    loading: false,
    error: null,
    isScheduleModalOpen: false,
    scheduleModalType: null,
    isScheduleDetailOpen: false,
  }),
}));
