/**
 * @fileoverview 일정 아이템 컴포넌트
 * @description 개별 일정을 표시하고 CRUD 액션을 제공하는 컴포넌트
 * @author 신동준
 * @since 2025-09-21
 * @version 3.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// 훅 import
import { useSchedule } from '../../hooks/schedule/useSchedule.js';

/**
 * @component ScheduleItem
 * @description 개별 일정을 표시하는 아이템 컴포넌트
 * 깔끔한 디자인으로 삭제 버튼과 완료 토글을 텍스트 형태로 제공
 */
const ScheduleItem = ({
  schedule,
  onClick,
  displayMode = 'standalone'
}) => {
  const { updateSchedule, deleteSchedule } = useSchedule();

  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingComplete, setIsUpdatingComplete] = useState(false);

  // 시간 포맷팅
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

  // 날짜 포맷팅 추가
  const formattedDate = useMemo(() => {
    const scheduleDate = schedule?.scheduleDate || schedule?.date || schedule?.startDate;
    if (!scheduleDate) return '';

    try {
      const date = new Date(scheduleDate);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[date.getDay()];
      return `${month}월 ${day}일 (${weekday})`;
    } catch {
      return scheduleDate;
    }
  }, [schedule?.scheduleDate, schedule?.date, schedule?.startDate]);

  // 완료 상태 토글 핸들러 수정
  const handleCompleteToggle = useCallback(async (event) => {
    event.stopPropagation();

    const scheduleId = schedule?.id || schedule?.scheduleId || schedule?.schedule_id;
    if (!scheduleId || isUpdatingComplete) return;

    try {
      setIsUpdatingComplete(true);

      // 전역 핸들러 사용
      if (window.handleScheduleToggle) {
        await window.handleScheduleToggle(schedule);
      } else {
        // 백업: 직접 업데이트
        const updatedSchedule = {
          ...schedule,
          isCompleted: !schedule.isCompleted
        };

        await updateSchedule(scheduleId, updatedSchedule);
      }

    } catch (error) {
      console.error('일정 완료 상태 업데이트 실패:', error);
    } finally {
      setIsUpdatingComplete(false);
    }
  }, [schedule, updateSchedule, isUpdatingComplete]);

  // 수정 버튼 클릭 핸들러
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    if (window.ModalManager) {
      window.ModalManager.openScheduleEdit(schedule);
    }
  }, [schedule]);

  // 삭제 버튼 클릭 핸들러
  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  }, []);

  // 삭제 확인 핸들러
  const handleConfirmDelete = useCallback(async (event) => {
    event.stopPropagation();

    const scheduleId = schedule?.id || schedule?.scheduleId || schedule?.schedule_id;
    if (!scheduleId) return;

    try {
      // IntegratedCalendar의 handleEventUpdate를 통해 삭제 워크플로우 실행
      if (window.handleScheduleDelete) {
        await window.handleScheduleDelete(schedule);
      } else {
        // 백업: 직접 삭제 (하지만 이제 사용되지 않을 예정)
        await deleteSchedule(scheduleId);
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      setShowDeleteConfirm(false);
    }
  }, [schedule, deleteSchedule]);

  // 삭제 취소 핸들러
  const handleCancelDelete = useCallback((event) => {
    event.stopPropagation();
    setShowDeleteConfirm(false);
  }, []);

  // 아이템 클릭 핸들러
  const handleItemClick = useCallback(() => {
    if (showDeleteConfirm) return;

    if (onClick) {
      onClick(schedule);
    } else {
      handleEdit({ stopPropagation: () => {} });
    }
  }, [schedule, onClick, handleEdit, showDeleteConfirm]);

  if (!schedule) {
    return null;
  }

  const title = schedule.title || '제목 없음';
  const location = schedule.location;
  const memo = schedule.memo;
  const attendees = schedule.attendees || schedule.participants; // attendees 우선, participants 백업

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        padding: '16px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isHovered ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        opacity: schedule.isCompleted ? 0.8 : 1
      }}
      onClick={handleItemClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 제목과 날짜 영역 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#1a1a1a',
          lineHeight: '1.4',
          flex: 1
        }}>
          {title.length > 30 ? `${title.substring(0, 30)}...` : title}
        </h4>

        {formattedDate && (
          <span style={{
            fontSize: '12px',
            color: '#666',
            backgroundColor: '#f0f0f0',
            padding: '2px 6px',
            borderRadius: '4px',
            marginLeft: '8px',
            whiteSpace: 'nowrap'
          }}>
            {formattedDate}
          </span>
        )}
      </div>

      {/* 시간 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: (location || memo || attendees) ? '8px' : '12px'
      }}>
        <span style={{
          fontSize: '14px',
          color: '#666',
          backgroundColor: '#f5f5f5',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          ⏰ {formattedTime}
        </span>
      </div>

      {/* 추가 정보 - 장소와 참가자를 같은 줄에 표시 */}
      {(location || attendees || memo) && (
        <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* 장소와 참가자를 한 줄에 표시 */}
          {(location || attendees) && (
            <div style={{
              fontSize: '14px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              {location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>📍</span>
                  <span>{location.length > 20 ? `${location.substring(0, 20)}...` : location}</span>
                </div>
              )}
              {attendees && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>👥</span>
                  <span>{attendees.length > 20 ? `${attendees.substring(0, 20)}...` : attendees}</span>
                </div>
              )}
            </div>
          )}

          {memo && (
            <div style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.4',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px'
            }}>
              <span style={{ fontSize: '16px' }}>💭</span>
              <span>{memo.length > 50 ? `${memo.substring(0, 50)}...` : memo}</span>
            </div>
          )}
        </div>
      )}

      {/* 하단 액션 영역 - iOS 스타일 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
      }}>
        {/* 왼쪽: 수정/삭제 버튼 - iOS 스타일 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {showDeleteConfirm ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '15px',
                color: '#8E8E93',
                fontWeight: '500'
              }}>정말 삭제하시겠습니까?</span>
              <button
                onClick={handleConfirmDelete}
                style={{
                  background: '#FF3B30',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(255, 59, 48, 0.3)'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                삭제
              </button>
              <button
                onClick={handleCancelDelete}
                style={{
                  background: '#F2F2F7',
                  border: 'none',
                  color: '#8E8E93',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                취소
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleEdit}
                style={{
                  background: '#007AFF',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '16px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                  minWidth: '60px'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: '#F2F2F7',
                  border: 'none',
                  color: '#FF3B30',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '16px',
                  transition: 'all 0.2s ease',
                  minWidth: '60px'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                삭제
              </button>
            </>
          )}
        </div>

        {/* 오른쪽: 완료 토글 - iOS 스타일 */}
        <button
          onClick={handleCompleteToggle}
          disabled={isUpdatingComplete}
          style={{
            background: schedule.isCompleted
              ? 'linear-gradient(135deg, #34C759 0%, #30D158 100%)'
              : '#F2F2F7',
            border: 'none',
            color: schedule.isCompleted ? 'white' : '#8E8E93',
            cursor: isUpdatingComplete ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '16px',
            opacity: isUpdatingComplete ? 0.6 : 1,
            transition: 'all 0.3s ease',
            boxShadow: schedule.isCompleted
              ? '0 2px 8px rgba(52, 199, 89, 0.25)'
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
            minWidth: '80px',
            transform: isUpdatingComplete ? 'scale(0.95)' : 'scale(1)'
          }}
          onMouseDown={(e) => !isUpdatingComplete && (e.target.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => !isUpdatingComplete && (e.target.style.transform = 'scale(1)')}
          onMouseLeave={(e) => !isUpdatingComplete && (e.target.style.transform = 'scale(1)')}
        >
          {isUpdatingComplete ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '12px',
                height: '12px',
                border: '2px solid currentColor',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              처리중
            </span>
          ) : (
            <>
              {schedule.isCompleted ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✓ 완료됨
                </span>
              ) : (
                '미완료'
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

ScheduleItem.propTypes = {
  schedule: PropTypes.shape({
    id: PropTypes.string,
    scheduleId: PropTypes.string,
    schedule_id: PropTypes.string,
    title: PropTypes.string.isRequired,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    isCompleted: PropTypes.bool,
    isAllDay: PropTypes.bool,
    memo: PropTypes.string,
    location: PropTypes.string
  }),
  onClick: PropTypes.func,
  displayMode: PropTypes.oneOf(['sidebar', 'modal', 'standalone'])
};


export default ScheduleItem;
