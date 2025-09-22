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
 * @param {Function} props.createSchedule - 일정 생성 함수 (부모에서 전달)
 * @param {Function} props.updateSchedule - 일정 수정 함수 (부모에서 전달)
 * @param {Function} props.deleteSchedule - 일정 삭제 함수 (부모에서 전달)
 * @param {boolean} props.loading - 로딩 상태 (부모에서 전달)
 *
 * @returns {JSX.Element} ScheduleForm 컴포넌트
 *
 * @example
 * <ScheduleForm
 *   mode="create"
 *   selectedDate="2025-09-19"
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 *   createSchedule={createSchedule}
 *   updateSchedule={updateSchedule}
 *   deleteSchedule={deleteSchedule}
 *   loading={loading}
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
  onError,
  onDelete,
  // 부모로부터 props로 받는 함수들
  createSchedule,
  updateSchedule,
  deleteSchedule,
  loading
}) => {

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
  const attendeesRef = useRef(); // participantsRef에서 attendeesRef로 변경

  // ================================
  // 폼 상태 관리
  // ================================

  /**
   * @description 폼 데이터 상태
   */
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate || '', // 단일 날짜 필드로 통합
    startTime: '',
    endTime: '',
    isAllDay: false,
    memo: '',
    location: '',
    attendees: '', // participants에서 attendees로 변경
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
    console.log('📅 ScheduleForm 초기 데이터 설정:', { mode, initialData, selectedDate });

    if (mode === 'edit' && initialData) {
      // ID 확인 및 로깅
      const scheduleId = initialData.id || initialData.scheduleId || initialData.schedule_id;
      console.log('📅 일정 ID 확인:', {
        id: initialData.id,
        scheduleId: initialData.scheduleId,
        schedule_id: initialData.schedule_id,
        finalId: scheduleId,
        fullInitialData: initialData
      });

      // 참여자 데이터 확인 및 로깅
      console.log('📅 참여자 데이터 확인:', {
        participants: initialData.participants,
        participantsList: initialData.participantsList,
        attendees: initialData.attendees
      });

      setFormData({
        id: scheduleId, // ID를 formData에 포함
        title: initialData.title || '',
        date: initialData.startDate?.split('T')[0] || initialData.scheduleDate || initialData.date || selectedDate || '',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        isAllDay: initialData.isAllDay || false,
        memo: initialData.memo || initialData.description || '',
        location: initialData.location || '',
        // 참여자 데이터를 여러 필드에서 확인하여 설정
        attendees: initialData.participants || initialData.participantsList || initialData.attendees || '',
        isCompleted: initialData.isCompleted || false
      });

      console.log('📅 ScheduleForm에 설정된 데이터:', {
        title: initialData.title,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
        participants: initialData.participants || initialData.participantsList || initialData.attendees,
        date: initialData.startDate || initialData.scheduleDate || initialData.date
      });

      // 참여자 필드에 포커스를 주어 확인 가능하도록 함
      setTimeout(() => {
        if (attendeesRef.current && (initialData.participants || initialData.participantsList || initialData.attendees)) {
          console.log('📅 참여자 필드에 설정된 값:', attendeesRef.current.value);
        }
      }, 100);
    } else if (mode === 'create') {
      // 생성 모드일 때 selectedDate로 폼 데이터 업데이트
      setFormData(prev => ({
        ...prev,
        date: selectedDate || ''
      }));
      console.log(`📅 ScheduleForm: 생성 모드 - 선택된 날짜로 설정: ${selectedDate}`);
    }
  }, [mode, initialData, selectedDate]);

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

    // 날짜 검증
    if (!formData.date || formData.date.trim() === '') {
      newErrors.date = '날짜를 선택해주세요.';
    }

    // 시간 검증 (종일이 아닐 때)
    if (!formData.isAllDay) {
      if (!formData.startTime || formData.startTime.trim() === '') {
        newErrors.startTime = '시작 시간을 선택해주세요.';
      }

      if (!formData.endTime || formData.endTime.trim() === '') {
        newErrors.endTime = '종료 시간을 선택해주세요.';
      }

      // 시간 순서 검증 (모든 필드가 유효할 때만)
      if (formData.date && formData.startTime && formData.endTime &&
          formData.date.trim() !== '' && formData.startTime.trim() !== '' && formData.endTime.trim() !== '') {

        const startDateTime = new Date(`${formData.date} ${formData.startTime}`);
        const endDateTime = new Date(`${formData.date} ${formData.endTime}`);

        if (endDateTime <= startDateTime) {
          newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다.';
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
    if (formData.attendees && formData.attendees.length > 200) {
      newErrors.participants = '참여자는 200자 이내로 입력해주세요.';
    }

    return newErrors;
  }, [formData]);

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
        date: startDateRef,
        startTime: startTimeRef,
        endTime: endTimeRef,
        memo: memoRef,
        location: locationRef,
        participants: attendeesRef // 변경된 필드명 반영
      }[firstErrorField];

      if (fieldRef?.current) {
        fieldRef.current.focus();
      }
      return;
    }

    try {
      const scheduleData = {
        ...formData,
        startDate: formData.date, // API 호환성을 위한 필드 추가
        scheduleDate: formData.date,
        endDate: formData.date // 같은 날짜로 설정
      };

      console.log('📅 일정 저장 시도:', { mode, scheduleData, initialData });

      let result;
      if (mode === 'edit') {
        // ID 확인 및 전달
        const scheduleId = formData.id || initialData?.id || initialData?.scheduleId || initialData?.schedule_id;
        console.log('📅 일정 수정 - ID 확인:', scheduleId);

        if (!scheduleId) {
          throw new Error('일정 ID가 없어서 수정할 수 없습니다.');
        }

        // ID를 scheduleData에 포함해서 전달
        const updateData = {
          ...scheduleData,
          id: scheduleId,
          scheduleId: scheduleId
        };

        console.log('📅 일정 수정 데이터:', updateData);
        result = await updateSchedule(scheduleId, updateData);
      } else {
        console.log('📅 일정 생성 데이터:', scheduleData);
        result = await createSchedule(scheduleData);
      }

      console.log('📅 일정 저장 성공:', result);

      // 성공 콜백 호출 - 상태 업데이트를 위해 반드시 호출
      if (onSuccess) {
        onSuccess(result || scheduleData);
      }

      onClose();
    } catch (error) {
      console.error('일정 저장 실패:', error);

      // API 에러 정보 추출
      const apiError = error.apiError || {};
      let errorMessage = '일정 저장에 실패했습니다.';

      if (apiError.status === 401) {
        errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
      } else if (apiError.status === 422) {
        errorMessage = '입력 데이터를 확인해주세요.';
      } else if (apiError.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message?.includes('Network')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // 에러가 발생해도 DB에 저장되었을 가능성이 있으므로 성공 콜백 호출
      if (onSuccess) {
        try {
          // 단순히 입력된 데이터로라도 UI 업데이트 시도
          onSuccess(scheduleData);
        } catch (callbackError) {
          console.warn('성공 콜백 호출 실패:', callbackError);
        }
      }

      if (onError) {
        onError(error);
      }

      setErrors({
        submit: errorMessage
      });
    }
  }, [formData, mode, initialData, validateForm, createSchedule, updateSchedule, onSuccess, onError, onClose]);

  /**
   * @description 일정 삭제 핸들러
   */
  const handleDelete = useCallback(async () => {
    // ID 확인 로직 개선 - 다양한 ID 필드에서 확인
    const scheduleId = formData.id || initialData?.id || initialData?.scheduleId || initialData?.schedule_id;

    if (!scheduleId) {
      console.error('삭제할 일정 ID가 없습니다:', { formData, initialData });
      setErrors({
        submit: '삭제할 일정 ID를 찾을 수 없습니다.'
      });
      return;
    }

    const confirmed = window.confirm('정말로 이 일정을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      console.log('📅 일정 삭제 시도:', { scheduleId, initialData });

      // 즉시 모달 닫기 (UI 반응성 향상)
      onClose();

      // 삭제 API 호출 (useSchedule에서 즉시 상태 업데이트됨)
      await deleteSchedule(scheduleId);
      console.log('📅 일정 삭제 성공:', scheduleId);

      // 삭제 성공 시 onDelete 콜백 호출 (상위 컴포넌트에 알림)
      if (onDelete) {
        onDelete(initialData);
      }

    } catch (error) {
      console.error('📅 일정 삭제 실패:', error);

      let errorMessage = '일정 삭제에 실패했습니다.';

      // API 에러 상세 처리
      const apiError = error.apiError || {};
      if (apiError.status === 404 || error.response?.status === 404) {
        errorMessage = '삭제할 일정을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.';
        // 404 에러인 경우 이미 삭제된 것으로 간주
        if (onDelete) {
          onDelete(initialData);
        }
        return;
      } else if (apiError.status === 403 || error.response?.status === 403) {
        errorMessage = '일정을 삭제할 권한이 없습니다.';
      } else if (apiError.status === 401 || error.response?.status === 401) {
        errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
      } else if (error.message?.includes('Network')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (onError) {
        onError(error);
      }

      setErrors({
        submit: errorMessage
      });
    }
  }, [formData, initialData, deleteSchedule, onError, onClose, onDelete]);

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
          {/* 날짜 표시 - 선택한 날짜로 고정 */}
          <div>
            <span className={styles.label}>날짜</span>
            <div
              className={`${styles.dateWrapper} ${styles.selected} ${styles.fixed}`}
              style={{
                backgroundColor: '#e3f2fd',
                border: '2px solid #4A90E2',
                cursor: 'default',
                position: 'relative'
              }}
            >
              <span style={{ color: '#1976d2', fontWeight: '600' }}>
                {formatDate(formData.date)}
                <small style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>
                  (선택된 날짜로 고정)
                </small>
              </span>
              {/* 히든 인풋으로 값 유지 */}
              <input
                ref={startDateRef}
                type="hidden"
                value={formData.date}
                readOnly
              />
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              💡 날짜는 선택한 날짜로 자동 고정됩니다
            </div>
            {renderError('date')}
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
            ref={attendeesRef} // 변경된 ref 이름
            type="text"
            className={`${styles.input} ${errors.participants ? styles.error : ''}`}
            placeholder="참여자를 입력하세요..."
            value={formData.attendees} // 변경된 필드명 반영
            onChange={(e) => handleFieldChange('attendees', e.target.value)} // 변경된 필드명 반영
            disabled={mode === 'view'}
            maxLength={200}
          />
          {formData.attendees && renderCharCount(formData.attendees, 200)}
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
            {/* 수정 모드일 때만 삭제 버튼 표시 */}
            {mode === 'edit' && (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
                disabled={loading}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginRight: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d32f2f';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f44336';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {loading ? '삭제 중...' : '삭제'}
              </button>
            )}

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
  onError: PropTypes.func,

  /** 삭제 콜백 */
  onDelete: PropTypes.func,

  /** 일정 생성 함수 (부모에서 전달) */
  createSchedule: PropTypes.func.isRequired,

  /** 일정 수정 함수 (부모에서 전달) */
  updateSchedule: PropTypes.func.isRequired,

  /** 일정 삭제 함수 (부모에서 전달) */
  deleteSchedule: PropTypes.func.isRequired,

  /** 로딩 상태 (부모에서 전달) */
  loading: PropTypes.bool.isRequired
};

ScheduleForm.defaultProps = {
  mode: 'create',
  initialData: null,
  selectedDate: null,
  onSuccess: null,
  onError: null,
  onDelete: null
};

export default ScheduleForm;
