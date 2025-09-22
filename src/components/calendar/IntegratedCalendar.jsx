/**
 * @fileoverview 일정/일기 통합 캘린더 컴포넌트
 * @description 팀원 Calendar.jsx를 그대로 사용하면서 우리 일정/일기 기능 연동
 * @author 신동준
 * @since 2025-09-21
 * @version 1.1.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Calendar from './Calendar';
import ModalManager from '../common/ModalManager';
import { createDateClickHandler } from '../common/FullCalendarAdapter';
import { useSchedule } from '../../hooks/schedule/useSchedule';
import { getDiariesByMonth, createDiary, updateDiary, deleteDiary } from '../../services/diaryApi';
import ScheduleItem from '../schedule/ScheduleItem';
import DiaryItem from '../diary/DiaryItem';

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 일정/일기 통합 캘린더 컴포넌트
 */
const IntegratedCalendar = () => {
  const {
    schedules,
    loading: scheduleLoading,
    error: scheduleError,
    fetchSchedulesByMonth,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setSchedules
  } = useSchedule();

  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [showAllSchedules, setShowAllSchedules] = useState(false);

  // 강제 리렌더링을 위한 상태 추가
  const [forceUpdate, setForceUpdate] = useState(0);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '',
    item: null,
    message: ''
  });

  const [diaries, setDiaries] = useState([]);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [diaryError, setDiaryError] = useState(null);

  /**
   * 월별 일기 데이터 로딩
   */
  const fetchDiariesByMonth = useCallback(async (year, month) => {
    try {
      setDiaryLoading(true);
      setDiaryError(null);
      const monthDiaries = await getDiariesByMonth(year, month);
      setDiaries(monthDiaries);
    } catch (error) {
      console.error('일기 데이터 로딩 실패:', error);
      setDiaryError('일기를 불러오는데 실패했습니다.');
      setDiaries([]);
    } finally {
      setDiaryLoading(false);
    }
  }, []);

  /**
   * 날짜 선택 핸들러
   */
  const handleDateSelect = useCallback((dateInfo) => {
    const newSelectedDate = dateInfo.iso || dateInfo.dateStr || dateInfo;
    const todayString = getTodayString();
    const finalSelectedDate = newSelectedDate === todayString ? todayString : newSelectedDate;

    setSelectedDate(finalSelectedDate);

    const dateObj = new Date(finalSelectedDate);
    const newYear = dateObj.getFullYear();
    const newMonth = dateObj.getMonth() + 1;

    if (newYear !== currentYear || newMonth !== currentMonth) {
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
    }
  }, [currentYear, currentMonth]);

  /**
   * 이벤트 업데이트 핸들러 (중복 처리 제거)
   */
  const handleEventUpdate = useCallback(async (type, action, data) => {
    try {
      if (type === 'schedule') {
        if (action === 'create') {
          console.log('📅 일정 생성 시작:', data);

          // 날짜 필드 정규화 - 선택된 날짜로 고정
          const normalizedData = {
            ...data,
            date: data.date || selectedDate,
            startDate: data.date || selectedDate,
            scheduleDate: data.date || selectedDate,
            endDate: data.date || selectedDate
          };

          console.log('📅 정규화된 일정 데이터:', normalizedData);

          // useSchedule에서 모든 상태 관리를 처리하므로 API 호출만
          await createSchedule(normalizedData);
          console.log('✅ 일정 생성 완료 (useSchedule에서 상태 관리)');

        } else if (action === 'update') {
          const scheduleId = data.id || data.scheduleId || data.schedule_id;
          if (!scheduleId) {
            console.error('일정 ID가 없습니다:', data);
            return;
          }

          console.log('📅 일정 수정 시작:', { scheduleId, data });

          // 날짜 필드 정규화
          const normalizedData = {
            ...data,
            date: data.date || data.startDate || data.scheduleDate,
            startDate: data.date || data.startDate || data.scheduleDate,
            scheduleDate: data.date || data.startDate || data.scheduleDate,
            endDate: data.date || data.startDate || data.scheduleDate
          };

          // useSchedule에서 모든 상태 관리를 처리하므로 API 호출만
          await updateSchedule(scheduleId, normalizedData);
          console.log('✅ 일정 수정 완료 (useSchedule에서 상태 관리)');

        } else if (action === 'delete') {
          const scheduleId = data.id || data.scheduleId || data.schedule_id;
          if (!scheduleId) {
            console.error('일정 ID가 없습니다:', data);
            return;
          }

          console.log('📅 일정 삭제 워크플로우 시작:', { scheduleId, data });

          // 1. API를 통해 서버에서 삭제 (useSchedule은 오직 API 통신만 담당)
          await deleteSchedule(scheduleId);
          console.log('✅ 서버에서 일정 삭제 완료');

          // 2. 삭제 성공 후 서버로부터 최신 데이터 refetch (Single Source of Truth)
          console.log('🔄 서버로부터 최신 데이터 refetch 시작');
          await fetchSchedulesByMonth(currentYear, currentMonth, true); // 강제 새로고침
          console.log('✅ 일정 삭제 워크플로우 완료 - UI 갱신됨');
        }

      } else if (type === 'diary') {
        if (action === 'create') {
          console.log('📔 일기 생성 시작:', data);

          const normalizedData = {
            ...data,
            date: data.date || selectedDate,
            diaryDate: data.date || selectedDate
          };

          console.log('📔 정규화된 일기 데이터:', normalizedData);

          try {
            const result = await createDiary(normalizedData);

            if (result) {
              const newDiary = {
                ...result,
                date: normalizedData.date,
                diaryDate: normalizedData.diaryDate
              };

              setDiaries(prev => {
                const exists = prev.some(d =>
                  (d.id && d.id === result.id) ||
                  (d.diaryId && d.diaryId === result.diaryId) ||
                  (d.diary_id && d.diary_id === result.diary_id)
                );
                if (exists) {
                  return prev.map(d =>
                    (d.id === result.id || d.diaryId === result.diaryId || d.diary_id === result.diary_id)
                      ? newDiary
                      : d
                  );
                }
                return [...prev, newDiary];
              });

              console.log('✅ 일기 생성 완료 및 로컬 상태 업데이트');
            }
          } catch (error) {
            // 409 에러 (중복)인 경우 기존 일기를 수정으로 처리
            if (error.response?.status === 409) {
              console.log('📔 해당 날짜에 일기가 이미 존재함. 수정으로 처리');

              // 기존 일기 찾기
              const existingDiary = diaries.find(diary => {
                const diaryDate = diary.diaryDate || diary.date;
                return diaryDate === (normalizedData.date || normalizedData.diaryDate);
              });

              if (existingDiary) {
                // 수정으로 처리
                const diaryId = existingDiary.id || existingDiary.diaryId || existingDiary.diary_id;
                const updateData = {
                  ...normalizedData,
                  id: diaryId,
                  diaryId: diaryId
                };
                console.log('📔 기존 일기 수정으로 전환:', updateData);
                await handleEventUpdate('diary', 'update', updateData);
                return;
              } else {
                // 기존 일기를 찾을 수 없으면 새로고침
                console.warn('📔 기존 일기를 찾을 수 없어 새로고침');
                await fetchDiariesByMonth(currentYear, currentMonth);
              }
            } else {
              throw error; // 다른 에러는 그대로 throw
            }
          }

        } else if (action === 'update') {
          const diaryId = data.id || data.diaryId || data.diary_id;
          if (!diaryId) {
            console.error('일기 ID가 없습니다:', data);
            return;
          }

          console.log('📔 일기 수정 시작:', { diaryId, data });

          const normalizedData = {
            ...data,
            date: data.date || data.diaryDate,
            diaryDate: data.date || data.diaryDate
          };

          const result = await updateDiary(diaryId, normalizedData);

          if (result) {
            setDiaries(prev => prev.map(d => {
              const isMatch = d.id === diaryId || d.diaryId === diaryId || d.diary_id === diaryId;
              return isMatch ? { ...result, date: normalizedData.date, diaryDate: normalizedData.diaryDate } : d;
            }));

            console.log('✅ 일기 수정 완료 및 로컬 상태 업데이트');
          }

        } else if (action === 'delete') {
          const diaryId = data.id || data.diaryId || data.diary_id;
          if (!diaryId) {
            console.error('일기 ID가 없습니다:', data);
            return;
          }

          setDiaries(prev => prev.filter(d =>
            d.id !== diaryId && d.diaryId !== diaryId && d.diary_id !== diaryId
          ));

          await deleteDiary(diaryId);
          console.log('✅ 일기 삭제 완료');
        }
      }
    } catch (error) {
      console.error(`${type} ${action} 처리 실패:`, error);

      // 에러 발생 시에만 데이터 새로고침 (최후의 수단)
      if (type === 'schedule') {
        console.log('📅 에러 발생으로 인한 강제 새로고침');
        setTimeout(() => {
          fetchSchedulesByMonth(currentYear, currentMonth).catch(console.error);
        }, 1000);
      } else if (type === 'diary') {
        setTimeout(() => {
          fetchDiariesByMonth(currentYear, currentMonth).catch(console.error);
        }, 1000);
      }
    }
  }, [createSchedule, updateSchedule, deleteSchedule, selectedDate, currentYear, currentMonth, setDiaries, fetchSchedulesByMonth, fetchDiariesByMonth, diaries]);

  // 일정 완료 토글 핸들러를 전역으로 노출
  useEffect(() => {
    window.handleScheduleToggle = async (schedule) => {
      const scheduleId = schedule.id || schedule.scheduleId || schedule.schedule_id;
      if (!scheduleId) return;

      try {
        // 즉시 로컬 상태 업데이트 (깜빡임 방지)
        setSchedules(prev => prev.map(s =>
          (s.id === scheduleId || s.scheduleId === scheduleId || s.schedule_id === scheduleId)
            ? { ...s, isCompleted: !s.isCompleted }
            : s
        ));

        // 백그라운드에서 완료 토글 전용 API 호출
        const { scheduleApi } = await import('../../services/scheduleApi');
        await scheduleApi.toggleComplete(scheduleId, !schedule.isCompleted);

        console.log('✅ 일정 완료 상태 토글 성공 (DB 반영됨)');

      } catch (error) {
        console.error('일정 완료 상태 토글 실패:', error);

        // 실패 시 상태 되돌리기
        setSchedules(prev => prev.map(s =>
          (s.id === scheduleId || s.scheduleId === scheduleId || s.schedule_id === scheduleId)
            ? { ...s, isCompleted: schedule.isCompleted }
            : s
        ));
      }
    };

    // 일정 삭제 핸들러 추가 - ScheduleItem에서 사용
    window.handleScheduleDelete = async (schedule) => {
      console.log('🎯 전역 삭제 핸들러 호출됨:', schedule);
      await handleEventUpdate('schedule', 'delete', schedule);
    };

    window.handleDiaryDelete = async (diary) => {
      await handleEventUpdate('diary', 'delete', diary);
    };

    return () => {
      delete window.handleScheduleToggle;
      delete window.handleScheduleDelete;
      delete window.handleDiaryDelete;
    };
  }, [setSchedules, handleEventUpdate]);

  const handleModalClose = useCallback(() => {
    console.log('모달 닫힘');
  }, []);

  const dateClickHandler = createDateClickHandler(handleDateSelect);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchSchedulesByMonth(currentYear, currentMonth);
        await fetchDiariesByMonth(currentYear, currentMonth);
      } catch (error) {
        console.warn('초기 데이터 로딩 실패:', error);
        setTimeout(() => {
          fetchSchedulesByMonth(currentYear, currentMonth).catch(console.error);
          fetchDiariesByMonth(currentYear, currentMonth).catch(console.error);
        }, 3000);
      }
    };

    loadInitialData();
  }, [fetchSchedulesByMonth, fetchDiariesByMonth, currentYear, currentMonth]);

  // schedules 상태 변경 시 강제 리렌더링 트리거
  useEffect(() => {
    console.log('📊 schedules 상태 변경 감지:', schedules?.length || 0);
    setForceUpdate(prev => prev + 1);
  }, [schedules]);

  useEffect(() => {
    const dateObj = new Date(selectedDate);
    const newYear = dateObj.getFullYear();
    const newMonth = dateObj.getMonth() + 1;

    if (newYear !== currentYear || newMonth !== currentMonth) {
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
    }
  }, [selectedDate, currentYear, currentMonth]);

  // 선택된 날짜의 일정들을 시간순으로 정렬하여 가져오기 (리렌더링 문제 해결)
  const selectedDateSchedules = useMemo(() => {
    console.log('🔍 selectedDateSchedules 재계산:', {
      schedulesCount: schedules?.length || 0,
      selectedDate,
      schedules: schedules,
      forceUpdate, // 강제 리렌더링 트리거
      schedulesIds: schedules?.map(s => s.id || s.scheduleId) // ID 목록으로 변경사항 추적
    });

    const filteredSchedules = schedules?.filter(schedule => {
      const scheduleDate = schedule.scheduleDate || schedule.date || schedule.startDate;
      return scheduleDate === selectedDate;
    }) || [];

    console.log('🔍 필터링된 일정들:', filteredSchedules.map(s => ({
      id: s.id || s.scheduleId,
      title: s.title,
      date: s.scheduleDate || s.date
    })));

    // 시간순으로 정렬 (종일 일정은 맨 위, 그 다음은 시작시간 순)
    const sortedSchedules = filteredSchedules.sort((a, b) => {
      // 종일 일정은 맨 위로
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;

      // 둘 다 종일이거나 둘 다 시간 지정인 경우 시작시간으로 정렬
      const aTime = a.startTime || '00:00';
      const bTime = b.startTime || '00:00';
      return aTime.localeCompare(bTime);
    });

    console.log('🔍 정렬된 일정들:', sortedSchedules.map(s => ({
      id: s.id || s.scheduleId,
      title: s.title
    })));
    return sortedSchedules;
  }, [schedules, selectedDate, forceUpdate]); // forceUpdate 의존성 다시 추가

  const selectedDateDiary = useMemo(() => {
    return diaries.find(diary => {
      const diaryDate = diary.diaryDate || diary.date;
      return diaryDate === selectedDate;
    });
  }, [diaries, selectedDate]);

  // 메인카드는 가장 빠른 시간의 일정
  const latestSchedule = selectedDateSchedules.length > 0 ? selectedDateSchedules[0] : null;
  const hasMoreSchedules = selectedDateSchedules.length > 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '600px' }}>
      <div style={{ width: '100%' }}>
        <Calendar onDateClick={dateClickHandler} />
      </div>

      <div style={{
        width: '100%',
        padding: '20px',
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        border: '1px solid #e0e0e0'
      }}>
        {/* 헤더 영역 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '20px',
          borderBottom: '3px solid #ffe4d6',
          background: 'linear-gradient(135deg, #ff6f0f 0%, #ff8f00 100%)',
          padding: '20px 25px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(255, 111, 15, 0.3)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>
              {selectedDate === today ? '오늘의 일정 및 일기' : `${selectedDate.split('-')[1]}월 ${selectedDate.split('-')[2]}일 일정 및 일기`}
            </h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: '0.9' }}>
              {selectedDate === today ? '(Today)' : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{selectedDate}</span>
                  <button
                    onClick={() => setSelectedDate(today)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    오늘로 이동
                  </button>
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                if (window.ModalManager) {
                  window.ModalManager.openScheduleCreate(selectedDate);
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#ff6f0f',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              일정 추가
            </button>

            <button
              onClick={() => {
                if (window.ModalManager) {
                  if (selectedDateDiary) {
                    window.ModalManager.openDiaryEdit(selectedDateDiary);
                  } else {
                    window.ModalManager.openDiaryCreate(selectedDate);
                  }
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#ff8f00',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              {selectedDateDiary ? '일기 수정' : '일기 작성'}
            </button>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 일정 영역 */}
          <div style={{ width: '100%' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: 0, color: '#555', fontSize: '18px', fontWeight: '600' }}>
                일정 {selectedDateSchedules.length > 0 && `(${selectedDateSchedules.length}개)`}
              </h4>
              {hasMoreSchedules && (
                <button
                  onClick={() => setShowAllSchedules(!showAllSchedules)}
                  style={{
                    background: 'linear-gradient(135deg, #ff6f0f, #ff8f00)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(255, 111, 15, 0.3)'
                  }}
                >
                  {showAllSchedules ? '접기' : '더보기'}
                  <span style={{
                    transform: showAllSchedules ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    fontSize: '12px'
                  }}>
                    ▼
                  </span>
                </button>
              )}
            </div>

            {scheduleLoading && (
              <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                일정 로딩 중...
              </div>
            )}

            {scheduleError && (
              <div style={{
                color: '#dc3545',
                fontSize: '14px',
                padding: '20px',
                backgroundColor: '#fff5f5',
                borderRadius: '12px',
                border: '1px solid #ffcccb',
                marginBottom: '20px'
              }}>
                서버 연결 오류: {scheduleError}
              </div>
            )}

            {selectedDateSchedules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* 새로운 ScheduleItem 컴포넌트 사용 */}
                {(showAllSchedules ? selectedDateSchedules : [latestSchedule]).filter(Boolean).map((schedule, index) => (
                  <ScheduleItem
                    key={schedule.scheduleId || schedule.id || index}
                    schedule={schedule}
                    displayMode="standalone"
                    onClick={() => {
                      if (window.ModalManager) {
                        window.ModalManager.openScheduleEdit(schedule);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              !scheduleLoading && (
                <div style={{
                  textAlign: 'center',
                  color: '#8e8e93',
                  padding: '40px 20px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '6px', fontWeight: '500', color: '#1a1a1a' }}>
                    {selectedDate === today ? '오늘은 일정이 없습니다' : '이 날짜에는 일정이 없습니다'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#8e8e93' }}>
                    위의 "일정 추가" 버튼을 눌러 새 일정을 만들어보세요
                  </div>
                </div>
              )
            )}
          </div>

          {/* 일기 영역 */}
          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#555', fontSize: '18px', fontWeight: '600' }}>
              일기
            </h4>

            {diaryLoading && (
              <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                일기 로딩 중...
              </div>
            )}

            {diaryError && (
              <div style={{
                color: '#dc3545',
                fontSize: '14px',
                padding: '20px',
                backgroundColor: '#fff5f5',
                borderRadius: '12px',
                border: '1px solid #ffcccb',
                marginBottom: '20px'
              }}>
                일기 로딩 오류: {diaryError}
              </div>
            )}

            {!diaryLoading && !diaryError && (
              selectedDateDiary ? (
                <DiaryItem
                  diary={selectedDateDiary}
                  displayMode="standalone"
                  onClick={() => {
                    if (window.ModalManager) {
                      window.ModalManager.openDiaryEdit(selectedDateDiary);
                    }
                  }}
                />
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#8e8e93',
                  padding: '40px 20px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '6px', fontWeight: '500', color: '#1a1a1a' }}>
                    {selectedDate === today ? '오늘은 일기가 없습니다' : '이 날짜에는 일기가 없습니다'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#8e8e93' }}>
                    위의 "일기 작성" 버튼을 눌러 새 일기를 만들어보세요
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* 확인 모달 */}
        {confirmModal.isOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                {confirmModal.type === 'schedule-delete' ? '일정 삭제' : '일기 삭제'}
              </div>

              <div style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '24px',
                textAlign: 'center',
                lineHeight: '1.5'
              }}>
                {confirmModal.message}
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setConfirmModal({ isOpen: false, type: '', item: null, message: '' })}
                  style={{
                    backgroundColor: '#f2f2f7',
                    color: '#8e8e93',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  취소
                </button>

                <button
                  onClick={async () => {
                    try {
                      if (confirmModal.type === 'schedule-delete') {
                        await handleEventUpdate('schedule', 'delete', confirmModal.item);
                      } else if (confirmModal.type === 'diary-delete') {
                        await handleEventUpdate('diary', 'delete', confirmModal.item);
                      }
                      setConfirmModal({ isOpen: false, type: '', item: null, message: '' });
                    } catch (error) {
                      console.error('삭제 실패:', error);
                    }
                  }}
                  style={{
                    backgroundColor: '#ff3b30',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        <ModalManager
          selectedDate={selectedDate}
          onModalClose={handleModalClose}
          onEventUpdate={handleEventUpdate}
          // 일정 관리 함수들 전달
          createSchedule={createSchedule}
          updateSchedule={updateSchedule}
          deleteSchedule={deleteSchedule}
          loading={scheduleLoading}
          // 일기 관리 함수들 전달
          createDiary={createDiary}
          updateDiary={updateDiary}
          deleteDiary={deleteDiary}
        />
      </div>
    </div>
  );
};

export default IntegratedCalendar;

