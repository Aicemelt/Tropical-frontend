import React, { useState, useEffect, useMemo } from 'react';
import EmptyState from "../common/EmptyState.jsx";
import styles from '../../styles/components/SecheduleSection.module.scss';
import ScheduleList from "./ScheduleList.jsx";
import { useSchedule } from '../../hooks/schedule/useSchedule.js';

const ScheduleSection = ({ selectedDate }) => {
    const [isOpened, setIsOpened] = useState(false);

    // 일정 데이터를 가져오기 위한 커스텀 훅 사용
    const { schedules, loading, error, getSchedulesByDate } = useSchedule();

    // 선택된 날짜의 일정 필터링
    const todaySchedules = useMemo(() => {
        if (!selectedDate || !schedules.length) return [];

        return schedules.filter(schedule => {
            const scheduleDate = schedule.startDate || schedule.date;
            return scheduleDate === selectedDate;
        });
    }, [schedules, selectedDate]);

    // 일정 개수 계산
    const scheduleCount = todaySchedules.length;

    // 선택된 날짜가 변경될 때마다 해당 날짜의 일정 로드
    useEffect(() => {
        if (selectedDate) {
            getSchedulesByDate(selectedDate);
        }
    }, [selectedDate, getSchedulesByDate]);

    return (
        <div>
            <h4>일정
                {
                    // 등록된 일정이 있으면 실시간 개수 표시
                    scheduleCount > 0 && (
                        <span className={`${styles.badge}`}>{scheduleCount}</span>
                    )
                }
                {
                    // 등록된 일정 개수가 2개 이상일 경우 토글 버튼 노출
                    scheduleCount >= 2 && (
                        <button
                            className={`${styles.toggleBtn} ${isOpened ? styles.open : ''}`}
                            onClick={() => setIsOpened(!isOpened)}
                            aria-label={isOpened ? "일정 목록 접기" : "일정 목록 펼치기"}
                        />
                    )
                }
            </h4>

            {/* 로딩 상태 */}
            {loading && <div className={styles.loading}>일정을 불러오는 중...</div>}

            {/* 에러 상태 */}
            {error && <div className={styles.error}>일정을 불러오는데 실패했습니다.</div>}

            {/* 등록된 내용이 없을 때 보여주는 화면 */}
            {!loading && !error && scheduleCount === 0 && <EmptyState />}

            {/* 일정 목록 */}
            {!loading && !error && scheduleCount > 0 && (
                <ScheduleList
                    schedules={todaySchedules}
                    isExpanded={isOpened}
                    showToggle={scheduleCount >= 2}
                />
            )}
        </div>
    );
};

export default ScheduleSection;