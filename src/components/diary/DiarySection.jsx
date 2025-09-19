/**
 * @fileoverview 일기 섹션 컴포넌트
 * @description 선택된 날짜의 일기를 표시하고 관리하는 섹션 컴포넌트
 * @author 신동준
 * @since 2025-09-19
 * @version 2.0.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

// 컴포넌트 import
import EmptyState from "../common/EmptyState.jsx";
import DiaryItem from "./DiaryItem.jsx";
import Loading from "../common/Loading/Loading.jsx";

// 훅 import
import { useDiary } from '../../hooks/diary/useDiary.js';

// 스타일 import
import styles from '../../styles/components/DiarySection.module.scss';

/**
 * @component DiarySection
 * @description 선택된 날짜의 일기를 표시하는 섹션 컴포넌트
 * 하루에 하나의 일기만 작성 가능하며, 작성/수정/삭제 기능을 제공
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.selectedDate - 선택된 날짜 (YYYY-MM-DD 형식)
 * @param {'sidebar'|'modal'|'standalone'} [props.displayMode='standalone'] - 표시 모드
 * @param {Function} [props.onLoadingChange] - 로딩 상태 변경 콜백
 * @param {Function} [props.onDiaryClick] - 일기 클릭 콜백
 * @param {boolean} [props.showAddButton=true] - 추가 버튼 표시 여부
 * @param {boolean} [props.showEmotionSummary=false] - 감정 요약 표시 여부
 *
 * @returns {JSX.Element} DiarySection 컴포넌트
 *
 * @example
 * <DiarySection
 *   selectedDate="2025-09-19"
 *   displayMode="sidebar"
 *   onLoadingChange={setLoading}
 *   showAddButton={true}
 * />
 *
 * @since 2025-09-19
 * @author 신동준
 */
const DiarySection = ({
  selectedDate,
  displayMode = 'standalone',
  onLoadingChange,
  onDiaryClick,
  showAddButton = true,
  showEmotionSummary = false
}) => {
  // ================================
  // 커스텀 훅 사용
  // ================================

  const {
    diaries,
    loading,
    error,
    getDiaryByDate,
    refreshDiaries
  } = useDiary();

  // ================================
  // 로컬 상태 관리
  // ================================

  /**
   * @description 내부 에러 상태
   * @type {string|null}
   */
  const [internalError, setInternalError] = useState(null);

  /**
   * @description 일기 미리보기 확장 상태
   * @type {boolean}
   */
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  // ================================
  // 계산된 값들
  // ================================

  /**
   * @description 선택된 날짜의 일기 조회
   * @returns {Object|null} 해당 날짜의 일기 객체
   */
  const currentDiary = useMemo(() => {
    if (!selectedDate || !diaries.length) return null;

    return diaries.find(diary => {
      const diaryDate = diary.date || diary.createdAt?.split('T')[0];
      return diaryDate === selectedDate;
    });
  }, [diaries, selectedDate]);

  /**
   * @description 일기 존재 여부
   * @returns {boolean} 일기 존재 여부
   */
  const hasDiary = useMemo(() => {
    return currentDiary !== null;
  }, [currentDiary]);

  /**
   * @description 감정 표시 텍스트
   * @returns {string} 감정 텍스트
   */
  const emotionText = useMemo(() => {
    if (!currentDiary?.emotion) return '';

    const emotionMap = {
      JOY: '😊 기쁨',
      SADNESS: '😢 슬픔',
      ANGER: '😠 분노',
      ANXIETY: '😰 불안',
      CALM: '😌 평온'
    };

    return emotionMap[currentDiary.emotion] || currentDiary.emotion;
  }, [currentDiary?.emotion]);

  /**
   * @description 날씨 표시 텍스트
   * @returns {string} 날씨 텍스트
   */
  const weatherText = useMemo(() => {
    if (!currentDiary?.weather) return '';

    const weatherMap = {
      SUNNY: '☀️ 맑음',
      CLOUDY: '☁️ 흐림',
      RAINY: '🌧️ 비',
      SNOWY: '❄️ 눈',
      WINDY: '💨 바람'
    };

    return weatherMap[currentDiary.weather] || currentDiary.weather;
  }, [currentDiary?.weather]);

  // ================================
  // 이벤트 핸들러
  // ================================

  /**
   * @description 특정 날짜의 일기 로드
   * @param {string} date - 날짜 (YYYY-MM-DD 형식)
   */
  const loadDiaryForDate = useCallback(async (date) => {
    try {
      await getDiaryByDate(date);
    } catch (err) {
      console.error('일기 조회 실패:', err);
      setInternalError('일기를 불러오는데 실패했습니다.');
    }
  }, [getDiaryByDate]);

  /**
   * @description 일기 추가 버튼 클릭 핸들러
   */
  const handleAddDiary = useCallback(() => {
    console.log('일기 작성 클릭:', selectedDate);
    // TODO: 일기 작성 모달 열기 로직
  }, [selectedDate]);

  /**
   * @description 일기 수정 버튼 클릭 핸들러
   */
  const handleEditDiary = useCallback(() => {
    if (currentDiary) {
      console.log('일기 수정 클릭:', currentDiary);
      // TODO: 일기 수정 모달 열기 로직
    }
  }, [currentDiary]);

  /**
   * @description 새로고침 버튼 클릭 핸들러
   */
  const handleRefresh = useCallback(async () => {
    if (selectedDate) {
      try {
        setInternalError(null);
        await refreshDiaries();
        await loadDiaryForDate(selectedDate);
      } catch (err) {
        console.error('새로고침 실패:', err);
        setInternalError('새로고침에 실패했습니다.');
      }
    }
  }, [selectedDate, refreshDiaries, loadDiaryForDate]);

  /**
   * @description 일기 아이템 클릭 핸들러
   * @param {Object} diary - 클릭된 일기 객체
   */
  const handleDiaryClick = useCallback((diary) => {
    if (onDiaryClick) {
      onDiaryClick(diary);
    } else {
      // 기본 동작: 미리보기 확장/축소
      setIsPreviewExpanded(prev => !prev);
    }
  }, [onDiaryClick]);

  /**
   * @description 미리보기 토글 핸들러
   */
  const handlePreviewToggle = useCallback(() => {
    setIsPreviewExpanded(prev => !prev);
  }, []);

  // ================================
  // Effects
  // ================================

  /**
   * @description 선택된 날짜 변경 시 일기 조회
   */
  useEffect(() => {
    if (selectedDate) {
      setInternalError(null);
      setIsPreviewExpanded(false);
      loadDiaryForDate(selectedDate);
    }
  }, [selectedDate, loadDiaryForDate]);

  /**
   * @description 로딩 상태 변경 알림
   */
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  // ================================
  // 렌더링 헬퍼 함수
  // ================================

  /**
   * @description 섹션 헤더 렌더링
   * @returns {JSX.Element} 섹션 헤더
   */
  const renderHeader = () => (
    <div className={styles.header}>
      <h4 className={styles.title}>
        일기
        {hasDiary && (
          <span className={styles.badge}>1</span>
        )}
        {showEmotionSummary && emotionText && (
          <span className={styles.emotionBadge}>
            {emotionText}
          </span>
        )}
      </h4>

      <div className={styles.headerActions}>
        {showAddButton && selectedDate && (
          <button
            className={styles.addBtn}
            onClick={hasDiary ? handleEditDiary : handleAddDiary}
            aria-label={hasDiary ? "일기 수정" : "일기 작성"}
            title={hasDiary ? "일기 수정" : "새 일기 작성"}
          >
            {hasDiary ? '✏️' : '+'}
          </button>
        )}
      </div>
    </div>
  );

  /**
   * @description 에러 상태 렌더링
   * @returns {JSX.Element} 에러 메시지
   */
  const renderError = () => (
    <div className={styles.error}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          ⚠️
        </div>
        <div className={styles.errorText}>
          <h5 className={styles.errorTitle}>문제가 발생했습니다</h5>
          <p className={styles.errorMessage}>
            {internalError || error}
          </p>
        </div>
      </div>
      <button
        className={styles.retryBtn}
        onClick={handleRefresh}
        disabled={loading}
      >
        <span className={styles.retryIcon}>↻</span>
        <span className={styles.retryText}>
          {loading ? '다시 시도 중...' : '다시 시도'}
        </span>
      </button>
    </div>
  );

  /**
   * @description 로딩 상태 렌더링
   * @returns {JSX.Element} 로딩 컴포넌트
   */
  const renderLoading = () => (
    <div className={styles.loading}>
      <Loading size="small" message="일기를 불러오는 중..." />
    </div>
  );

  /**
   * @description 빈 상태 렌더링
   * @returns {JSX.Element} 빈 상태 컴포넌트
   */
  const renderEmptyState = () => (
    <EmptyState
      message={selectedDate ? "작성된 일기가 없습니다." : "날짜를 선택해주세요."}
      actionText={selectedDate && showAddButton ? "일기 작성" : null}
      onAction={selectedDate && showAddButton ? handleAddDiary : null}
    />
  );

  /**
   * @description 일기 내용 렌더링
   * @returns {JSX.Element} 일기 컴포넌트
   */
  const renderDiary = () => (
    <div className={styles.diaryContainer}>
      <DiaryItem
        diary={currentDiary}
        onClick={handleDiaryClick}
        displayMode={displayMode}
        isExpanded={isPreviewExpanded}
        onToggleExpand={handlePreviewToggle}
        selectedDate={selectedDate}
      />

      {displayMode === 'sidebar' && currentDiary && (
        <div className={styles.diaryMeta}>
          <div className={styles.metaRow}>
            {emotionText && (
              <span className={styles.metaItem}>
                {emotionText}
              </span>
            )}
            {weatherText && (
              <span className={styles.metaItem}>
                {weatherText}
              </span>
            )}
          </div>

          {currentDiary.createdAt && (
            <div className={styles.timestamp}>
              작성: {new Date(currentDiary.createdAt).toLocaleString('ko-KR')}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ================================
  // 메인 렌더링
  // ================================

  return (
    <div
      className={`${styles.diarySection} ${styles[`diarySection--${displayMode}`]}`}
      data-testid="diary-section"
      data-selected-date={selectedDate}
      data-display-mode={displayMode}
      data-has-diary={hasDiary}
    >
      {renderHeader()}

      <div className={styles.content}>
        {loading && renderLoading()}
        {(internalError || error) && !loading && renderError()}
        {!loading && !(internalError || error) && !hasDiary && renderEmptyState()}
        {!loading && !(internalError || error) && hasDiary && renderDiary()}
      </div>
    </div>
  );
};

// ================================
// PropTypes 정의
// ================================

DiarySection.propTypes = {
  /** 선택된 날짜 (YYYY-MM-DD 형식) */
  selectedDate: PropTypes.string,

  /** 표시 모드 */
  displayMode: PropTypes.oneOf(['sidebar', 'modal', 'standalone']),

  /** 로딩 상태 변경 콜백 */
  onLoadingChange: PropTypes.func,

  /** 일기 클릭 콜백 */
  onDiaryClick: PropTypes.func,

  /** 추가 버튼 표시 여부 */
  showAddButton: PropTypes.bool,

  /** 감정 요약 표시 여부 */
  showEmotionSummary: PropTypes.bool
};

DiarySection.defaultProps = {
  selectedDate: null,
  displayMode: 'standalone',
  onLoadingChange: null,
  onDiaryClick: null,
  showAddButton: true,
  showEmotionSummary: false
};

export default DiarySection;
