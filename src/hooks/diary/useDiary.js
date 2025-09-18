/**
 * @fileoverview 일기 관리 커스텀 훅
 * @description 일기 CRUD 로직 및 상태 관리를 위한 커스텀 훅
 * @author 신동준
 * @since 2025-09-18
 * @version 1.0.0
 */

import { useCallback } from 'react';
import { useDiaryStore } from '../../store/diaryStore.js';
import {
  createDiary,
  getDiaryById,
  updateDiary,
  deleteDiary,
  getDiariesByMonth,
  getDiaryByDate,
  generateEmotionStats,
  getRecentDiaries,
  validateDiaryData,
  createDefaultDiaryData
} from '../../services/diaryApi.js';

/**
 * @description 일기 관리 커스텀 훅
 * @author 신동준
 * @since 2025-09-18
 *
 * 제공 기능:
 * - 일기 CRUD 작업 (생성, 조회, 수정, 삭제)
 * - 월별/날짜별 일기 조회
 * - 감정 통계 관리
 * - 모달 상태 관리
 * - 로딩/에러 상태 관리
 *
 * @returns {Object} 일기 관리 관련 상태 및 함수들
 */
export const useDiary = () => {
  // Store에서 상태와 액션들 가져오기
  const {
    // 상태
    diaries,
    selectedDate,
    selectedDiary,
    currentMonthDiaries,
    emotionStats,
    recentDiaries,
    loading,
    error,
    isDiaryModalOpen,
    diaryModalType,
    isDiaryDetailOpen,

    // 기본 액션들
    setDiaries,
    addDiary,
    updateDiary: updateDiaryInStore,
    removeDiary,
    setSelectedDate,
    setSelectedDiary,
    clearSelectedDiary,
    setCurrentMonthDiaries,
    setEmotionStats,
    setRecentDiaries,

    // 조회 함수들
    getDiaryByDate: getDiaryByDateFromStore,
    getDiariesByEmotion,
    getDiariesByWeather,

    // 모달 관리
    openDiaryModal,
    closeDiaryModal,
    openDiaryDetail,
    closeDiaryDetail,

    // 로딩/에러 관리
    setLoading,
    setError,
    clearError,

    // 복합 액션들
    updateStats,
    resetStore
  } = useDiaryStore();

  // ================================
  // 일기 CRUD 작업들
  // ================================

  /**
   * @description 새로운 일기 생성
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {Object} diaryData - 일기 데이터
   * @returns {Promise<Object|null>} 생성된 일기 객체 또는 null
   */
  const handleCreateDiary = useCallback(async (diaryData) => {
    try {
      setLoading(true);
      clearError();

      // 데이터 유효성 검사
      const validation = validateDiaryData(diaryData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return null;
      }

      // API 호출
      const newDiary = await createDiary(diaryData);

      // 스토어에 추가
      addDiary(newDiary);

      // 통계 업데이트
      updateStats();

      // 모달 닫기
      closeDiaryModal();

      console.log('[useDiary] 일기 생성 성공:', newDiary);
      return newDiary;

    } catch (error) {
      console.error('[useDiary] 일기 생성 실패:', error);
      setError(error.response?.data?.message || '일기 생성에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, addDiary, updateStats, closeDiaryModal, setError]);

  /**
   * @description 일기 수정
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {number} diaryId - 수정할 일기 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<Object|null>} 수정된 일기 객체 또는 null
   */
  const handleUpdateDiary = useCallback(async (diaryId, updateData) => {
    try {
      setLoading(true);
      clearError();

      // 데이터 유효성 검사
      const validation = validateDiaryData(updateData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return null;
      }

      // API 호출
      const updatedDiary = await updateDiary(diaryId, updateData);

      // 스토어에서 업데이트
      updateDiaryInStore(diaryId, updatedDiary);

      // 통계 업데이트
      updateStats();

      // 모달 닫기
      closeDiaryModal();

      console.log('[useDiary] 일기 수정 성공:', updatedDiary);
      return updatedDiary;

    } catch (error) {
      console.error('[useDiary] 일기 수정 실패:', error);
      setError(error.response?.data?.message || '일기 수정에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, updateDiaryInStore, updateStats, closeDiaryModal, setError]);

  /**
   * @description 일기 삭제
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {number} diaryId - 삭제할 일기 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  const handleDeleteDiary = useCallback(async (diaryId) => {
    try {
      setLoading(true);
      clearError();

      // API 호출
      await deleteDiary(diaryId);

      // 스토어에서 제거
      removeDiary(diaryId);

      // 통계 업데이트
      updateStats();

      // 상세보기 모달이 열려있다면 닫기
      if (isDiaryDetailOpen) {
        closeDiaryDetail();
      }

      console.log('[useDiary] 일기 삭제 성공:', diaryId);
      return true;

    } catch (error) {
      console.error('[useDiary] 일기 삭제 실패:', error);
      setError(error.response?.data?.message || '일기 삭제에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, removeDiary, updateStats, isDiaryDetailOpen, closeDiaryDetail, setError]);

  /**
   * @description ID로 일기 조회 및 선택
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {number} diaryId - 조회할 일기 ID
   * @returns {Promise<Object|null>} 조회된 일기 객체 또는 null
   */
  const handleFetchDiary = useCallback(async (diaryId) => {
    try {
      setLoading(true);
      clearError();

      // API 호출
      const diary = await getDiaryById(diaryId);

      // 선택된 일기로 설정
      setSelectedDiary(diary);

      console.log('[useDiary] 일기 조회 성공:', diary);
      return diary;

    } catch (error) {
      console.error('[useDiary] 일기 조회 실패:', error);
      setError(error.response?.data?.message || '일기 조회에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setSelectedDiary, setError]);

  // ================================
  // 월별/날짜별 조회 작업들
  // ================================

  /**
   * @description 월별 일기 목록 조회
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {number} year - 연도
   * @param {number} month - 월 (1-12)
   * @returns {Promise<Array>} 월별 일기 목록
   */
  const handleFetchMonthDiaries = useCallback(async (year, month) => {
    try {
      setLoading(true);
      clearError();

      // API 호출
      const monthDiaries = await getDiariesByMonth(year, month);

      // 스토어에 설정
      setCurrentMonthDiaries(monthDiaries);

      // 전체 일기 목록도 업데이트 (중복 제거)
      const existingIds = new Set(diaries.map(d => d.id));
      const newDiaries = monthDiaries.filter(d => !existingIds.has(d.id));
      if (newDiaries.length > 0) {
        setDiaries([...diaries, ...newDiaries]);
      }

      // 통계 업데이트
      updateStats();

      console.log(`[useDiary] ${year}년 ${month}월 일기 조회 성공:`, monthDiaries.length, '개');
      return monthDiaries;

    } catch (error) {
      console.error('[useDiary] 월별 일기 조회 실패:', error);
      setError(error.response?.data?.message || '월별 일기 조회에 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setCurrentMonthDiaries, diaries, setDiaries, updateStats, setError]);

  /**
   * @description 특정 날짜의 일기 조회
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {string} date - 날짜 (YYYY-MM-DD 형식)
   * @returns {Promise<Object|null>} 해당 날짜의 일기 또는 null
   */
  const handleFetchDiaryByDate = useCallback(async (date) => {
    try {
      setLoading(true);
      clearError();

      // 먼저 스토어에서 확인
      const existingDiary = getDiaryByDateFromStore(date);
      if (existingDiary) {
        setSelectedDiary(existingDiary);
        setSelectedDate(date);
        console.log('[useDiary] 스토어에서 일기 조회:', existingDiary);
        return existingDiary;
      }

      // API 호출
      const diary = await getDiaryByDate(date);

      if (diary) {
        // 스토어에 추가 (중복 체크)
        const exists = diaries.some(d => d.id === diary.id);
        if (!exists) {
          addDiary(diary);
        }

        setSelectedDiary(diary);
      }

      setSelectedDate(date);

      console.log(`[useDiary] ${date} 날짜 일기 조회:`, diary ? '있음' : '없음');
      return diary;

    } catch (error) {
      console.error('[useDiary] 날짜별 일기 조회 실패:', error);
      setError(error.response?.data?.message || '날짜별 일기 조회에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, getDiaryByDateFromStore, setSelectedDiary, setSelectedDate, diaries, addDiary, setError]);

  // ================================
  // 모달 관련 헬퍼 함수들
  // ================================

  /**
   * @description 새 일기 작성 모달 열기
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {string} date - 작성할 날짜 (선택사항)
   */
  const openCreateDiaryModal = useCallback((date = null) => {
    const defaultData = createDefaultDiaryData(date);
    setSelectedDiary(defaultData);
    openDiaryModal('create');
  }, [setSelectedDiary, openDiaryModal]);

  /**
   * @description 일기 수정 모달 열기
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {Object} diary - 수정할 일기 객체
   */
  const openEditDiaryModal = useCallback((diary) => {
    setSelectedDiary(diary);
    openDiaryModal('edit', diary);
  }, [setSelectedDiary, openDiaryModal]);

  // ================================
  // 유틸리티 함수들
  // ================================

  /**
   * @description 현재 감정 통계 업데이트
   * @author 신동준
   * @since 2025-09-18
   */
  const refreshStats = useCallback(() => {
    const stats = generateEmotionStats(diaries);
    setEmotionStats(stats);

    const recent = getRecentDiaries(diaries, 5);
    setRecentDiaries(recent);
  }, [diaries, setEmotionStats, setRecentDiaries]);

  /**
   * @description 캘린더 월 변경 핸들러
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {Date} date - 변경된 날짜
   */
  const handleCalendarMonthChange = useCallback(async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    await handleFetchMonthDiaries(year, month);
  }, [handleFetchMonthDiaries]);

  /**
   * @description 캘린더 날짜 클릭 핸들러
   * @author 신동준
   * @since 2025-09-18
   *
   * @param {string} date - 클릭된 날짜 (YYYY-MM-DD)
   */
  const handleCalendarDateClick = useCallback(async (date) => {
    await handleFetchDiaryByDate(date);

    // 해당 날짜에 일기가 있으면 상세보기, 없으면 작성 모달
    const diary = getDiaryByDateFromStore(date);
    if (diary) {
      openDiaryDetail(diary);
    } else {
      openCreateDiaryModal(date);
    }
  }, [handleFetchDiaryByDate, getDiaryByDateFromStore, openDiaryDetail, openCreateDiaryModal]);

  // 반환할 객체
  return {
    // 상태
    diaries,
    selectedDate,
    selectedDiary,
    currentMonthDiaries,
    emotionStats,
    recentDiaries,
    loading,
    error,
    isDiaryModalOpen,
    diaryModalType,
    isDiaryDetailOpen,

    // CRUD 작업
    createDiary: handleCreateDiary,
    fetchDiary: handleFetchDiary,
    updateDiary: handleUpdateDiary,
    deleteDiary: handleDeleteDiary,

    // 조회 작업
    fetchMonthDiaries: handleFetchMonthDiaries,
    fetchDiaryByDate: handleFetchDiaryByDate,

    // 필터링 조회
    getDiariesByEmotion,
    getDiariesByWeather,

    // 모달 관리
    openCreateDiaryModal,
    openEditDiaryModal,
    closeDiaryModal,
    openDiaryDetail,
    closeDiaryDetail,

    // 상태 관리
    setSelectedDate,
    setSelectedDiary,
    clearSelectedDiary,
    clearError,

    // 유틸리티
    refreshStats,
    resetStore,

    // 캘린더 연동
    handleCalendarMonthChange,
    handleCalendarDateClick,

    // 데이터 검증
    validateDiaryData
  };
};
