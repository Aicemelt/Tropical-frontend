/**
 * @fileoverview 모든 일정/일기 모달을 통합 관리하는 매니저 컴포넌트
 * @description 기존 ScheduleForm, DiaryForm과 호환되며 상태 기반 자동 렌더링 제공
 * @author 신동준
 * @since 2025-09-21
 * @version 1.0.0
 *
 * 주요 기능:
 * - 일정/일기 모든 모달 통합 관리
 * - 키보드 이벤트 (ESC) 처리
 * - 상태 기반 자동 렌더링
 * - FullCalendar 이벤트와 완벽 연동
 * - 기존 ScheduleForm/DiaryForm 컴포넌트 호환
 */

import React, { useState, useEffect } from 'react';
import ScheduleForm from '../schedule/ScheduleForm';
import DiaryForm from '../diary/DiaryForm';

/**
 * 모든 일정/일기 모달을 통합 관리하는 매니저 컴포넌트
 *
 * @component
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.selectedDate - 선택된 날짜 (YYYY-MM-DD 형식)
 * @param {Function} props.onModalClose - 모달 닫힘 콜백
 * @param {Function} props.onEventUpdate - 이벤트 업데이트 콜백 (FullCalendar 리렌더링용)
 * @param {Function} props.createSchedule - 일정 생성 함수
 * @param {Function} props.updateSchedule - 일정 수정 함수
 * @param {Function} props.deleteSchedule - 일정 삭제 함수
 * @param {boolean} props.loading - 로딩 상태
 * @param {Function} props.createDiary - 일기 생성 함수
 * @param {Function} props.updateDiary - 일기 수정 함수
 * @param {Function} props.deleteDiary - 일기 삭제 함수
 * @returns {JSX.Element} 통합 모달 매니저
 *
 * @example
 * ```jsx
 * <ModalManager
 *   selectedDate="2025-09-21"
 *   onModalClose={handleModalClose}
 *   onEventUpdate={handleEventUpdate}
 *   createSchedule={createSchedule}
 *   updateSchedule={updateSchedule}
 *   deleteSchedule={deleteSchedule}
 *   loading={loading}
 * />
 * ```
 */
const ModalManager = ({
  selectedDate,
  onModalClose,
  onEventUpdate,
  // 일정 관리 함수들
  createSchedule,
  updateSchedule,
  deleteSchedule,
  loading,
  // 일기 관리 함수들
  createDiary,
  updateDiary,
  deleteDiary
}) => {
  // 모달 상태 관리
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  /**
   * 일정 생성 모달 열기
   *
   * @param {string} date - 선택된 날짜 (YYYY-MM-DD)
   */
  const openScheduleCreate = (date) => {
    setActiveModal('scheduleCreate');
    setModalData({ selectedDate: date });
  };

  /**
   * 일정 수정 모달 열기
   *
   * @param {Object} schedule - 수정할 일정 데이터
   */
  const openScheduleEdit = (schedule) => {
    console.log('일정 수정 모달 열기:', schedule);
    setActiveModal('scheduleEdit');
    setModalData({ schedule });
  };

  /**
   * 일정 상세보기 모달 열기
   *
   * @param {Object} schedule - 상세보기할 일정 데이터
   */
  const openScheduleDetail = (schedule) => {
    console.log('일정 상세보기 모달 열기:', schedule);
    setActiveModal('scheduleDetail');
    setModalData({ schedule });
  };

  /**
   * 일기 생성 모달 열기
   *
   * @param {string} date - 선택된 날짜 (YYYY-MM-DD)
   */
  const openDiaryCreate = (date) => {
    setActiveModal('diaryCreate');
    setModalData({ selectedDate: date });
  };

  /**
   * 일기 수정 모달 열기
   *
   * @param {Object} diary - 수정할 일기 데이터
   */
  const openDiaryEdit = (diary) => {
    console.log('일기 수정 모달 열기:', diary);
    setActiveModal('diaryEdit');
    setModalData({ diary });
  };

  /**
   * 일기 상세보기 모달 열기
   *
   * @param {Object} diary - 상세보기할 일기 데이터
   */
  const openDiaryDetail = (diary) => {
    console.log('일기 상세보기 모달 열기:', diary);
    setActiveModal('diaryDetail');
    setModalData({ diary });
  };

  /**
   * ESC 키 처리 이벤트 핸들러
   * 모든 열린 모달을 닫습니다.
   *
   * @param {KeyboardEvent} event - 키보드 이벤트
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  };

  /**
   * 모든 모달을 닫는 함수
   * 각 모달의 close 함수를 호출하고 상위 컴포넌트에 알립니다.
   */
  const closeAllModals = () => {
    setActiveModal(null);
    setModalData(null);
    if (onModalClose) {
      onModalClose();
    }
  };

  /**
   * 일정 생성/수정 성공 핸들러 (중복 처리 제거)
   *
   * @param {Object} scheduleData - 일정 데이터
   */
  const handleScheduleSuccess = (scheduleData) => {
    // useSchedule에서 이미 모든 상태 관리를 완료했으므로
    // 추가적인 onEventUpdate 호출하지 않음 (중복 방지)
    console.log('📅 ModalManager: 일정 처리 완료, 모달 닫기만 수행');

    closeAllModals();
  };

  /**
   * 일정 삭제 성공 핸들러 (중복 처리 제거)
   *
   * @param {Object} scheduleData - 삭제된 일정 데이터
   */
  const handleScheduleDelete = (scheduleData) => {
    // useSchedule에서 이미 모든 상태 관리를 완료했으므로
    // 추가적인 onEventUpdate 호출하지 않음 (중복 방지)
    console.log('📅 ModalManager: 일정 삭제 완료, 모달 닫기만 수행');

    closeAllModals();
  };

  /**
   * 일기 생성/수정 성공 핸들러
   *
   * @param {Object} diaryData - 일기 데이터
   */
  const handleDiarySuccess = (diaryData) => {
    const action = activeModal === 'diaryCreate' ? 'create' : 'update';

    if (onEventUpdate) {
      onEventUpdate('diary', action, diaryData);
    }

    closeAllModals();
  };

  /**
   * 일기 삭제 성공 핸들러
   *
   * @param {Object} diaryData - 삭제된 일기 데이터
   */
  const handleDiaryDelete = (diaryData) => {
    if (onEventUpdate) {
      onEventUpdate('diary', 'delete', diaryData);
    }

    closeAllModals();
  };

  /**
   * selectedDate가 변경될 때 자동으로 일정 생성 모달 열기
   */
  useEffect(() => {
    if (selectedDate && !activeModal) {
      // 자동 모달 오픈 제거 - 버튼 클릭 시에만 열리도록 변경
      console.log(`📅 날짜 선택됨: ${selectedDate} (자동 모달 오픈 안함)`);
    }
  }, [selectedDate]);

  // ESC 키 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 외부에서 모달을 제어할 수 있도록 전역 객체에 등록
  useEffect(() => {
    window.ModalManager = {
      openScheduleCreate,
      openScheduleEdit,
      openScheduleDetail,
      openDiaryCreate,
      openDiaryEdit,
      openDiaryDetail,
      closeAllModals
    };

    return () => {
      delete window.ModalManager;
    };
  }, []);

  return (
    <>
      {/* 일정 생성 모달 */}
      {activeModal === 'scheduleCreate' && modalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAllModals();
            }
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '700px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <ScheduleForm
              mode="create"
              selectedDate={modalData.selectedDate}
              onClose={closeAllModals}
              onSuccess={handleScheduleSuccess}
              // 일정 관리 함수들
              createSchedule={createSchedule}
              updateSchedule={updateSchedule}
              deleteSchedule={deleteSchedule}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* 일정 수정 모달 */}
      {activeModal === 'scheduleEdit' && modalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAllModals();
            }
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '700px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <ScheduleForm
              mode="edit"
              initialData={modalData.schedule}
              onClose={closeAllModals}
              onSuccess={handleScheduleSuccess}
              onDelete={handleScheduleDelete}
              // 일정 관리 함수들
              createSchedule={createSchedule}
              updateSchedule={updateSchedule}
              deleteSchedule={deleteSchedule}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* 일정 상세보기 모달 */}
      {activeModal === 'scheduleDetail' && modalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAllModals();
            }
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '700px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <ScheduleForm
              mode="detail"
              initialData={modalData.schedule}
              onClose={closeAllModals}
            />
          </div>
        </div>
      )}

      {/* 일기 생성 모달 */}
      {activeModal === 'diaryCreate' && modalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAllModals();
            }
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '700px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <DiaryForm
              mode="create"
              selectedDate={modalData.selectedDate}
              onClose={closeAllModals}
              onSuccess={handleDiarySuccess}
            />
          </div>
        </div>
      )}

      {/* 일기 수정 모달 */}
      {activeModal === 'diaryEdit' && modalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAllModals();
            }
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '700px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <DiaryForm
              mode="edit"
              initialData={modalData.diary}
              onClose={closeAllModals}
              onSuccess={handleDiarySuccess}
            />
          </div>
        </div>
      )}

      {/* 일기 상세보기 모달 */}
      {activeModal === 'diaryDetail' && modalData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAllModals();
            }
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '700px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <DiaryForm
              mode="detail"
              initialData={modalData.diary}
              onClose={closeAllModals}
            />
          </div>
        </div>
      )}

      {/* 모달 애니메이션 스타일 */}
      <style>
        {`
          @keyframes modalSlideIn {
            0% {
              opacity: 0;
              transform: translateY(-50px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </>
  );
};

export default ModalManager;
