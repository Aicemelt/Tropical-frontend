/**
 * @fileoverview 일기 아이템 컴포넌트
 * @description 개별 일기를 표시하고 호버 시 CRUD 액션을 제공하는 컴포넌트
 * @author 신동준
 * @since 2025-09-19
 * @version 2.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// 스타일 import
import styles from '../../styles/components/DiaryItem.module.scss';

// 훅 import
import { useDiary } from '../../hooks/diary/useDiary.js';
import { useModalStore } from "../../store/useModalStore.js";

// 상수 import (기존 diaryApi.js에서 정의된 감정/날씨 상수 활용)
import { EMOTIONS, WEATHER } from '../../services/diaryApi.js';

/**
 * @component DiaryItem
 * @description 개별 일기를 표시하는 아이템 컴포넌트
 * 감정/날씨 아이콘, 호버 시 수정/삭제 버튼, 감정별 배경 그라데이션 제공
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.diary - 일기 객체
 * @param {Function} [props.onClick] - 일기 클릭 콜백
 * @param {'sidebar'|'modal'|'standalone'} [props.displayMode='standalone'] - 표시 모드
 * @param {boolean} [props.isExpanded=false] - 확장 상태
 * @param {Function} [props.onToggleExpand] - 확장 토글 콜백
 *
 * @returns {JSX.Element} DiaryItem 컴포넌트
 *
 * @example
 * <DiaryItem
 *   diary={diaryData}
 *   onClick={handleDiaryClick}
 *   displayMode="sidebar"
 *   isExpanded={false}
 * />
 *
 * @since 2025-09-19
 * @author 신동준
 */
const DiaryItem = ({
  diary,
  onClick,
  displayMode = 'standalone',
  isExpanded = false,
  onToggleExpand
}) => {
  // ================================
  // 커스텀 훅 사용
  // ================================

  const { deleteDiary } = useDiary();
  const { openModal } = useModalStore();

  // ================================
  // 로컬 상태 관리
  // ================================

  /**
   * @description 호버 상태
   * @type {boolean}
   */
  const [isHovered, setIsHovered] = useState(false);

  /**
   * @description 삭제 확인 상태
   * @type {boolean}
   */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ================================
  // 계산된 값들
  // ================================

  /**
   * @description 감정 정보 계산
   * @returns {Object} 감정 메타데이터
   */
  const emotionInfo = useMemo(() => {
    if (!diary?.emotion) return EMOTIONS.JOY; // 기본값
    return EMOTIONS[diary.emotion] || EMOTIONS.JOY;
  }, [diary?.emotion]);

  /**
   * @description 날씨 정보 계산
   * @returns {Object} 날씨 메타데이터
   */
  const weatherInfo = useMemo(() => {
    if (!diary?.weather) return null;
    return WEATHER[diary.weather] || null;
  }, [diary?.weather]);

  /**
   * @description 일기 내용 미리보기 (80자 제한)
   * @returns {string} 축약된 내용
   */
  const previewContent = useMemo(() => {
    if (!diary?.content) return '';
    return diary.content.length > 80
      ? `${diary.content.substring(0, 80)}...`
      : diary.content;
  }, [diary?.content]);

  /**
   * @description 작성 날짜 포맷팅
   * @returns {string} 포맷팅된 날짜
   */
  const formattedDate = useMemo(() => {
    if (!diary?.date && !diary?.createdAt) return '';

    try {
      const dateStr = diary.date || diary.createdAt.split('T')[0];
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}월 ${day}일`;
    } catch {
      return '';
    }
  }, [diary?.date, diary?.createdAt]);

  /**
   * @description 아이템 CSS 클래스명 계산
   * @returns {string} 조합된 클래스명
   */
  const itemClassName = useMemo(() => {
    return [
      styles.diaryItem,
      styles[`diaryItem--${displayMode}`],
      styles[`diaryItem--${emotionInfo.key.toLowerCase()}`],
      isHovered && styles['diaryItem--hovered'],
      isExpanded && styles['diaryItem--expanded'],
      showDeleteConfirm && styles['diaryItem--delete-confirm']
    ].filter(Boolean).join(' ');
  }, [displayMode, emotionInfo.key, isHovered, isExpanded, showDeleteConfirm]);

  /**
   * @description 감정별 배경 그라데이션 스타일
   * @returns {Object} 인라인 스타일
   */
  const backgroundStyle = useMemo(() => {
    const baseColor = emotionInfo.color;
    return {
      background: `linear-gradient(135deg, ${baseColor}20 0%, ${baseColor}10 100%)`,
      borderLeft: `4px solid ${baseColor}`
    };
  }, [emotionInfo.color]);

  // ================================
  // 이벤트 핸들러
  // ================================

  /**
   * @description 수정 버튼 클릭 핸들러
   */
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    openModal('diary', 'edit', diary);
  }, [openModal, diary]);

  /**
   * @description 삭제 버튼 클릭 핸들러
   */
  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  }, []);

  /**
   * @description 삭제 확인 핸들러
   */
  const handleConfirmDelete = useCallback(async (event) => {
    event.stopPropagation();

    if (!diary?.id) return;

    try {
      await deleteDiary(diary.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('일기 삭제 실패:', error);
      setShowDeleteConfirm(false);
    }
  }, [diary?.id, deleteDiary]);

  /**
   * @description 삭제 취소 핸들러
   */
  const handleCancelDelete = useCallback((event) => {
    event.stopPropagation();
    setShowDeleteConfirm(false);
  }, []);

  /**
   * @description 아이템 클릭 핸들러
   */
  const handleItemClick = useCallback(() => {
    if (showDeleteConfirm) return;

    if (onClick) {
      onClick(diary);
    } else if (onToggleExpand) {
      onToggleExpand();
    } else {
      // 기본 동작: 수정 모달 열기
      openModal('diary', 'edit', diary);
    }
  }, [diary, onClick, onToggleExpand, openModal, showDeleteConfirm]);

  /**
   * @description 마우스 진입 핸들러
   */
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  /**
   * @description 마우스 이탈 핸들러
   */
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(false);
    }
  }, [showDeleteConfirm]);

  // ================================
  // 렌더링 헬퍼 함수
  // ================================

  /**
   * @description 감정/날씨 아이콘 영역 렌더링
   * @returns {JSX.Element} 정보 영역
   */
  const renderInfoArea = () => (
    <div className={styles.infoArea}>
      <div className={styles.emotionContainer}>
        <img
          src={emotionInfo.imagePath}
          alt={emotionInfo.label}
          className={styles.emotionIcon}
          onError={(e) => {
            // 이미지 로드 실패 시 이모지로 대체
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'inline-block';
          }}
        />
        <span
          className={styles.emotionEmoji}
          style={{ display: 'none' }}
        >
          {emotionInfo.emoji}
        </span>
      </div>

      {weatherInfo && (
        <div className={styles.weatherContainer}>
          <img
            src={weatherInfo.imagePath}
            alt={weatherInfo.label}
            className={styles.weatherIcon}
            onError={(e) => {
              // 이미지 로드 실패 시 이모지로 대체
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
          <span
            className={styles.weatherEmoji}
            style={{ display: 'none' }}
          >
            {weatherInfo.emoji}
          </span>
        </div>
      )}

      {formattedDate && (
        <span className={styles.date}>
          {formattedDate}
        </span>
      )}
    </div>
  );

  /**
   * @description 액션 버튼들 렌더링
   * @returns {JSX.Element} 액션 버튼들
   */
  const renderActions = () => {
    if (showDeleteConfirm) {
      return (
        <div className={styles.deleteConfirm}>
          <span className={styles.deleteConfirmText}>삭제하시겠습니까?</span>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirmDelete}
            aria-label="삭제 확인"
          >
            확인
          </button>
          <button
            className={styles.cancelBtn}
            onClick={handleCancelDelete}
            aria-label="삭제 취소"
          >
            취소
          </button>
        </div>
      );
    }

    return (
      <div className={`${styles.actions} ${isHovered ? styles.actionsVisible : ''}`}>
        <button
          className={styles.editBtn}
          onClick={handleEdit}
          aria-label={`${diary?.title || '일기'} 수정`}
          title="수정"
        >
          ✏️
        </button>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          aria-label={`${diary?.title || '일기'} 삭제`}
          title="삭제"
        >
          🗑️
        </button>
      </div>
    );
  };

  /**
   * @description 일기 내용 렌더링
   * @returns {JSX.Element} 일기 내용
   */
  const renderContent = () => (
    <div className={styles.content}>
      {diary?.title && (
        <h4 className={styles.title}>
          {diary.title}
        </h4>
      )}

      <p className={styles.text}>
        {isExpanded ? diary?.content : previewContent}
      </p>

      {diary?.content && diary.content.length > 80 && onToggleExpand && (
        <button
          className={styles.expandBtn}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          aria-label={isExpanded ? '접기' : '더보기'}
        >
          {isExpanded ? '접기' : '더보기'}
        </button>
      )}
    </div>
  );

  /**
   * @description 생성 시간 렌더링
   * @returns {JSX.Element|null} 생성 시간
   */
  const renderTimestamp = () => {
    if (displayMode === 'sidebar' && diary?.createdAt) {
      try {
        const timestamp = new Date(diary.createdAt).toLocaleString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return (
          <div className={styles.timestamp}>
            작성: {timestamp}
          </div>
        );
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  // ================================
  // 메인 렌더링
  // ================================

  if (!diary) {
    return null;
  }

  return (
    <div
      className={itemClassName}
      style={backgroundStyle}
      onClick={handleItemClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="diary-item"
      data-diary-id={diary.id}
      data-emotion={diary.emotion}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleItemClick();
        }
      }}
    >
      <div className={styles.main}>
        {renderInfoArea()}
        {renderContent()}
        {renderActions()}
      </div>

      {renderTimestamp()}
    </div>
  );
};

// ================================
// PropTypes 정의
// ================================

DiaryItem.propTypes = {
  /** 일기 객체 */
  diary: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
    emotion: PropTypes.oneOf(['JOY', 'SADNESS', 'ANGER', 'ANXIETY', 'CALM']),
    weather: PropTypes.oneOf(['SUNNY', 'CLOUDY', 'RAINY', 'SNOWY', 'WINDY']),
    date: PropTypes.string,
    createdAt: PropTypes.string
  }),

  /** 일기 클릭 콜백 */
  onClick: PropTypes.func,

  /** 표시 모드 */
  displayMode: PropTypes.oneOf(['sidebar', 'modal', 'standalone']),

  /** 확장 상태 */
  isExpanded: PropTypes.bool,

  /** 확장 토글 콜백 */
  onToggleExpand: PropTypes.func
};

DiaryItem.defaultProps = {
  diary: null,
  onClick: null,
  displayMode: 'standalone',
  isExpanded: false,
  onToggleExpand: null
};

export default DiaryItem;
