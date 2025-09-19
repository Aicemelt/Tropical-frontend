import React, { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import { holidayService } from '../../services/holidayService.js';
import styles from "../../styles/components/Calendar.module.scss";

// Backend HolidayResponse → FullCalendar 이벤트 매핑
function mapHoliday(items = []) {
    return items.map((holiday) => ({
        id: `holiday-${holiday.date}`,
        title: holiday.nameKo ?? holiday.name ?? '공휴일',
        start: holiday.date,
        allDay: true,
        display: 'background',
        backgroundColor: 'rgba(255, 107, 53, 0.12)',
        borderColor: '#FF6B35',
        className: 'tropical-holiday-bg'
    }));
}

export default function Calendar() {
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

    // ref 초기값 설정
    useEffect(() => {
        yearRef.current = selectedYear;
        monthRef.current = selectedMonth;
    }, [selectedYear, selectedMonth]);

    const eventSources = useMemo(() => [
        { id: 'holidays', events: holidayEvents },
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
        //setSelectedYear(y);
        //setSelectedMonth(m);

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
                    {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
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
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
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
            </div>

            <FullCalendar
                ref={calRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locales={[koLocale]}
                locale="ko"
                headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
                height="auto"
                dayMaxEventRows={3}
                eventSources={eventSources}
                datesSet={handleDatesSet}
                dayCellClassNames={(arg) => {
                    const d = arg.date.getDay();
                    if (d === 0) return [styles.sundayCell];
                    if (d === 6) return [styles.saturdayCell];
                    return [];
                }}
            />
        </div>
    );
}