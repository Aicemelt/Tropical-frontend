/**
 * @fileoverview 일기 아이템 컴포넌트
 * @description 개별 일기를 표시하고 CRUD 액션을 제공하는 컴포넌트
 * @author 신동준
 * @since 2025-09-21
 * @version 3.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// 상수 import
import { EMOTIONS, WEATHER } from '../../services/diaryApi.js';

/**
 * @component DiaryItem
 * @description 개별 일기를 표시하는 아이템 컴포넌트
 * 일정과 비슷한 깔끔한 디자인으로 삭제 버튼을 텍스트 형태로 제공
 */
const DiaryItem = ({
  diary,
  onClick,
  displayMode = 'standalone',
  isExpanded = false,
  onToggleExpand
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 감정 정보 계산
  const emotionInfo = useMemo(() => {
    if (!diary?.emotion) return EMOTIONS.JOY;
    return EMOTIONS[diary.emotion] || EMOTIONS.JOY;
  }, [diary?.emotion]);

  // 날씨 정보 계산
  const weatherInfo = useMemo(() => {
    if (!diary?.weather) return null;
    return WEATHER[diary.weather] || null;
  }, [diary?.weather]);

  // 일기 내용 미리보기
  const previewContent = useMemo(() => {
    if (!diary?.content) return '';
    return diary.content.length > 80
      ? `${diary.content.substring(0, 80)}...`
      : diary.content;
  }, [diary?.content]);

  // 작성 날짜 포맷팅
  const formattedDate = useMemo(() => {
    if (!diary?.date && !diary?.createdAt && !diary?.diaryDate) return '';

    try {
      const dateStr = diary.date || diary.diaryDate || diary.createdAt?.split('T')[0];
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[date.getDay()];
      return `${month}월 ${day}일 (${weekday})`;
    } catch {
      return '';
    }
  }, [diary?.date, diary?.diaryDate, diary?.createdAt]);

  // 수정 버튼 클릭 핸들러
  const handleEdit = useCallback((event) => {
    event.stopPropagation();
    if (window.ModalManager) {
      window.ModalManager.openDiaryEdit(diary);
    }
  }, [diary]);

  // 삭제 버튼 클릭 핸들러
  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  }, []);

  // 삭제 확인 핸들러
  const handleConfirmDelete = useCallback(async (event) => {
    event.stopPropagation();

    const diaryId = diary?.id || diary?.diaryId || diary?.diary_id;
    if (!diaryId) return;

    try {
      // IntegratedCalendar의 handleEventUpdate 호출
      if (window.handleDiaryDelete) {
        await window.handleDiaryDelete(diary);
      } else {
        // 직접 API 호출
        const { deleteDiary } = await import('../../services/diaryApi');
        await deleteDiary(diaryId);
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('일기 삭제 실패:', error);
      setShowDeleteConfirm(false);
    }
  }, [diary]);

  // 삭제 취소 핸들러
  const handleCancelDelete = useCallback((event) => {
    event.stopPropagation();
    setShowDeleteConfirm(false);
  }, []);

  // 아이템 클릭 핸들러
  const handleItemClick = useCallback(() => {
    if (showDeleteConfirm) return;

    if (onClick) {
      onClick(diary);
    } else {
      handleEdit({ stopPropagation: () => {} });
    }
  }, [diary, onClick, handleEdit, showDeleteConfirm]);

  if (!diary) {
    return null;
  }

  const title = diary.title || '제목 없음';
  const content = isExpanded ? diary.content : previewContent;

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
        boxShadow: isHovered ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
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

      {/* 감정/날씨 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: content ? '8px' : '12px'
      }}>
        <span style={{
          fontSize: '14px',
          color: '#666',
          backgroundColor: '#f5f5f5',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {emotionInfo.emoji} {emotionInfo.label}
        </span>

        {weatherInfo && (
          <span style={{
            fontSize: '14px',
            color: '#666',
            backgroundColor: '#f5f5f5',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {weatherInfo.emoji} {weatherInfo.label}
          </span>
        )}
      </div>

      {/* 일기 내용 */}
      {content && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#333',
            lineHeight: '1.5',
            backgroundColor: '#f9f9f9',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #f0f0f0'
          }}>
            {content}
          </p>

          {diary.content && diary.content.length > 80 && onToggleExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#007AFF',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                padding: '4px 0 0 0',
                marginTop: '4px'
              }}
            >
              {isExpanded ? '접기' : '더보기'}
            </button>
          )}
        </div>
      )}

      {/* 하단 액션 영역 - iOS 스타일 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
      }}>
        {/* 수정/삭제 버튼 - iOS 스타일 */}
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
      </div>
    </div>
  );
};

DiaryItem.propTypes = {
  diary: PropTypes.shape({
    id: PropTypes.string,
    diaryId: PropTypes.string,
    diary_id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    emotion: PropTypes.string,
    weather: PropTypes.string,
    date: PropTypes.string,
    diaryDate: PropTypes.string,
    createdAt: PropTypes.string
  }),
  onClick: PropTypes.func,
  displayMode: PropTypes.oneOf(['sidebar', 'modal', 'standalone']),
  isExpanded: PropTypes.bool,
  onToggleExpand: PropTypes.func
};

export default DiaryItem;
