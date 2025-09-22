/**
 * @fileoverview 일정 아이템 컴포넌트
 * @description 개별 일정을 표시하고 호버 시 CRUD 액션을 제공하는 컴포넌트
 * @author 신동준
 * @since 2025-09-19
 * @version 2.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// 스타일 import
import styles from '../../styles/components/ScheduleItem.module.scss';

// 훅 import
import { useSchedule } from '../../hooks/schedule/useSchedule.js';
import { useModalStore } from "../../store/useModalStore.js";

/**
 * @component ScheduleItem
 * @description 개별 일정을 표시하는 아이템 컴포넌트
 * 완료 체크박스, 호버 시 수정/삭제 버튼, 상세 정보 표시 기능 제공
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.schedule - 일정 객체
 * @param {Function} [props.onClick] - 일정 클릭 콜백
 * @param {'sidebar'|'modal'|'standalone'} [props.displayMode='standalone'] - 표시 모드
 *
 * @returns {JSX.Element} ScheduleItem 컴포넌트
 *
 * @example
 * <ScheduleItem
 *   schedule={scheduleData}
 *   onClick={handleScheduleClick}
 *   displayMode="sidebar"
 * />
 *
 * @since 2025-09-19
 * @author 신동준
 */
const ScheduleItem = ({
  schedule,
  onClick,
  displayMode = 'standalone'
}) => {
  // ================================
  // 커스텀 훅 사용
  // ================================

  const { updateSchedule, deleteSchedule } = useSchedule();
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

  /**
   * @description 완료 상태 업데이트 로딩
   * @type {boolean}
   */
  const [isUpdatingComplete, setIsUpdatingComplete] = useState(false);

  // ================================
  // 계산된 값들
  // ================================

  /**
   * @description 시간 포맷팅
   * @returns {string} 포맷팅된 시간 문자열
   */
  const formattedTime = useMemo(() => {
    if (schedule?.isAllDay) {
      return '종일';
    }

    if (!schedule?.startTime) {
      return '시간 미정';
    }

    const formatTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? '오후' : '오전';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${ampm} ${displayHour}:${minutes}`;
    };

    const startTime = formatTime(schedule.startTime);

    if (schedule.endTime) {
      const endTime = formatTime(schedule.endTime);
      return `${startTime} ~ ${endTime}`;
    }

    return startTime;
  }, [schedule?.startTime, schedule?.endTime, schedule?.isAllDay]);

  /**
   * @description 날짜 정보 포맷팅
   * @returns {string} 포맷팅된 날짜 문자열
   */
  const formattedDate = useMemo(() => {
    if (!schedule?.startDate) return '';

    try {
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startDate = formatDate(schedule.startDate);

      // 종일 일정이 아니고 종료일이 있고 시작일과 다른 경우
      if (!schedule.isAllDay && schedule.endDate && schedule.endDate !== schedule.startDate) {
        const endDate = formatDate(schedule.endDate);
        return `${startDate}~${endDate}`;
      }

      // 종일 일정이거나 같은 날이거나 종료일이 없는 경우
      return startDate;
    } catch {
      return '';
    }
  }, [schedule?.startDate, schedule?.endDate, schedule?.isAllDay]);

  /**
   * @description 메모 미리보기 (50자 제한)
   * @returns {string} 축약된 메모
   */
  const previewMemo = useMemo(() => {
    if (!schedule?.memo) return '';
    return schedule.memo.length > 50
      ? `${schedule.memo.substring(0, 50)}...`
      : schedule.memo;
  }, [schedule?.memo]);

  /**
   * @description 아이템 CSS 클래스명 계산
   * @returns {string} 조합된 클래스명
   */
  const itemClassName = useMemo(() => {
    return [
      styles.scheduleItem,
      styles[`scheduleItem--${displayMode}`],
      schedule?.isCompleted && styles['scheduleItem--completed'],
      isHovered && styles['scheduleItem--hovered'],
      showDeleteConfirm && styles['scheduleItem--delete-confirm']
    ].filter(Boolean).join(' ');
  }, [displayMode, schedule?.isCompleted, isHovered, showDeleteConfirm]);

  // ================================
  // 이벤트 핸들러
  // ================================

  /**
   * @description 완료 상태 토글 핸들러
   */
  const handleCompleteToggle = useCallback(async (event) => {
    event.stopPropagation();

    if (!schedule?.id || isUpdatingComplete) return;

    try {
      setIsUpdatingComplete(true);
      await updateSchedule(schedule.id, {
        ...schedule,
        isCompleted: !schedule.isCompleted
      });
    } catch (error) {
      console.error('일정 완료 상태 업데이트 실패:', error);
    } finally {
      setIsUpdatingComplete(false);
    }
  }, [schedule, updateSchedule, isUpdatingComplete]);

  /**
   * @description 수정 버튼 클릭 핸들러
   */
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    openModal('schedule', 'edit', schedule);
  }, [openModal, schedule]);

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

    if (!schedule?.id) return;

    try {
      await deleteSchedule(schedule.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      setShowDeleteConfirm(false);
    }
  }, [schedule?.id, deleteSchedule]);

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
      onClick(schedule);
    } else {
      // 기본 동작: 수정 모달 열기
      openModal('schedule', 'edit', schedule);
    }
  }, [schedule, onClick, openModal, showDeleteConfirm]);

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
   * @description 완료 체크박스 렌더링
   * @returns {JSX.Element} 체크박스
   */
  const renderCheckbox = () => (
    <div className={styles.checkbox}>
      <input
        type="checkbox"
        checked={schedule?.isCompleted || false}
        onChange={handleCompleteToggle}
        disabled={isUpdatingComplete}
        className={styles.checkboxInput}
        aria-label={`${schedule?.title} 완료 상태 토글`}
      />
      <span className={styles.checkboxMark}>
        {schedule?.isCompleted && '✓'}
      </span>
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
          aria-label={`${schedule?.title} 수정`}
          title="수정"
        >
          ✏️
        </button>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          aria-label={`${schedule?.title} 삭제`}
          title="삭제"
        >
          🗑️
        </button>
      </div>
    );
  };

  /**
   * @description 메타 정보 렌더링
   * @returns {JSX.Element|null} 메타 정보
   */
  const renderMeta = () => {
    if (schedule?.location || schedule?.participants || previewMemo) {
      return (
        <div className={styles.meta}>
          {schedule.location && (
            <span className={styles.metaItem}>
              장소: {schedule.location}
            </span>
          )}
          {schedule.participants && (
            <span className={styles.metaItem}>
              참여자: {schedule.participants}
            </span>
          )}
          {previewMemo && (
            <p className={styles.metaMemo}>
              메모: {previewMemo}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // ================================
  // 메인 렌더링
  // ================================

  if (!schedule) {
    return null;
  }

  return (
    <div
      className={itemClassName}
      onClick={handleItemClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="schedule-item"
      data-schedule-id={schedule.id}
      data-completed={schedule.isCompleted}
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
        {renderCheckbox()}

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.dateTimeInfo}>
              {formattedDate && (
                <span className={styles.date}>
                  날짜: {formattedDate}
                </span>
              )}
              <span className={styles.time}>
                시간: {formattedTime}
              </span>
            </div>
            <h4 className={styles.title}>
              {schedule.title || '제목 없음'}
            </h4>
          </div>

          {renderMeta()}
        </div>

        {renderActions()}
      </div>

      {isUpdatingComplete && (
        <div className={styles.updating}>
          <span className={styles.updatingText}>업데이트 중...</span>
        </div>
      )}
    </div>
  );
};

// ================================
// PropTypes 정의
// ================================

ScheduleItem.propTypes = {
  /** 일정 객체 */
  schedule: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    isCompleted: PropTypes.bool,
    isAllDay: PropTypes.bool,
    memo: PropTypes.string,
    location: PropTypes.string,
    participants: PropTypes.string,
    date: PropTypes.string,
    startDate: PropTypes.string
  }),

  /** 일정 클릭 콜백 */
  onClick: PropTypes.func,

  /** 표시 모드 */
  displayMode: PropTypes.oneOf(['sidebar', 'modal', 'standalone'])
};

ScheduleItem.defaultProps = {
  schedule: null,
  onClick: null,
  displayMode: 'standalone'
};

export default ScheduleItem;
