import React, {useEffect, useMemo, useRef, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import {holidayService} from '../../services/holidayService.js';
import styles from "../../styles/components/Calendar.module.scss";

/**
 * 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (UTC 시간대 이슈 방지)
 */
const toLocalISODate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// Backend HolidayResponse → FullCalendar 이벤트 매핑
function mapHoliday(items = []) {
    return items.map((holiday) => ({
        id: `holiday-${holiday.date}`,
        title: holiday.nameKo ?? holiday.name ?? '공휴일',
        start: holiday.date,
        allDay: true,
        display: 'block', // background에서 block으로 변경
        backgroundColor: 'rgba(255, 107, 53, 0.15)',
        borderColor: '#FF6B35',
        textColor: '#FF6B35',
        className: 'holiday-event',
        // 공휴일 스타일 설정
        extendedProps: {
            isHoliday: true
        }
    }));
}

export default function Calendar({onDateClick}) {
    // 테스트용 기본 콜백 (prop으로 전달되지 않은 경우)
    const defaultDateClickHandler = (dateInfo) => {
        console.log(`기본 클릭 핸들러 호출:`, dateInfo);
        alert(`클릭된 날짜: ${dateInfo.iso} (${dateInfo.year}년 ${dateInfo.month}월 ${dateInfo.day}일)`);
    };

    const calRef = useRef(null);
    const cacheRef = useRef(new Map());

    // 간단한 별도 ref 방식
    const yearRef = useRef();
    const monthRef = useRef();

    const today = new Date();

    // 현재 연도 기준 ±5년
    const minYear = today.getFullYear() - 5;
    const maxYear = today.getFullYear() + 5;

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [holidayEvents, setHolidayEvents] = useState([]);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜 추가

    // ref 초기값 설정
    useEffect(() => {
        yearRef.current = selectedYear;
        monthRef.current = selectedMonth;
    }, [selectedYear, selectedMonth]);

    const eventSources = useMemo(() => [
        {id: 'holidays', events: holidayEvents},
    ], [holidayEvents]);

    // 공휴일 로딩
    const loadHolidays = async (y, m) => {
        const key = `${y}-${m}`;
        if (cacheRef.current.has(key)) {
            setHolidayEvents(cacheRef.current.get(key));
            return;
        }
        try {
            const data = await holidayService.getMonthlyHolidays(y, m);
            const mapped = mapHoliday(Array.isArray(data) ? data : []);
            cacheRef.current.set(key, mapped);
            setHolidayEvents(mapped);
        } catch (e) {
            console.warn('공휴일 API 실패:', e);
            cacheRef.current.set(key, []);
            setHolidayEvents([]);
        }
    };

    // 실제 이동 처리 함수
    const doMove = async (y, m) => {
        console.log('이동(실제 적용 값):', y, m);
        const api = calRef.current?.getApi();
        if (!api) return;

        const target = new Date(y, m - 1, 1);
        api.gotoDate(target);
        await loadHolidays(y, m);
    };

    // FullCalendar 뷰가 바뀔 때
    const handleDatesSet = async (arg) => {
        const d = arg.view.currentStart;
        const y = d.getFullYear();
        const m = d.getMonth() + 1;

        setYear(y);
        setMonth(m);

        // ref도 동기화
        yearRef.current = y;
        monthRef.current = m;

        await loadHolidays(y, m);
    };

    // "이동" 버튼 - 한 틱 지연으로 확실한 최신값 읽기
    const handleMove = () => {
        console.log('selectedYear state:', selectedYear);
        console.log('selectedMonth state:', selectedMonth);
        console.log('yearRef.current:', yearRef.current);
        console.log('monthRef.current:', monthRef.current);
        // change 이벤트가 먼저 처리되도록 한 틱 지연
        setTimeout(() => {
            const y = yearRef.current;
            const m = monthRef.current;
            doMove(y, m);
        }, 0);
    };

    // 날짜 클릭/더블클릭 핸들러
    const handleDateClick = (info) => {
        console.log(`날짜 클릭됨:`, info.date);

        const dateInfo = {
            date: info.date,
            iso: toLocalISODate(info.date),
            year: info.date.getFullYear(),
            month: info.date.getMonth() + 1,
            day: info.date.getDate()
        };

        console.log(`처리된 날짜 정보:`, dateInfo);

        // 클릭된 날짜 선택 (테두리 표시용)
        setSelectedDate(dateInfo.iso);

        try {
            // 1. 외부 컴포넌트로 콜백 전달 (팀원이 사용)
            if (onDateClick && typeof onDateClick === 'function') {
                console.log(`onDateClick 콜백 호출`);
                onDateClick(dateInfo);
            } else {
                console.log(`onDateClick 콜백이 없음 - 기본 핸들러 사용`);
                console.log(`선택된 날짜: ${dateInfo.iso} (${dateInfo.year}년 ${dateInfo.month}월 ${dateInfo.day}일)`);
            }

            // 2. CustomEvent 발행 (기존 방식 유지)
            window.dispatchEvent(
                new CustomEvent("calendar:dateClick", {
                    detail: dateInfo
                })
            );
            console.log(`CustomEvent 발행 완료`);
        } catch (e) {
            console.warn("calendar:dateClick 이벤트 처리 실패:", e);
        }
    };

    // 더블클릭 핸들러 - 해당 월로 이동
    const handleDateDoubleClick = (info) => {
        console.log(`날짜 더블클릭됨:`, info.date);

        const clickedYear = info.date.getFullYear();
        const clickedMonth = info.date.getMonth() + 1;

        // 현재 보고 있는 월과 다르면 해당 월로 이동
        if (clickedYear !== year || clickedMonth !== month) {
            setSelectedYear(clickedYear);
            setSelectedMonth(clickedMonth);
            yearRef.current = clickedYear;
            monthRef.current = clickedMonth;

            // 즉시 이동
            doMove(clickedYear, clickedMonth);

            console.log(`${clickedYear}년 ${clickedMonth}월로 이동`);
        } else {
            console.log(`이미 해당 월을 보고 있습니다.`);
        }

        // 더블클릭한 날짜 선택
        const dateInfo = {
            date: info.date,
            iso: toLocalISODate(info.date),
            year: clickedYear,
            month: clickedMonth,
            day: info.date.getDate()
        };
        setSelectedDate(dateInfo.iso);

        // CustomEvent도 발행
        try {
            window.dispatchEvent(
                new CustomEvent("calendar:dateDoubleClick", {
                    detail: dateInfo
                })
            );
        } catch (e) {
            console.warn("calendar:dateDoubleClick 이벤트 처리 실패:", e);
        }
    };

    // 최초 로드
    useEffect(() => {
        loadHolidays(year, month);
    }, []);

    return (
        <div className={styles.calendarArea}>
            <div className={styles.controlBar}>
                <select
                    value={selectedYear}
                    onChange={(e) => {
                        const newYear = Number(e.target.value);
                        console.log('onChange - 선택된 값:', newYear);
                        console.log('onChange - 이전 state:', selectedYear);
                        setSelectedYear(newYear);
                        console.log('onChange - setState 호출 완료');
                        yearRef.current = newYear;
                    }}
                >
                    {Array.from({length: maxYear - minYear + 1}, (_, i) => minYear + i).map((y) => (
                        <option key={y} value={y}>{y}년</option>
                    ))}
                </select>

                <select
                    value={selectedMonth}
                    onChange={(e) => {
                        const newMonth = Number(e.target.value);
                        console.log('월 선택:', newMonth);
                        setSelectedMonth(newMonth);
                        monthRef.current = newMonth; // 간단명확
                    }}
                >
                    {Array.from({length: 12}, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>{m}월</option>
                    ))}
                </select>

                <button className={styles.moveBtn} type="button" onClick={handleMove}>
                    이동
                </button>

                <button
                    className={styles.todayBtn}
                    type="button"
                    onClick={() => calRef.current?.getApi()?.today()}
                >
                    오늘
                </button>

                {/* 범례 */}
                <div className={styles.legend}>
                    <span className={styles.legendItem}>
                        <i className={styles.legendHoliday}></i> 공휴일
                    </span>
                    <span className={styles.legendItem}>
                        <i className={styles.legendSchedule}></i> 일정
                    </span>
                    <span className={styles.legendItem}>
                        <i className={styles.legendDiary}></i> 일기
                    </span>
                </div>
            </div>

            <FullCalendar
                ref={calRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locales={[koLocale]}
                locale="ko"
                headerToolbar={{left: 'prev,next', center: 'title', right: ''}}
                height="auto"
                dayMaxEventRows={3}
                eventSources={eventSources}
                datesSet={handleDatesSet}
                dateClick={handleDateClick} // 클릭 이벤트 추가
                // 더블클릭 처리를 위한 커스텀 핸들러
                eventClassNames={(arg) => {
                    // 이벤트가 아닌 날짜 셀에 더블클릭 이벤트를 추가하기 위해
                    // dayCellDidMount를 사용하여 처리합니다
                    return [];
                }}
                dayCellDidMount={(arg) => {
                    // 더블클릭 이벤트 리스너 추가
                    arg.el.addEventListener('dblclick', () => {
                        handleDateDoubleClick({date: arg.date});
                    });
                }}
                dayCellClassNames={(arg) => {
                    const classes = [];
                    const d = arg.date.getDay();
                    const dateStr = toLocalISODate(arg.date);

                    // 요일별 클래스
                    if (d === 0) classes.push(styles.sundayCell);
                    if (d === 6) classes.push(styles.saturdayCell);

                    // 선택된 날짜 클래스
                    if (selectedDate === dateStr) {
                        classes.push(styles.selectedDateCell);
                    }

                    return classes;
                }}
                eventDidMount={(info) => {
                    // 공휴일 이벤트 스타일 커스터마이징
                    if (info.event.extendedProps?.isHoliday) {
                        info.el.style.fontSize = '11px';
                        info.el.style.fontWeight = '500';
                        info.el.style.padding = '1px 4px';
                        info.el.style.borderRadius = '3px';
                        info.el.style.margin = '1px 0';
                    }
                }}
            />
        </div>
    );
}