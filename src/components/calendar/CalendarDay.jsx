import styles from '../../styles/components/CalendarDay.module.scss'

const CalendarDay = ({key, day, date, hasSchedule, hasDiary}) => {

    const today = date.getDate();

    return (
        <button key={key} className={`${styles.day} ${ day === today ? styles.today : ''}`}>
            {day}
            <span className={`${styles.dataArea}`}>
            { hasSchedule && <span className={`${styles.data} ${styles.schedule}`}></span>  }
            { hasDiary && <span className={`${styles.data} ${styles.diary}`}></span> }
            </span>
        </button>
    );
};

export default CalendarDay;