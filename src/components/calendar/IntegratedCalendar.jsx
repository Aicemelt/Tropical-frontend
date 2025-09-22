/**
 * @fileoverview 일정/일기 통합 캘린더 컴포넌트
 * @description 팀원 Calendar.jsx를 그대로 사용하면서 우리 일정/일기 기능 연동
 * @author 신동준
 * @since 2025-09-21
 * @version 1.1.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './Calendar';
import ModalManager from '../common/ModalManager';
import { createDateClickHandler } from '../common/FullCalendarAdapter';
import { useSchedule } from '../../hooks/schedule/useSchedule';
import { getDiariesByMonth, createDiary, updateDiary, deleteDiary } from '../../services/diaryApi';

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
    toggleScheduleComplete
  } = useSchedule();

  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [showAllSchedules, setShowAllSchedules] = useState(false);

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
   * 이벤트 업데이트 핸들러
   */
  const handleEventUpdate = useCallback(async (type, action, data) => {
    try {
      if (type === 'schedule') {
        if (action === 'create') {
          await createSchedule(data);
        } else if (action === 'update') {
          const scheduleId = data.id || data.scheduleId || data.schedule_id;
          if (!scheduleId) {
            console.error('일정 ID가 없습니다:', data);
            return;
          }
          await updateSchedule(scheduleId, data);
        } else if (action === 'delete') {
          const scheduleId = data.id || data.scheduleId || data.schedule_id;
          if (!scheduleId) {
            console.error('일정 ID가 없습니다:', data);
            return;
          }
          await deleteSchedule(scheduleId);
        }

        if (action === 'update' || action === 'delete') {
          setTimeout(() => {
            fetchSchedulesByMonth(currentYear, currentMonth).catch(console.error);
          }, 300);
        }

      } else if (type === 'diary') {
        if (action === 'create') {
          const result = await createDiary(data);
          const newDiary = {
            ...result,
            date: data.date || selectedDate,
            diaryDate: data.date || selectedDate
          };
          setDiaries(prev => [...prev, newDiary]);

        } else if (action === 'update') {
          const diaryId = data.id || data.diaryId || data.diary_id;
          if (!diaryId) {
            console.error('일기 ID가 없습니다:', data);
            return;
          }

          const result = await updateDiary(diaryId, data);
          setDiaries(prev => prev.map(d =>
            (d.id === diaryId || d.diaryId === diaryId || d.diary_id === diaryId)
              ? { ...result, date: data.date || selectedDate }
              : d
          ));

        } else if (action === 'delete') {
          await deleteDiary(data.id || data.diaryId);
          setDiaries(prev => prev.filter(d =>
            d.id !== data.id && d.diaryId !== data.diaryId
          ));
        }
      }
    } catch (error) {
      console.error('이벤트 처리 실패:', error);
    }
  }, [createSchedule, updateSchedule, deleteSchedule, fetchSchedulesByMonth, currentYear, currentMonth, selectedDate]);

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

  useEffect(() => {
    const dateObj = new Date(selectedDate);
    const newYear = dateObj.getFullYear();
    const newMonth = dateObj.getMonth() + 1;

    if (newYear !== currentYear || newMonth !== currentMonth) {
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
    }
  }, [selectedDate, currentYear, currentMonth]);

  const selectedDateSchedules = schedules?.filter(schedule => {
    const scheduleDate = schedule.scheduleDate || schedule.date || schedule.startDate;
    return scheduleDate === selectedDate;
  }) || [];

  const selectedDateDiary = diaries.find(diary => {
    const diaryDate = diary.diaryDate || diary.date;
    return diaryDate === selectedDate;
  });

  const latestSchedule = selectedDateSchedules.length > 0 ? selectedDateSchedules[0] : null;
  const hasMoreSchedules = selectedDateSchedules.length > 1;

  // 날짜 포맷 함수
  const formatDateRange = (schedule) => {
    const startDate = schedule.startDate?.split('T')[0] || schedule.scheduleDate || schedule.date;
    const endDate = schedule.endDate?.split('T')[0];

    if (!schedule.isAllDay && endDate && startDate !== endDate) {
      return `${startDate}~${endDate}`;
    }

    return `${startDate}`;
  };

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 최신 일정 카드 */}
                {latestSchedule && (
                  <div
                    onClick={() => {
                      if (window.ModalManager) {
                        window.ModalManager.openScheduleEdit(latestSchedule);
                      }
                    }}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e8e8e8',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '12px',
                          color: '#8e8e93',
                          fontWeight: '500',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}>
                          제목
                        </div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1a1a1a',
                          lineHeight: '1.3'
                        }}>
                          {latestSchedule.title}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.ModalManager) {
                              window.ModalManager.openScheduleEdit(latestSchedule);
                            }
                          }}
                          style={{
                            backgroundColor: '#ff8f00',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({
                              isOpen: true,
                              type: 'schedule-delete',
                              item: latestSchedule,
                              message: `"${latestSchedule.title}" 일정을 삭제하시겠습니까?`
                            });
                          }}
                          style={{
                            backgroundColor: '#ff3b30',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    {/* 날짜 정보 */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#8e8e93',
                        fontWeight: '500',
                        marginBottom: '4px',
                        textTransform: 'uppercase'
                      }}>
                        날짜
                      </div>
                      <div style={{
                        fontSize: '16px',
                        color: '#1a1a1a',
                        fontWeight: '500'
                      }}>
                        {formatDateRange(latestSchedule)}
                      </div>
                    </div>

                    {/* 시간 정보 */}
                    {(latestSchedule.startTime || latestSchedule.endTime) && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{
                          fontSize: '12px',
                          color: '#8e8e93',
                          fontWeight: '500',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}>
                          시간
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#1a1a1a',
                          fontWeight: '500'
                        }}>
                          {latestSchedule.startTime || '--:--'} ~ {latestSchedule.endTime || '--:--'}
                        </div>
                      </div>
                    )}

                    {/* 장소 정보 */}
                    {latestSchedule.location && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{
                          fontSize: '12px',
                          color: '#8e8e93',
                          fontWeight: '500',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}>
                          장소
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#1a1a1a',
                          fontWeight: '500'
                        }}>
                          {latestSchedule.location}
                        </div>
                      </div>
                    )}

                    {/* 메모 정보 */}
                    {(latestSchedule.description || latestSchedule.memo) && (
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#8e8e93',
                          fontWeight: '500',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}>
                          메모
                        </div>
                        <div style={{
                          fontSize: '15px',
                          color: '#1a1a1a',
                          lineHeight: '1.5'
                        }}>
                          {(latestSchedule.description || latestSchedule.memo).length > 100
                            ? (latestSchedule.description || latestSchedule.memo).substring(0, 100) + '...'
                            : (latestSchedule.description || latestSchedule.memo)
                          }
                        </div>
                      </div>
                    )}

                    {/* 참여자 정보 */}
                    {(latestSchedule.attendees || latestSchedule.participants) && (
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#8e8e93',
                          fontWeight: '500',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}>
                          참여자
                        </div>
                        <div style={{
                          fontSize: '15px',
                          color: '#1a1a1a',
                          lineHeight: '1.5'
                        }}>
                          {latestSchedule.attendees || latestSchedule.participants}
                        </div>
                      </div>
                    )}

                    {/* 완료 토글 - 오른쪽 아래에 명확하게 배치 */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: latestSchedule.isCompleted ? '#e8f5e8' : '#f8f9fa',
                        borderRadius: '25px',
                        border: '1px solid',
                        borderColor: latestSchedule.isCompleted ? '#4caf50' : '#e0e0e0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleScheduleComplete(
                          latestSchedule.scheduleId || latestSchedule.id,
                          !latestSchedule.isCompleted
                        ).catch(error => {
                          console.error('완료 상태 변경 실패:', error);
                        });
                      }}
                      >
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: latestSchedule.isCompleted ? '#4caf50' : '#666'
                        }}>
                          {latestSchedule.isCompleted ? '완료됨' : '미완료'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 추가 일정 목록 - 메인 카드와 통일성 있게 세련되게 개선 */}
                {showAllSchedules && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingTop: '8px'
                  }}>
                    {selectedDateSchedules.slice(1).map((schedule, index) => (
                      <div
                        key={schedule.scheduleId || schedule.id || index}
                        onClick={() => {
                          if (window.ModalManager) {
                            window.ModalManager.openScheduleEdit(schedule);
                          }
                        }}
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid #e8e8e8',
                          borderRadius: '16px',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        {/* 상단 제목 및 버튼 영역 */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '16px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '12px',
                              color: '#8e8e93',
                              fontWeight: '500',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}>
                              제목
                            </div>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#1a1a1a',
                              lineHeight: '1.3'
                            }}>
                              {schedule.title}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.ModalManager) {
                                  window.ModalManager.openScheduleEdit(schedule);
                                }
                              }}
                              style={{
                                backgroundColor: '#ff8f00',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              수정
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'schedule-delete',
                                  item: schedule,
                                  message: `"${schedule.title}" 일정을 삭제하시겠습니까?`
                                });
                              }}
                              style={{
                                backgroundColor: '#ff3b30',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        </div>

                        {/* 날짜 정보 */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#8e8e93',
                            fontWeight: '500',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}>
                            날짜
                          </div>
                          <div style={{
                            fontSize: '16px',
                            color: '#1a1a1a',
                            fontWeight: '500'
                          }}>
                            {formatDateRange(schedule)}
                          </div>
                        </div>

                        {/* 시간 정보 */}
                        {(schedule.startTime || schedule.endTime) && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{
                              fontSize: '12px',
                              color: '#8e8e93',
                              fontWeight: '500',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}>
                              시간
                            </div>
                            <div style={{
                              fontSize: '16px',
                              color: '#1a1a1a',
                              fontWeight: '500'
                            }}>
                              {schedule.startTime || '--:--'} ~ {schedule.endTime || '--:--'}
                            </div>
                          </div>
                        )}

                        {/* 장소 정보 */}
                        {schedule.location && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{
                              fontSize: '12px',
                              color: '#8e8e93',
                              fontWeight: '500',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}>
                              장소
                            </div>
                            <div style={{
                              fontSize: '16px',
                              color: '#1a1a1a',
                              fontWeight: '500'
                            }}>
                              {schedule.location}
                            </div>
                          </div>
                        )}

                        {/* 메모 정보 */}
                        {(schedule.description || schedule.memo) && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{
                              fontSize: '12px',
                              color: '#8e8e93',
                              fontWeight: '500',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}>
                              메모
                            </div>
                            <div style={{
                              fontSize: '15px',
                              color: '#1a1a1a',
                              lineHeight: '1.5'
                            }}>
                              {(schedule.description || schedule.memo).length > 100
                                ? (schedule.description || schedule.memo).substring(0, 100) + '...'
                                : (schedule.description || schedule.memo)
                              }
                            </div>
                          </div>
                        )}

                        {/* 참여자 정보 추가 */}
                        {(schedule.attendees || schedule.participants) && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{
                              fontSize: '12px',
                              color: '#8e8e93',
                              fontWeight: '500',
                              marginBottom: '4px',
                              textTransform: 'uppercase'
                            }}>
                              참여자
                            </div>
                            <div style={{
                              fontSize: '15px',
                              color: '#1a1a1a',
                              lineHeight: '1.5'
                            }}>
                              {schedule.attendees || schedule.participants}
                            </div>
                          </div>
                        )}

                        {/* 완료 토글 - 오른쪽 아래에 명확하게 배치 */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          paddingTop: '12px',
                          borderTop: '1px solid #f0f0f0'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: schedule.isCompleted ? '#e8f5e8' : '#f8f9fa',
                            borderRadius: '25px',
                            border: '1px solid',
                            borderColor: schedule.isCompleted ? '#4caf50' : '#e0e0e0',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleScheduleComplete(
                              schedule.scheduleId || schedule.id,
                              !schedule.isCompleted
                            ).catch(error => {
                              console.error('완료 상태 변경 실패:', error);
                            });
                          }}
                          >
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: schedule.isCompleted ? '#4caf50' : '#666'
                            }}>
                              {schedule.isCompleted ? '완료됨' : '미완료'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <div
                  onClick={() => {
                    if (window.ModalManager) {
                      window.ModalManager.openDiaryEdit(selectedDateDiary);
                    }
                  }}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e8e8e8',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#8e8e93',
                        fontWeight: '500',
                        marginBottom: '4px',
                        textTransform: 'uppercase'
                      }}>
                        제목
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1a1a1a',
                        lineHeight: '1.3'
                      }}>
                        {selectedDateDiary.title}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.ModalManager) {
                            window.ModalManager.openDiaryEdit(selectedDateDiary);
                          }
                        }}
                        style={{
                          backgroundColor: '#ff8f00',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({
                            isOpen: true,
                            type: 'diary-delete',
                            item: selectedDateDiary,
                            message: `"${selectedDateDiary.title}" 일기를 삭제하시겠습니까?`
                          });
                        }}
                        style={{
                          backgroundColor: '#ff3b30',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#8e8e93',
                      fontWeight: '500',
                      marginBottom: '4px',
                      textTransform: 'uppercase'
                    }}>
                      기분
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#1a1a1a',
                      fontWeight: '500'
                    }}>
                      {(() => {
                        const emotion = selectedDateDiary.emotion;
                        const emotionData = {
                          JOY: { label: '기쁨', emoji: '😊' },
                          SADNESS: { label: '슬픔', emoji: '😢' },
                          ANGER: { label: '분노', emoji: '😠' },
                          ANXIETY: { label: '불안', emoji: '😰' },
                          CALM: { label: '평온', emoji: '😌' }
                        };
                        const data = emotionData[emotion];
                        return data ? `${data.emoji} ${data.label}` : `😌 ${emotion || '평온'}`;
                      })()}
                    </div>
                  </div>

                  {selectedDateDiary.weather && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#8e8e93',
                        fontWeight: '500',
                        marginBottom: '4px',
                        textTransform: 'uppercase'
                      }}>
                        날씨
                      </div>
                      <div style={{
                        fontSize: '16px',
                        color: '#1a1a1a',
                        fontWeight: '500'
                      }}>
                        {(() => {
                          const weather = selectedDateDiary.weather;
                          const weatherData = {
                            SUNNY: { label: '맑음', emoji: '☀️' },
                            CLOUDY: { label: '흐림', emoji: '☁️' },
                            RAINY: { label: '비', emoji: '🌧️' },
                            SNOWY: { label: '눈', emoji: '❄️' },
                            WINDY: { label: '바람', emoji: '💨' }
                          };
                          const data = weatherData[weather];
                          return data ? `${data.emoji} ${data.label}` : `☀️ ${weather || '맑음'}`;
                        })()}
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#8e8e93',
                      fontWeight: '500',
                      marginBottom: '4px',
                      textTransform: 'uppercase'
                    }}>
                      내용
                    </div>
                    <div style={{
                      fontSize: '15px',
                      color: '#1a1a1a',
                      lineHeight: '1.5'
                    }}>
                      {selectedDateDiary.content && selectedDateDiary.content.length > 150
                        ? selectedDateDiary.content.substring(0, 150) + '...'
                        : selectedDateDiary.content || '내용 없음'
                      }
                    </div>
                  </div>
                </div>
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
        />
      </div>
    </div>
  );
};

export default IntegratedCalendar;

