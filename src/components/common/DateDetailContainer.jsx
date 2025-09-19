/**
 * @fileoverview 날짜별 일정/일기 통합 표시 컨테이너
 * @description 선택된 날짜의 일정과 일기를 통합하여 표시하는 컨테이너 컴포넌트
 * @author 신동준
 * @since 2025-09-19
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import './DateDetailContainer.scss';

// 컴포넌트 import
import ScheduleSection from '../schedule/ScheduleSection.jsx';
import DiarySection from '../diary/DiarySection.jsx';
import Loading from './Loading/Loading.jsx';

/**
 * @component DateDetailContainer
 * @description 선택된 날짜의 일정과 일기를 통합 표시하는 컨테이너
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.selectedDate - 선택된 날짜 (YYYY-MM-DD 형식)
 * @param {'sidebar'|'modal'|'standalone'} props.displayMode - 표시 모드
 * @param {Function} [props.onDateChange] - 날짜 변경 콜백 함수
 * @param {boolean} [props.showAddButtons=true] - 추가 버튼 표시 여부
 * @param {boolean} [props.isLoading=false] - 로딩 상태
 * @param {string} [props.className] - 추가 CSS 클래스명
 *
 * @returns {JSX.Element} DateDetailContainer 컴포넌트
 *
 * @example
 * // FullCalendar 연동 시 사용법
 * <DateDetailContainer
 *   selectedDate="2025-09-19"
 *   displayMode="sidebar"
 *   onDateChange={handleDateChange}
 *   showAddButtons={true}
 * />
 *
 * @since 2025-09-19
 * @author 신동준
 */
const DateDetailContainer = ({
  selectedDate,
  displayMode = 'standalone',
  onDateChange,
  showAddButtons = true,
  isLoading = false,
  className = ''
}) => {
  // ================================
  // State Management
  // ================================

  /**
   * @description 컨테이너 내부 로딩 상태
   * @type {boolean}
   */
  const [internalLoading, setInternalLoading] = useState(false);

  /**
   * @description 에러 상태 관리
   * @type {string|null}
   */
  const [error, setError] = useState(null);

  // ================================
  // Computed Values
  // ================================

  /**
   * @description 선택된 날짜를 한국어 형식으로 포맷팅
   * @returns {string} 포맷팅된 날짜 문자열
   */
  const formattedDate = useMemo(() => {
    if (!selectedDate) return '날짜를 선택해주세요';

    try {
      const date = new Date(selectedDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

      return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '잘못된 날짜 형식';
    }
  }, [selectedDate]);

  /**
   * @description 컨테이너 CSS 클래스명 계산
   * @returns {string} 조합된 클래스명
   */
  const containerClassName = useMemo(() => {
    return [
      'date-detail-container',
      `date-detail-container--${displayMode}`,
      className
    ].filter(Boolean).join(' ');
  }, [displayMode, className]);

  /**
   * @description 전체 로딩 상태 계산
   * @returns {boolean} 로딩 상태
   */
  const totalLoading = useMemo(() => {
    return isLoading || internalLoading;
  }, [isLoading, internalLoading]);

  // ================================
  // Effects
  // ================================

  /**
   * @description 선택된 날짜 변경 시 에러 상태 초기화
   */
  useEffect(() => {
    if (selectedDate) {
      setError(null);
    }
  }, [selectedDate]);

  // ================================
  // Event Handlers
  // ================================

  /**
   * @description 일정 추가 버튼 클릭 핸들러
   * @param {Event} event - 클릭 이벤트
   */
  const handleAddSchedule = (event) => {
    event.preventDefault();
    console.log('일정 추가 버튼 클릭:', selectedDate);
    // TODO: 일정 추가 모달 열기 로직 구현
  };

  /**
   * @description 일기 추가 버튼 클릭 핸들러
   * @param {Event} event - 클릭 이벤트
   */
  const handleAddDiary = (event) => {
    event.preventDefault();
    console.log('일기 추가 버튼 클릭:', selectedDate);
    // TODO: 일기 추가 모달 열기 로직 구현
  };

  /**
   * @description 이전 날짜로 이동
   */
  const handlePreviousDate = () => {
    if (!selectedDate || !onDateChange) return;

    try {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() - 1);
      const newDate = date.toISOString().split('T')[0];
      onDateChange(newDate);
    } catch (error) {
      console.error('이전 날짜 이동 오류:', error);
      setError('날짜 이동 중 오류가 발생했습니다.');
    }
  };

  /**
   * @description 다음 날짜로 이동
   */
  const handleNextDate = () => {
    if (!selectedDate || !onDateChange) return;

    try {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + 1);
      const newDate = date.toISOString().split('T')[0];
      onDateChange(newDate);
    } catch (error) {
      console.error('다음 날짜 이동 오류:', error);
      setError('날짜 이동 중 오류가 발생했습니다.');
    }
  };

  // ================================
  // Render Helpers
  // ================================

  /**
   * @description 날짜 헤더 렌더링
   * @returns {JSX.Element} 날짜 헤더
   */
  const renderDateHeader = () => (
    <div className="date-detail-container__header">
      <div className="date-detail-container__date-navigation">
        {onDateChange && (
          <button
            type="button"
            className="date-detail-container__nav-button date-detail-container__nav-button--prev"
            onClick={handlePreviousDate}
            aria-label="이전 날짜"
          >
            ◀
          </button>
        )}

        <h2 className="date-detail-container__date-title">
          {formattedDate}
        </h2>

        {onDateChange && (
          <button
            type="button"
            className="date-detail-container__nav-button date-detail-container__nav-button--next"
            onClick={handleNextDate}
            aria-label="다음 날짜"
          >
            ▶
          </button>
        )}
      </div>

      {showAddButtons && selectedDate && (
        <div className="date-detail-container__actions">
          <button
            type="button"
            className="date-detail-container__add-button date-detail-container__add-button--schedule"
            onClick={handleAddSchedule}
          >
            <span className="date-detail-container__add-icon">+</span>
            일정 추가
          </button>

          <button
            type="button"
            className="date-detail-container__add-button date-detail-container__add-button--diary"
            onClick={handleAddDiary}
          >
            <span className="date-detail-container__add-icon">+</span>
            일기 작성
          </button>
        </div>
      )}
    </div>
  );

  /**
   * @description 에러 상태 렌더링
   * @returns {JSX.Element} 에러 메시지
   */
  const renderError = () => (
    <div className="date-detail-container__error">
      <p className="date-detail-container__error-message">
        {error}
      </p>
      <button
        type="button"
        className="date-detail-container__error-retry"
        onClick={() => setError(null)}
      >
        다시 시도
      </button>
    </div>
  );

  /**
   * @description 빈 상태 렌더링
   * @returns {JSX.Element} 빈 상태 메시지
   */
  const renderEmptyState = () => (
    <div className="date-detail-container__empty">
      <p className="date-detail-container__empty-message">
        날짜를 선택하면 해당 날짜의 일정과 일기를 확인할 수 있습니다.
      </p>
    </div>
  );

  /**
   * @description 콘텐츠 영역 렌더링
   * @returns {JSX.Element} 콘텐츠
   */
  const renderContent = () => {
    if (error) return renderError();
    if (!selectedDate) return renderEmptyState();

    return (
      <div className="date-detail-container__content">
        {/* 일정 섹션 */}
        <div className="date-detail-container__section">
          <ScheduleSection
            selectedDate={selectedDate}
            displayMode={displayMode}
            onLoadingChange={setInternalLoading}
          />
        </div>

        {/* 일기 섹션 */}
        <div className="date-detail-container__section">
          <DiarySection
            selectedDate={selectedDate}
            displayMode={displayMode}
            onLoadingChange={setInternalLoading}
          />
        </div>
      </div>
    );
  };

  // ================================
  // Main Render
  // ================================

  return (
    <div
      className={containerClassName}
      data-testid="date-detail-container"
      data-selected-date={selectedDate}
      data-display-mode={displayMode}
    >
      {renderDateHeader()}

      {totalLoading ? (
        <div className="date-detail-container__loading">
          <Loading size="medium" message="데이터를 불러오는 중..." />
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

// ================================
// PropTypes 정의
// ================================

DateDetailContainer.propTypes = {
  /** 선택된 날짜 (YYYY-MM-DD 형식) */
  selectedDate: PropTypes.string,

  /** 표시 모드 */
  displayMode: PropTypes.oneOf(['sidebar', 'modal', 'standalone']),

  /** 날짜 변경 콜백 함수 */
  onDateChange: PropTypes.func,

  /** 추가 버튼 표시 여부 */
  showAddButtons: PropTypes.bool,

  /** 로딩 상태 */
  isLoading: PropTypes.bool,

  /** 추가 CSS 클래스명 */
  className: PropTypes.string
};

DateDetailContainer.defaultProps = {
  selectedDate: null,
  displayMode: 'standalone',
  onDateChange: null,
  showAddButtons: true,
  isLoading: false,
  className: ''
};

export default DateDetailContainer;
