/**
 * @fileoverview 감정 선택 컴포넌트
 * @description 일기 작성 시 감정을 선택할 수 있는 UI 컴포넌트
 * @author 신동준
 * @since 2025-09-18
 * @version 1.0.0
 */

import React from 'react';
import { EMOTIONS } from '../../services/diaryApi.js';
import './EmotionSelector.scss';

/**
 * @description 감정 선택 컴포넌트
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.selectedEmotion - 현재 선택된 감정
 * @param {Function} props.onEmotionSelect - 감정 선택 콜백 함수
 * @param {boolean} props.disabled - 비활성화 여부 (기본값: false)
 * @param {boolean} props.error - 에러 상태 (기본값: false)
 * @param {string} props.size - 크기 ('small' | 'medium' | 'large', 기본값: 'medium')
 * @param {boolean} props.showLabel - 라벨 표시 여부 (기본값: true)
 * @param {string} props.className - 추가 CSS 클래스
 * @returns {JSX.Element} 감정 선택 컴포넌트
 */
const EmotionSelector = ({
  selectedEmotion = '',
  onEmotionSelect,
  disabled = false,
  error = false,
  size = 'medium',
  showLabel = true,
  className = ''
}) => {
  /**
   * @description 감정 선택 핸들러
   * @param {string} emotionKey - 선택된 감정 키
   */
  const handleEmotionClick = (emotionKey) => {
    if (disabled) return;

    // 선택된 감정을 콜백으로 전달 (선택 해제는 빈 문자열)
    const newEmotion = selectedEmotion === emotionKey ? '' : emotionKey;
    onEmotionSelect?.(newEmotion);
  };

  /**
   * @description 키보드 접근성을 위한 핸들러
   * @param {KeyboardEvent} event - 키보드 이벤트
   * @param {string} emotionKey - 감정 키
   */
  const handleKeyPress = (event, emotionKey) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleEmotionClick(emotionKey);
    }
  };

  return (
    <div className={`emotion-selector ${size} ${className} ${disabled ? 'disabled' : ''}`}>
      {showLabel && (
        <div className="emotion-selector__label">
          <span className="label-text">오늘의 기분</span>
          <span className="label-required">*</span>
        </div>
      )}

      <div className="emotion-selector__options">
        {Object.entries(EMOTIONS).map(([key, emotion]) => (
          <div
            key={key}
            className={`emotion-option ${selectedEmotion === key ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => handleEmotionClick(key)}
            onKeyDown={(e) => handleKeyPress(e, key)}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-pressed={selectedEmotion === key}
            aria-label={`${emotion.label} 선택`}
            title={emotion.label}
          >
            <div className="emotion-option__icon">
              <img
                src={emotion.imagePath}
                alt={emotion.label}
                className="emotion-image"
                onError={(e) => {
                  // 이미지 로드 실패 시 이모지로 대체
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="emotion-emoji" style={{ display: 'none' }}>
                {emotion.emoji}
              </span>
            </div>

            {showLabel && (
              <span className="emotion-option__label">
                {emotion.label}
              </span>
            )}

            {selectedEmotion === key && (
              <div
                className="emotion-option__check"
                style={{ color: emotion.color }}
              >
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedEmotion && (
        <div className="emotion-selector__selected">
          <span className="selected-text">
            선택된 감정: <strong>{EMOTIONS[selectedEmotion]?.label}</strong>
          </span>
          <button
            type="button"
            className="clear-button"
            onClick={() => handleEmotionClick(selectedEmotion)}
            disabled={disabled}
            aria-label="감정 선택 해제"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default EmotionSelector;
