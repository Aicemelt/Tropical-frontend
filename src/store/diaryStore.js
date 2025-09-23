/**
 * @fileoverview 일기 관리 전역 상태 모듈
 * @description Zustand 기반의 일기 관리 전역 상태 및 모달 상태 관리
 * @author 신동준
 * @since 2025-09-18
 * @version 1.0.0
 */

import { create } from 'zustand';

/**
 * @description 일기 관리 전역 상태 스토어
 * @author 신동준
 * @since 2025-09-18
 *
 * 주요 기능:
 * - 일기 목록 상태 관리
 * - 선택된 날짜/일기 상태 관리
 * - 모달 상태 관리 (등록/수정/상세보기)
 * - 로딩/에러 상태 관리
 * - 일기 CRUD 액션 함수들
 * - 월별/날짜별 일기 조회
 * - 감정 통계 관리
 *
 * @returns {Object} 일기 관리 스토어 객체
 */
export const useDiaryStore = create((set, get) => ({
  /**
   * @description 전체 일기 목록
   * @type {Array<Object>}
   */
  diaries: [],

  /**
   * @description 현재 선택된 날짜 (YYYY-MM-DD 형식)
   * @type {string|null}
   */
  selectedDate: null,

  /**
   * @description 현재 선택된 일기 객체
   * @type {Object|null}
   */
  selectedDiary: null,

  /**
   * @description 현재 표시 중인 월의 일기 목록
   * @type {Array<Object>}
   */
  currentMonthDiaries: [],

  /**
   * @description 감정별 통계 데이터
   * @type {Object}
   */
  emotionStats: {},

  /**
   * @description 최근 일기 목록 (대시보드용)
   * @type {Array<Object>}
   */
  recentDiaries: [],

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
   * @description 일기 모달 열림/닫힘 상태
   * @type {boolean}
   */
  isDiaryModalOpen: false,

  /**
   * @description 일기 모달 타입 ('create' | 'edit')
   * @type {string|null}
   */
  diaryModalType: null,

  /**
   * @description 일기 상세보기 모달 열림/닫힘 상태
   * @type {boolean}
   */
  isDiaryDetailOpen: false,

  // ================================
  // 기본 상태 관리 액션들
  // ================================

  /**
   * @description 일기 목록 설정 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {Array<Object>} diaries - 설정할 일기 배열
   */
  setDiaries: (diaries) => set({ diaries }),

  /**
   * @description 새 일기 추가 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {Object} diary - 추가할 일기 객체
   */
  addDiary: (diary) => set((state) => ({
    diaries: [...state.diaries, diary],
    currentMonthDiaries: [...state.currentMonthDiaries, diary]
  })),

  /**
   * @description 기존 일기 업데이트 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {number} diaryId - 업데이트할 일기 ID
   * @param {Object} updatedDiary - 업데이트된 일기 객체
   */
  updateDiary: (diaryId, updatedDiary) => set((state) => ({
    diaries: state.diaries.map(diary =>
      diary.id === diaryId ? updatedDiary : diary
    ),
    currentMonthDiaries: state.currentMonthDiaries.map(diary =>
      diary.id === diaryId ? updatedDiary : diary
    ),
    selectedDiary: state.selectedDiary?.id === diaryId
      ? updatedDiary
      : state.selectedDiary
  })),

  /**
   * @description 일기 삭제 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {number} diaryId - 삭제할 일기 ID
   */
  removeDiary: (diaryId) => set((state) => ({
    diaries: state.diaries.filter(diary => diary.id !== diaryId),
    currentMonthDiaries: state.currentMonthDiaries.filter(diary => diary.id !== diaryId),
    selectedDiary: state.selectedDiary?.id === diaryId
      ? null
      : state.selectedDiary
  })),

  /**
   * @description 선택된 날짜 설정 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {string} date - 선택할 날짜 (YYYY-MM-DD 형식)
   */
  setSelectedDate: (date) => set({ selectedDate: date }),

  /**
   * @description 선택된 일기 설정 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {Object} diary - 선택할 일기 객체
   */
  setSelectedDiary: (diary) => set({ selectedDiary: diary }),

  /**
   * @description 선택된 일기 초기화 함수
   * @author 신동준
   * @since 2025-09-18
   */
  clearSelectedDiary: () => set({ selectedDiary: null }),

  /**
   * @description 월별 일기 목록 설정 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {Array<Object>} diaries - 월별 일기 배열
   */
  setCurrentMonthDiaries: (diaries) => set({ currentMonthDiaries: diaries }),

  /**
   * @description 감정 통계 설정 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {Object} stats - 감정별 통계 객체
   */
  setEmotionStats: (stats) => set({ emotionStats: stats }),

  /**
   * @description 최근 일기 목록 설정 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {Array<Object>} diaries - 최근 일기 배열
   */
  setRecentDiaries: (diaries) => set({ recentDiaries: diaries }),

  // ================================
  // 조회 및 필터링 함수들
  // ================================

  /**
   * @description 특정 날짜의 일기 조회 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {string} date - 조회할 날짜 (YYYY-MM-DD 형식)
   * @returns {Object|null} 해당 날짜의 일기 (없으면 null)
   */
  getDiaryByDate: (date) => {
    const { diaries } = get();
    return diaries.find(diary => diary.createdAt === date) || null;
  },

  /**
   * @description 특정 월의 일기들 조회 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {number} year - 연도
   * @param {number} month - 월 (1-12)
   * @returns {Array<Object>} 해당 월의 일기 배열
   */
  getDiariesByMonth: (year, month) => {
    const { diaries } = get();
    const targetMonth = `${year}-${String(month).padStart(2, '0')}`;

    return diaries.filter(diary =>
      diary.createdAt && diary.createdAt.startsWith(targetMonth)
    );
  },

  /**
   * @description 감정별 일기 필터링 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {string} emotion - 필터링할 감정
   * @returns {Array<Object>} 해당 감정의 일기 배열
   */
  getDiariesByEmotion: (emotion) => {
    const { diaries } = get();
    return diaries.filter(diary => diary.emotion === emotion);
  },

  /**
   * @description 날씨별 일기 필터링 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {string} weather - 필터링할 날씨
   * @returns {Array<Object>} 해당 날씨의 일기 배열
   */
  getDiariesByWeather: (weather) => {
    const { diaries } = get();
    return diaries.filter(diary => diary.weather === weather);
  },

  // ================================
  // 모달 상태 관리 액션들
  // ================================

  /**
   * @description 일기 모달 열기 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {string} type - 모달 타입 ('create' | 'edit')
   * @param {Object|null} diary - 수정할 일기 (edit 모드일 때)
   */
  openDiaryModal: (type, diary = null) => set({
    isDiaryModalOpen: true,
    diaryModalType: type,
    selectedDiary: diary
  }),

  /**
   * @description 일기 모달 닫기 함수
   * @author 신동준
   * @since 2025-09-18
   */
  closeDiaryModal: () => set({
    isDiaryModalOpen: false,
    diaryModalType: null
  }),

  /**
   * @description 일기 상세보기 모달 열기 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {Object} diary - 상세보기할 일기 객체
   */
  openDiaryDetail: (diary) => set({
    isDiaryDetailOpen: true,
    selectedDiary: diary
  }),

  /**
   * @description 일기 상세보기 모달 닫기 함수
   * @author 신동준
   * @since 2025-09-18
   */
  closeDiaryDetail: () => set({
    isDiaryDetailOpen: false
  }),

  // ================================
  // 로딩 및 에러 상태 관리
  // ================================

  /**
   * @description 로딩 상태 설정 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {boolean} loading - 로딩 상태
   */
  setLoading: (loading) => set({ loading }),

  /**
   * @description 에러 상태 설정 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {string|null} error - 에러 메시지
   */
  setError: (error) => set({ error }),

  /**
   * @description 에러 상태 초기화 함수
   * @author 신동준
   * @since 2025-09-18
   */
  clearError: () => set({ error: null }),

  // ================================
  // 복합 액션 함수들
  // ================================

  /**
   * @description 월 변경 시 해당 월의 일기들을 로드하는 함수
   * @author 신동준
   * @since 2025-09-18
   * @param {number} year - 연도
   * @param {number} month - 월 (1-12)
   */
  loadMonthDiaries: (year, month) => {
    const { getDiariesByMonth, setCurrentMonthDiaries } = get();
    const monthDiaries = getDiariesByMonth(year, month);
    setCurrentMonthDiaries(monthDiaries);
  },

  /**
   * @description 통계 데이터를 업데이트하는 함수
   * @author 신동준
   * @since 2025-09-18
   */
  updateStats: () => {
    const { diaries, setEmotionStats, setRecentDiaries } = get();

    // 감정 통계 업데이트
    const emotionStats = {};
    const emotions = ['JOY', 'SADNESS', 'ANGER', 'ANXIETY', 'CALM'];
    emotions.forEach(emotion => {
      emotionStats[emotion] = diaries.filter(diary => diary.emotion === emotion).length;
    });
    setEmotionStats(emotionStats);

    // 최근 일기 업데이트 (최신 5개)
    const sortedDiaries = [...diaries]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setRecentDiaries(sortedDiaries);
  },

  /**
   * @description 전체 상태 초기화 함수
   * @author 신동준
   * @since 2025-09-18
   */
  resetStore: () => set({
    diaries: [],
    selectedDate: null,
    selectedDiary: null,
    currentMonthDiaries: [],
    emotionStats: {},
    recentDiaries: [],
    loading: false,
    error: null,
    isDiaryModalOpen: false,
    diaryModalType: null,
    isDiaryDetailOpen: false
  })
}));
