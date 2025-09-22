/**
 * @fileoverview 일기 API 클라이언트 모듈
 * @description 일기 CRUD 기능 및 감정/날씨 관련 유틸리티 제공
 * @author 신동준
 * @since 2025-09-18
 * @version 1.0.0
 */

import { apiMethods } from './api.js';

// ================================
// 상수 정의 (Constants)
// ================================

/**
 * @description 감정 상태 상수 및 메타데이터
 * @author 신동준
 * @since 2025-09-18
 */
export const EMOTIONS = {
  JOY: {
    key: 'JOY',
    label: '기쁨',
    emoji: '😊',
    color: '#FFD700',
    imagePath: '/src/asset/joy.png'
  },
  SADNESS: {
    key: 'SADNESS',
    label: '슬픔',
    emoji: '😢',
    color: '#4682B4',
    imagePath: '/src/asset/sadness.png'
  },
  ANGER: {
    key: 'ANGER',
    label: '분노',
    emoji: '😠',
    color: '#DC143C',
    imagePath: '/src/asset/anger.png'
  },
  ANXIETY: {
    key: 'ANXIETY',
    label: '불안',
    emoji: '😰',
    color: '#9370DB',
    imagePath: '/src/asset/anxiety.png'
  },
  CALM: {
    key: 'CALM',
    label: '평온',
    emoji: '😌',
    color: '#32CD32',
    imagePath: '/src/asset/calm.png'
  }
};

/**
 * @description 날씨 상태 상수 및 메타데이터
 * @author 신동준
 * @since 2025-09-18
 */
export const WEATHER = {
  SUNNY: {
    key: 'SUNNY',
    label: '맑음',
    emoji: '☀️',
    color: '#FFA500'
  },
  CLOUDY: {
    key: 'CLOUDY',
    label: '흐림',
    emoji: '☁️',
    color: '#708090'
  },
  RAINY: {
    key: 'RAINY',
    label: '비',
    emoji: '🌧️',
    color: '#4169E1'
  },
  SNOWY: {
    key: 'SNOWY',
    label: '눈',
    emoji: '❄️',
    color: '#E0E0E0'
  },
  WINDY: {
    key: 'WINDY',
    label: '바람',
    emoji: '💨',
    color: '#87CEEB'
  }
};

// ================================
// API 엔드포인트 (Endpoints)
// ================================

const DIARY_ENDPOINTS = {
  BASE: '/diary',
  BY_ID: (id) => `/diary/${id}`,
  BY_MONTH: (year, month) => `/diary/month/${year}/${month}`,
  BY_DATE: (date) => `/diary/date/${date}`,
};

// ================================
// 일기 CRUD API 함수들
// ================================

/**
 * @description 새로운 일기 생성
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {Object} diaryData - 일기 데이터
 * @param {string} diaryData.title - 일기 제목
 * @param {string} diaryData.content - 일기 내용
 * @param {string} diaryData.emotion - 감정 상태 (EMOTIONS 키 중 하나)
 * @param {string} diaryData.weather - 날씨 상태 (WEATHER 키 중 하나)
 * @param {string} diaryData.date - 일기 날짜 (YYYY-MM-DD 형식)
 * @returns {Promise<Object>} 생성된 일기 데이터
 */
export const createDiary = async (diaryData) => {
  try {
    const response = await apiMethods.post(DIARY_ENDPOINTS.BASE, diaryData);
    return response.data;
  } catch (error) {
    console.error('[Diary API] 일기 생성 실패:', error);
    throw error;
  }
};

/**
 * @description ID로 일기 조회
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {number} diaryId - 일기 ID
 * @returns {Promise<Object>} 일기 데이터
 */
export const getDiaryById = async (diaryId) => {
  try {
    const response = await apiMethods.get(DIARY_ENDPOINTS.BY_ID(diaryId));
    return response.data;
  } catch (error) {
    console.error('[Diary API] 일기 조회 실패:', error);
    throw error;
  }
};

/**
 * @description 일기 수정
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {number} diaryId - 일기 ID
 * @param {Object} updateData - 수정할 데이터
 * @returns {Promise<Object>} 수정된 일기 데이터
 */
export const updateDiary = async (diaryId, updateData) => {
  try {
    const response = await apiMethods.put(DIARY_ENDPOINTS.BY_ID(diaryId), updateData);
    return response.data;
  } catch (error) {
    console.error('[Diary API] 일기 수정 실패:', error);
    throw error;
  }
};

/**
 * @description 일기 삭제
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {number} diaryId - 일기 ID
 * @returns {Promise<void>}
 */
export const deleteDiary = async (diaryId) => {
  try {
    await apiMethods.delete(DIARY_ENDPOINTS.BY_ID(diaryId));
  } catch (error) {
    console.error('[Diary API] 일기 삭제 실패:', error);
    throw error;
  }
};

/**
 * @description 월별 일기 목록 조회
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {number} year - 연도 (예: 2024)
 * @param {number} month - 월 (1-12)
 * @returns {Promise<Array>} 월별 일기 목록
 */
export const getDiariesByMonth = async (year, month) => {
  try {
    const response = await apiMethods.get(DIARY_ENDPOINTS.BY_MONTH(year, month));
    return response.data || [];
  } catch (error) {
    console.error('[Diary API] 월별 일기 조회 실패:', error);
    throw error;
  }
};

/**
 * @description 특정 날짜의 일기 조회
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {string} date - 날짜 (YYYY-MM-DD 형식)
 * @returns {Promise<Object|null>} 해당 날짜의 일기 (없으면 null)
 */
export const getDiaryByDate = async (date) => {
  try {
    const response = await apiMethods.get(DIARY_ENDPOINTS.BY_DATE(date));
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // 해당 날짜에 일기가 없는 경우
      return null;
    }
    console.error('[Diary API] 날짜별 일기 조회 실패:', error);
    throw error;
  }
};

// ================================
// 유틸리티 함수들
// ================================

/**
 * @description 감정별 색상 반환
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {string} emotionKey - 감정 키
 * @returns {string} 감정에 해당하는 색상 코드
 */
export const getEmotionColor = (emotionKey) => {
  return EMOTIONS[emotionKey]?.color || '#CCCCCC';
};

/**
 * @description 날씨별 색상 반환
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {string} weatherKey - 날씨 키
 * @returns {string} 날씨에 해당하는 색상 코드
 */
export const getWeatherColor = (weatherKey) => {
  return WEATHER[weatherKey]?.color || '#CCCCCC';
};

/**
 * @description 일기 미리보기 텍스트 생성
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {string} content - 일기 내용
 * @param {number} maxLength - 최대 길이 (기본값: 50)
 * @returns {string} 미리보기 텍스트
 */
export const getDiaryPreview = (content, maxLength = 50) => {
  if (!content) return '';

  if (content.length <= maxLength) {
    return content;
  }

  return content.substring(0, maxLength) + '...';
};

/**
 * @description FullCalendar용 일기 마커 생성
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {Array} diaries - 일기 목록
 * @returns {Array} FullCalendar 이벤트 형식의 마커 배열
 */
export const createDiaryMarkersForCalendar = (diaries) => {
  return diaries.map(diary => ({
    id: `diary-${diary.id}`,
    title: EMOTIONS[diary.emotion]?.emoji || '📝',
    date: diary.createdAt,
    backgroundColor: getEmotionColor(diary.emotion),
    borderColor: getEmotionColor(diary.emotion),
    display: 'background',
    classNames: ['diary-marker'],
    extendedProps: {
      type: 'diary',
      diaryId: diary.id,
      emotion: diary.emotion,
      weather: diary.weather
    }
  }));
};

/**
 * @description 일기 데이터 유효성 검사
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {Object} diaryData - 검사할 일기 데이터
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateDiaryData = (diaryData) => {
  const errors = [];

  // 제목 검사
  if (!diaryData.title || diaryData.title.trim().length === 0) {
    errors.push('제목을 입력해주세요.');
  } else if (diaryData.title.length > 100) {
    errors.push('제목은 100자 이하로 입력해주세요.');
  }

  // 내용 검사
  if (!diaryData.content || diaryData.content.trim().length === 0) {
    errors.push('내용을 입력해주세요.');
  } else if (diaryData.content.length > 2000) {
    errors.push('내용은 2000자 이하로 입력해주세요.');
  }

  // 감정 검사
  if (!diaryData.emotion || !EMOTIONS[diaryData.emotion]) {
    errors.push('감정을 선택해주세요.');
  }

  // 날씨 검사
  if (!diaryData.weather || !WEATHER[diaryData.weather]) {
    errors.push('날씨를 선택해주세요.');
  }

  // 날짜 검사
  if (!diaryData.date) {
    errors.push('날짜를 선택해주세요.');
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(diaryData.date)) {
      errors.push('올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * @description 기본 일기 데이터 생성
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {string} date - 날짜 (YYYY-MM-DD 형식, 기본값: 오늘)
 * @returns {Object} 기본 일기 데이터 객체
 */
export const createDefaultDiaryData = (date = null) => {
  const today = date || new Date().toISOString().split('T')[0];

  return {
    title: '',
    content: '',
    emotion: '',
    weather: '',
    date: today
  };
};

/**
 * @description 감정별 통계 생성
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {Array} diaries - 일기 목록
 * @returns {Object} 감정별 통계 { emotion: count, ... }
 */
export const generateEmotionStats = (diaries) => {
  const stats = {};

  // 모든 감정을 0으로 초기화
  Object.keys(EMOTIONS).forEach(emotion => {
    stats[emotion] = 0;
  });

  // 일기별로 감정 카운트
  diaries.forEach(diary => {
    if (diary.emotion && Object.prototype.hasOwnProperty.call(stats, diary.emotion)) {
      stats[diary.emotion]++;
    }
  });

  return stats;
};

/**
 * @description 최근 일기 목록 조회 (감정별 필터링 가능)
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {Array} diaries - 전체 일기 목록
 * @param {number} limit - 최대 개수 (기본값: 5)
 * @param {string} emotionFilter - 감정 필터 (선택사항)
 * @returns {Array} 최근 일기 목록
 */
export const getRecentDiaries = (diaries, limit = 5, emotionFilter = null) => {
  let filteredDiaries = [...diaries];

  // 감정 필터링
  if (emotionFilter && EMOTIONS[emotionFilter]) {
    filteredDiaries = filteredDiaries.filter(diary => diary.emotion === emotionFilter);
  }

  // 날짜순 정렬 (최신순)
  filteredDiaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return filteredDiaries.slice(0, limit);
};
