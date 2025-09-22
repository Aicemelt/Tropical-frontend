/**
 * @fileoverview 날씨 선택 컴포넌트
 * @description 일기 작성 시 날씨를 선택할 수 있는 UI 컴포넌트
 * @author 신동준
 * @since 2025-09-18
 * @version 1.0.0
 */

import React from 'react';
import { WEATHER } from '../../services/diaryApi.js';
import './WeatherSelector.scss';

/**
 * @description 날씨 선택 컴포넌트
 * @author 신동준
 * @since 2025-09-18
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.selectedWeather - 현재 선택된 날씨
 * @param {Function} props.onWeatherChange - 날씨 변경 콜백 함수
 * @param {boolean} props.disabled - 비활성화 여부 (기본값: false)
 * @param {string} props.size - 크기 ('small' | 'medium' | 'large', 기본값: 'medium')
 * @param {boolean} props.showLabel - 라벨 표시 여부 (기본값: true)
 * @param {string} props.layout - 레이아웃 ('horizontal' | 'vertical', 기본값: 'horizontal')
 * @param {string} props.className - 추가 CSS 클래스
 * @returns {JSX.Element} 날씨 선택 컴포넌트
 */
const WeatherSelector = ({
  selectedWeather = '',
  onWeatherChange,
  disabled = false,
  size = 'medium',
  showLabel = true,
  layout = 'horizontal',
  className = ''
}) => {
  /**
   * @description 날씨 선택 핸들러
   * @param {string} weatherKey - 선택된 날씨 키
   */
  const handleWeatherClick = (weatherKey) => {
    if (disabled) return;

    // 이미 선택된 날씨를 다시 클릭하면 선택 해제
    const newWeather = selectedWeather === weatherKey ? '' : weatherKey;
    onWeatherChange?.(newWeather);
  };

  /**
   * @description 키보드 접근성을 위한 핸들러
   * @param {KeyboardEvent} event - 키보드 이벤트
   * @param {string} weatherKey - 날씨 키
   */
  const handleKeyPress = (event, weatherKey) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleWeatherClick(weatherKey);
    }
  };

  return (
    <div className={`weather-selector ${size} ${layout} ${className} ${disabled ? 'disabled' : ''}`}>
      {showLabel && (
        <div className="weather-selector__label">
          <span className="label-text">오늘의 날씨</span>
          <span className="label-required">*</span>
        </div>
      )}

      <div className="weather-selector__options">
        {Object.entries(WEATHER).map(([key, weather]) => (
          <label
            key={key}
            className={`weather-option ${selectedWeather === key ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            title={weather.label}
          >
            <input
              type="radio"
              name="weather"
              value={key}
              checked={selectedWeather === key}
              onChange={() => handleWeatherClick(key)}
              onKeyDown={(e) => handleKeyPress(e, key)}
              disabled={disabled}
              className="weather-option__input"
              aria-label={`${weather.label} 선택`}
            />

            <div className="weather-option__content">
              <div
                className="weather-option__icon"
                style={{ color: weather.color }}
              >
                {weather.emoji}
              </div>

              {showLabel && (
                <span className="weather-option__label">
                  {weather.label}
                </span>
              )}
            </div>

            <div className="weather-option__radio"></div>
          </label>
        ))}
      </div>

      {selectedWeather && (
        <div className="weather-selector__selected">
          <div className="selected-weather">
            <span
              className="selected-icon"
              style={{ color: WEATHER[selectedWeather]?.color }}
            >
              {WEATHER[selectedWeather]?.emoji}
            </span>
            <span className="selected-text">
              {WEATHER[selectedWeather]?.label}
            </span>
          </div>
          <button
            type="button"
            className="clear-button"
            onClick={() => handleWeatherClick(selectedWeather)}
            disabled={disabled}
            aria-label="날씨 선택 해제"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default WeatherSelector;
