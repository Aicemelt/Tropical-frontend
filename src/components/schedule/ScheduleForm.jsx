/**
 * @fileoverview 일정 폼 컴포넌트
 * @description 일정 생성/수정을 위한 완전한 폼 컴포넌트
 * @author 신동준
 * @since 2025-09-19
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

// 스타일 import
import styles from '../../styles/components/Form.module.scss';

// 훅 import
import { useSchedule } from '../../hooks/schedule/useSchedule.js';

/**
 * @component ScheduleForm
 * @description 일정 생성/수정을 위한 폼 컴포넌트
 * 유효성 검사, 키보드 단축키, 실시간 에러 표시 기능 제공
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Function} props.onClose - 폼 닫기 콜백
 * @param {'create'|'edit'|'view'} [props.mode='create'] - 폼 모드
 * @param {Object} [props.initialData] - 초기 데이터 (수정 모드 시)
 * @param {string} [props.selectedDate] - 선택된 날짜 (YYYY-MM-DD 형식)
 * @param {Function} [props.onSuccess] - 성공 콜백
 * @param {Function} [props.onError] - 에러 콜백
 *
 * @returns {JSX.Element} ScheduleForm 컴포넌트
 *
 * @example
 * <ScheduleForm
 *   mode="create"
 *   selectedDate="2025-09-19"
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 * />
 *
 * @since 2025-09-19
 * @author 신동준
 */
const ScheduleForm = ({
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

  const { createSchedule, updateSchedule, loading } = useSchedule();

  // ================================
  // Ref 관리
  // ================================

  const titleRef = useRef();
  const startTimeRef = useRef();
  const endTimeRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();
  const memoRef = useRef();
  const locationRef = useRef();
  const participantsRef = useRef();

  // ================================
  // 폼 상태 관리
  // ================================

  /**
   * @description 폼 데이터 상태
   */
  const [formData, setFormData] = useState({
    title: '',
    startDate: selectedDate || '',
    endDate: selectedDate || '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    memo: '',
    location: '',
    participants: '',
    isCompleted: false
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
        startDate: initialData.startDate?.split('T')[0] || initialData.date || selectedDate || '',
        endDate: initialData.endDate?.split('T')[0] || initialData.date || selectedDate || '',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        isAllDay: initialData.isAllDay || false,
        memo: initialData.memo || '',
        location: initialData.location || '',
        participants: initialData.participants || '',
        isCompleted: initialData.isCompleted || false
      });
    }
  }, [mode, initialData, selectedDate]);

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
      const fieldRef = {
        title: titleRef,
        startDate: startDateRef,
        endDate: endDateRef,
        startTime: startTimeRef,
        endTime: endTimeRef,
        memo: memoRef,
        location: locationRef,
        participants: participantsRef
      }[firstErrorField];

      if (fieldRef?.current) {
        fieldRef.current.focus();
      }
      return;
    }

    try {
      const scheduleData = {
        ...formData,
        date: formData.startDate // API 호환성을 위한 date 필드 추가
      };

      if (mode === 'edit' && initialData?.id) {
        await updateSchedule(initialData.id, scheduleData);
      } else {
        await createSchedule(scheduleData);
      }

      if (onSuccess) {
        onSuccess(scheduleData);
      }

      onClose();
    } catch (error) {
      console.error('일정 저장 실패:', error);
      if (onError) {
        onError(error);
      }
      setErrors({
        submit: '일정 저장에 실패했습니다. 다시 시도해주세요.'
      });
    }
  }, [formData, mode, initialData, createSchedule, updateSchedule, onSuccess, onError, onClose]);

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
  }, [handleSubmit, onClose]);

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

    // 제목 검증
    if (!formData.title.trim()) {
      newErrors.title = '일정 제목을 입력해주세요.';
    } else if (formData.title.length > 100) {
      newErrors.title = '제목은 100자 이내로 입력해주세요.';
    }

    // 시작 날짜 검증
    if (!formData.startDate) {
      newErrors.startDate = '시작 날짜를 선택해주세요.';
    }

    // 종료 날짜 검증
    if (!formData.endDate) {
      newErrors.endDate = '종료 날짜를 선택해주세요.';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = '종료 날짜는 시작 날짜보다 이후여야 합니다.';
    }

    // 시간 검증 (종일이 아닐 때)
    if (!formData.isAllDay) {
      if (!formData.startTime) {
        newErrors.startTime = '시작 시간을 선택해주세요.';
      }

      if (formData.startTime && formData.endTime) {
        const startDateTime = new Date(`${formData.startDate} ${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate} ${formData.endTime}`);

        if (endDateTime <= startDateTime) {
          newErrors.endTime = '종료 시간은 시작 시간보다 이후여야 합니다.';
        }
      }
    }

    // 메모 길이 검증
    if (formData.memo && formData.memo.length > 500) {
      newErrors.memo = '메모는 500자 이내로 입력해주세요.';
    }

    // 장소 길이 검증
    if (formData.location && formData.location.length > 100) {
      newErrors.location = '장소는 100자 이내로 입력해주세요.';
    }

    // 참여자 길이 검증
    if (formData.participants && formData.participants.length > 200) {
      newErrors.participants = '참여자는 200자 이내로 입력해주세요.';
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
   * @description 종일 일정 토글 핸들러
   */
  const handleAllDayToggle = useCallback(() => {
    const newIsAllDay = !formData.isAllDay;
    setFormData(prev => ({
      ...prev,
      isAllDay: newIsAllDay,
      startTime: newIsAllDay ? '' : prev.startTime,
      endTime: newIsAllDay ? '' : prev.endTime
    }));
  }, [formData.isAllDay]);

  // ================================
  // 포맷팅 함수들
  // ================================

  /**
   * @description 날짜 포맷팅
   * @param {string} dateStr - 날짜 문자열
   * @returns {string} 포맷팅된 날짜
   */
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "연도. 월. 일";
    return dateStr.replace(/-/g, ".");
  }, []);

  /**
   * @description 시간 포맷팅 (12시간제)
   * @param {string} timeStr - 시간 문자열
   * @returns {string} 포맷팅된 시간
   */
  const formatTime = useCallback((timeStr) => {
    if (!timeStr) return "-- --:--";

    const [hourStr, minute] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour < 12 ? "오전" : "오후";

    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;

    return `${ampm} ${hour.toString().padStart(2, "0")}:${minute}`;
  }, []);

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

  // ================================
  // 메인 렌더링
  // ================================

  return (
    <form className={styles.scheduleForm} onSubmit={(e) => e.preventDefault()}>
      {/* 폼 헤더 */}
      <div className={styles.titleArea}>
        <input
          ref={titleRef}
          type="text"
          className={`${styles.title} ${errors.title ? styles.error : ''}`}
          placeholder="일정 제목을 입력하세요..."
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
        {/* 종일 일정 토글 */}
        <div className={styles.allDayToggle}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={formData.isAllDay}
              onChange={handleAllDayToggle}
              disabled={mode === 'view'}
            />
            <span className={styles.toggleSlider}></span>
            종일 일정
          </label>
        </div>

        {/* 날짜 및 시간 입력 */}
        <div className={styles.grid2}>
          {/* 시작 날짜 */}
          <div>
            <span className={styles.label}>시작 날짜</span>
            <label
              className={`${styles.dateWrapper} ${formData.startDate ? styles.selected : ''} ${errors.startDate ? styles.error : ''}`}
              aria-label="시작 날짜 선택"
              onClick={() => mode !== 'view' && startDateRef.current?.showPicker?.()}
            >
              <span>{formatDate(formData.startDate)}</span>
              <input
                ref={startDateRef}
                type="date"
                className={styles.overlayInput}
                value={formData.startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                disabled={mode === 'view'}
              />
            </label>
            {renderError('startDate')}
          </div>

          {/* 종료 날짜 */}
          <div>
            <span className={styles.label}>종료 날짜</span>
            <label
              className={`${styles.dateWrapper} ${formData.endDate ? styles.selected : ''} ${errors.endDate ? styles.error : ''}`}
              aria-label="종료 날짜 선택"
              onClick={() => mode !== 'view' && endDateRef.current?.showPicker?.()}
            >
              <span>{formatDate(formData.endDate)}</span>
              <input
                ref={endDateRef}
                type="date"
                className={styles.overlayInput}
                value={formData.endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                disabled={mode === 'view'}
              />
            </label>
            {renderError('endDate')}
          </div>
        </div>

        {/* 시간 입력 (종일이 아닐 때만) */}
        {!formData.isAllDay && (
          <div className={styles.grid2}>
            {/* 시작 시간 */}
            <div>
              <span className={styles.label}>시작 시간</span>
              <label
                className={`${styles.dateWrapper} ${formData.startTime ? styles.selected : ''} ${errors.startTime ? styles.error : ''}`}
                aria-label="시작 시간 선택"
                onClick={() => mode !== 'view' && startTimeRef.current?.showPicker?.()}
              >
                <span>{formatTime(formData.startTime)}</span>
                <input
                  ref={startTimeRef}
                  type="time"
                  className={styles.overlayInput}
                  value={formData.startTime}
                  onChange={(e) => handleFieldChange('startTime', e.target.value)}
                  disabled={mode === 'view'}
                />
              </label>
              {renderError('startTime')}
            </div>

            {/* 종료 시간 */}
            <div>
              <span className={styles.label}>종료 시간</span>
              <label
                className={`${styles.dateWrapper} ${formData.endTime ? styles.selected : ''} ${errors.endTime ? styles.error : ''}`}
                aria-label="종료 시간 선택"
                onClick={() => mode !== 'view' && endTimeRef.current?.showPicker?.()}
              >
                <span>{formatTime(formData.endTime)}</span>
                <input
                  ref={endTimeRef}
                  type="time"
                  className={styles.overlayInput}
                  value={formData.endTime}
                  onChange={(e) => handleFieldChange('endTime', e.target.value)}
                  disabled={mode === 'view'}
                />
              </label>
              {renderError('endTime')}
            </div>
          </div>
        )}

        {/* 장소 입력 */}
        <div>
          <span className={styles.label}>장소</span>
          <input
            ref={locationRef}
            type="text"
            className={`${styles.input} ${errors.location ? styles.error : ''}`}
            placeholder="장소를 입력하세요..."
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            disabled={mode === 'view'}
            maxLength={100}
          />
          {formData.location && renderCharCount(formData.location, 100)}
          {renderError('location')}
        </div>

        {/* 참여자 입력 */}
        <div>
          <span className={styles.label}>참여자</span>
          <input
            ref={participantsRef}
            type="text"
            className={`${styles.input} ${errors.participants ? styles.error : ''}`}
            placeholder="참여자를 입력하세요..."
            value={formData.participants}
            onChange={(e) => handleFieldChange('participants', e.target.value)}
            disabled={mode === 'view'}
            maxLength={200}
          />
          {formData.participants && renderCharCount(formData.participants, 200)}
          {renderError('participants')}
        </div>

        {/* 메모 입력 */}
        <div>
          <span className={styles.label}>메모</span>
          <textarea
            ref={memoRef}
            className={`${styles.textarea} ${errors.memo ? styles.error : ''}`}
            placeholder="메모를 입력하세요..."
            value={formData.memo}
            onChange={(e) => handleFieldChange('memo', e.target.value)}
            disabled={mode === 'view'}
            rows={4}
            maxLength={500}
          />
          {formData.memo && renderCharCount(formData.memo, 500)}
          {renderError('memo')}
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

ScheduleForm.propTypes = {
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

ScheduleForm.defaultProps = {
  mode: 'create',
  initialData: null,
  selectedDate: null,
  onSuccess: null,
  onError: null
};

export default ScheduleForm;