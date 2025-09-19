/**
 * @fileoverview 일기 폼 컴포넌트
 * @description 일기 생성/수정을 위한 완전한 폼 컴포넌트
 * @author 신동준
 * @since 2025-09-19
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

// 컴포넌트 import
import EmotionSelector from './EmotionSelector.jsx';
import WeatherSelector from './WeatherSelector.jsx';

// 스타일 import
import styles from '../../styles/components/Form.module.scss';

// 훅 import
import { useDiary } from '../../hooks/diary/useDiary.js';

/**
 * @component DiaryForm
 * @description 일기 생성/수정을 위한 폼 컴포넌트
 * EmotionSelector/WeatherSelector 통합, 유효성 검사, 키보드 단축키 지원
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Function} props.onClose - 폼 닫기 콜백
 * @param {'create'|'edit'|'view'} [props.mode='create'] - 폼 모드
 * @param {Object} [props.initialData] - 초기 데이터 (수정 모드 시)
 * @param {string} [props.selectedDate] - 선택된 날짜 (YYYY-MM-DD 형식)
 * @param {Function} [props.onSuccess] - 성공 콜백
 * @param {Function} [props.onError] - 에러 콜백
 *
 * @returns {JSX.Element} DiaryForm 컴포넌트
 *
 * @example
 * <DiaryForm
 *   mode="create"
 *   selectedDate="2025-09-19"
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 * />
 *
 * @since 2025-09-19
 * @author 신동준
 */
const DiaryForm = ({
  onClose,
  mode = 'create',
  initialData = null,
  selectedDate = null,
  onSuccess,
  onError
}) => {
  // ================================
  // 커스텀 훅 사용
  // ================================

  const { createDiary, updateDiary, loading } = useDiary();

  // ================================
  // Ref 관리
  // ================================

  const titleRef = useRef();
  const contentRef = useRef();

  // ================================
  // 폼 상태 관리
  // ================================

  /**
   * @description 폼 데이터 상태
   */
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    emotion: '',
    weather: '',
    date: selectedDate || new Date().toISOString().split('T')[0]
  });

  /**
   * @description 폼 에러 상태
   */
  const [errors, setErrors] = useState({});

  /**
   * @description 폼 터치 상태 (실시간 검증을 위한)
   */
  const [touched, setTouched] = useState({});

  /**
   * @description 제출 시도 상태
   */
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ================================
  // Effects
  // ================================

  /**
   * @description 초기 데이터 설정
   */
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        emotion: initialData.emotion || '',
        weather: initialData.weather || '',
        date: initialData.date || selectedDate || new Date().toISOString().split('T')[0]
      });
    }
  }, [mode, initialData, selectedDate]);

  /**
   * @description 키보드 단축키 이벤트 리스너
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

  /**
   * @description 첫 번째 입력 필드에 포커스
   */
  useEffect(() => {
    setTimeout(() => {
      titleRef.current?.focus();
    }, 100);
  }, []);

  // ================================
  // 유효성 검사 함수
  // ================================

  /**
   * @description 폼 데이터 유효성 검사
   * @returns {Object} 에러 객체
   */
  const validateForm = useCallback(() => {
    const newErrors = {};

    // 제목 검증 (선택사항이지만 입력 시 길이 제한)
    if (formData.title && formData.title.length > 100) {
      newErrors.title = '제목은 100자 이내로 입력해주세요.';
    }

    // 내용 검증 (필수)
    if (!formData.content.trim()) {
      newErrors.content = '일기 내용을 입력해주세요.';
    } else if (formData.content.length > 2000) {
      newErrors.content = '내용은 2000자 이내로 입력해주세요.';
    }

    // 감정 검증 (필수)
    if (!formData.emotion) {
      newErrors.emotion = '감정을 선택해주세요.';
    }

    // 날짜 검증
    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요.';
    } else {
      const selectedDateObj = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // 오늘 끝까지 허용

      if (selectedDateObj > today) {
        newErrors.date = '미래 날짜의 일기는 작성할 수 없습니다.';
      }
    }

    return newErrors;
  }, [formData]);

  /**
   * @description 실시간 유효성 검사 업데이트
   */
  useEffect(() => {
    if (submitAttempted || Object.keys(touched).length > 0) {
      const newErrors = validateForm();
      setErrors(newErrors);
    }
  }, [formData, submitAttempted, touched, validateForm]);

  // ================================
  // 이벤트 핸들러
  // ================================

  /**
   * @description 입력 필드 변경 핸들러
   * @param {string} field - 필드명
   * @param {any} value - 변경된 값
   */
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  /**
   * @description 감정 선택 핸들러
   * @param {string} emotion - 선택된 감정
   */
  const handleEmotionSelect = useCallback((emotion) => {
    handleFieldChange('emotion', emotion);
  }, [handleFieldChange]);

  /**
   * @description 날씨 선택 핸들러
   * @param {string} weather - 선택된 날씨
   */
  const handleWeatherSelect = useCallback((weather) => {
    handleFieldChange('weather', weather);
  }, [handleFieldChange]);

  /**
   * @description 폼 제출 핸들러
   */
  const handleSubmit = useCallback(async () => {
    setSubmitAttempted(true);
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // 첫 번째 에러 필드에 포커스
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField === 'title' && titleRef.current) {
        titleRef.current.focus();
      } else if (firstErrorField === 'content' && contentRef.current) {
        contentRef.current.focus();
      }
      return;
    }

    try {
      const diaryData = {
        ...formData,
        // 제목이 비어있으면 날짜로 자동 생성
        title: formData.title.trim() || `${formData.date} 일기`
      };

      if (mode === 'edit' && initialData?.id) {
        await updateDiary(initialData.id, diaryData);
      } else {
        await createDiary(diaryData);
      }

      if (onSuccess) {
        onSuccess(diaryData);
      }

      onClose();
    } catch (error) {
      console.error('일기 저장 실패:', error);
      if (onError) {
        onError(error);
      }
      setErrors({
        submit: '일기 저장에 실패했습니다. 다시 시도해주세요.'
      });
    }
  }, [formData, mode, initialData, validateForm, createDiary, updateDiary, onSuccess, onError, onClose]);

  // ================================
  // 렌더링 헬퍼 함수
  // ================================

  /**
   * @description 에러 메시지 렌더링
   * @param {string} field - 필드명
   * @returns {JSX.Element|null} 에러 메시지
   */
  const renderError = (field) => {
    if (!errors[field]) return null;

    return (
      <span className={styles.errorMessage}>
        {errors[field]}
      </span>
    );
  };

  /**
   * @description 글자 수 카운터 렌더링
   * @param {string} text - 텍스트
   * @param {number} maxLength - 최대 길이
   * @returns {JSX.Element} 글자 수 카운터
   */
  const renderCharCount = (text, maxLength) => (
    <span className={`${styles.charCount} ${text.length > maxLength ? styles.error : ''}`}>
      {text.length}/{maxLength}
    </span>
  );

  /**
   * @description 날짜 포맷팅
   * @param {string} dateStr - 날짜 문자열
   * @returns {string} 포맷팅된 날짜
   */
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "연도. 월. 일";
    return dateStr.replace(/-/g, ".");
  }, []);

  // ================================
  // 메인 렌더링
  // ================================

  return (
    <form className={styles.diaryForm} onSubmit={(e) => e.preventDefault()}>
      {/* 폼 헤더 */}
      <div className={styles.titleArea}>
        <input
          ref={titleRef}
          type="text"
          className={`${styles.title} ${errors.title ? styles.error : ''}`}
          placeholder="일기 제목 (선택사항)"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          disabled={mode === 'view'}
          maxLength={100}
        />
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        />
      </div>
      {renderError('title')}

      <div className={styles.inputArea}>
        {/* 날짜 선택 */}
        <div>
          <span className={styles.label}>날짜</span>
          <div className={`${styles.dateWrapper} ${formData.date ? styles.selected : ''} ${errors.date ? styles.error : ''}`}>
            <span>{formatDate(formData.date)}</span>
            <input
              type="date"
              className={styles.overlayInput}
              value={formData.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              disabled={mode === 'view'}
              max={new Date().toISOString().split('T')[0]} // 오늘까지만 선택 가능
            />
          </div>
          {renderError('date')}
        </div>

        {/* 감정 선택 */}
        <div>
          <span className={styles.label}>
            감정 <span className={styles.required}>*</span>
          </span>
          <EmotionSelector
            selectedEmotion={formData.emotion}
            onEmotionSelect={handleEmotionSelect}
            disabled={mode === 'view'}
            error={!!errors.emotion}
          />
          {renderError('emotion')}
        </div>

        {/* 날씨 선택 */}
        <div>
          <span className={styles.label}>날씨</span>
          <WeatherSelector
            selectedWeather={formData.weather}
            onWeatherSelect={handleWeatherSelect}
            disabled={mode === 'view'}
          />
          {renderError('weather')}
        </div>

        {/* 일기 내용 */}
        <div>
          <span className={styles.label}>
            내용 <span className={styles.required}>*</span>
          </span>
          <textarea
            ref={contentRef}
            className={`${styles.textarea} ${styles.diaryContent} ${errors.content ? styles.error : ''}`}
            placeholder="오늘 하루는 어땠나요? 자유롭게 작성해보세요..."
            value={formData.content}
            onChange={(e) => handleFieldChange('content', e.target.value)}
            disabled={mode === 'view'}
            rows={8}
            maxLength={2000}
          />
          {formData.content && renderCharCount(formData.content, 2000)}
          {renderError('content')}
        </div>

        {/* 제출 에러 */}
        {renderError('submit')}

        {/* 폼 액션 버튼들 */}
        {mode !== 'view' && (
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '저장 중...' : (mode === 'edit' ? '수정' : '저장')}
              <span className={styles.shortcut}>Ctrl+Enter</span>
            </button>
          </div>
        )}
      </div>

      {/* 키보드 단축키 안내 */}
      <div className={styles.shortcuts}>
        <span>Ctrl+Enter: 저장</span>
        <span>Esc: 취소</span>
      </div>
    </form>
  );
};

// ================================
// PropTypes 정의
// ================================

DiaryForm.propTypes = {
  /** 폼 닫기 콜백 */
  onClose: PropTypes.func.isRequired,

  /** 폼 모드 */
  mode: PropTypes.oneOf(['create', 'edit', 'view']),

  /** 초기 데이터 (수정 모드 시) */
  initialData: PropTypes.object,

  /** 선택된 날짜 */
  selectedDate: PropTypes.string,

  /** 성공 콜백 */
  onSuccess: PropTypes.func,

  /** 에러 콜백 */
  onError: PropTypes.func
};

DiaryForm.defaultProps = {
  mode: 'create',
  initialData: null,
  selectedDate: null,
  onSuccess: null,
  onError: null
};

export default DiaryForm;