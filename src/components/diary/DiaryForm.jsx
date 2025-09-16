import React, {useRef, useState} from 'react';
import styles from '../../styles/components/Form.module.scss';
import {Form} from "react-router-dom";

const DiaryForm = ({onClose}) => {
    const emotions = [
        { value: "JOY", label: "기쁨" },
        { value: "SADNESS", label: "슬픔" },
        { value: "ANGER", label: "분노" },
        { value: "CALM", label: "평온" },
        { value: "ANXIETY", label: "불안" },
    ];

    const weathers = [
        { value: "SUNNY", label: "맑음" },
        { value: "CLOUDY", label: "흐림" },
        { value: "RAINY", label: "비" },
        { value: "SNOWY", label: "눈" },
        { value: "WINDY", label: "바람" },
    ];

    const [selectedEmotion, setSelectedEmotion] = useState("");
    const [selectedWeather, setSelectedWeather] = useState("");

    const handleWeather = e => {
        setSelectedWeather(e.target.value);
    }
    const handleEmotion = e => {
        setSelectedEmotion(e.target.value);
    }

    const scrollHeightRef = useRef();
    const handleTextarea = () => {
        if(scrollHeightRef.current) {
            scrollHeightRef.current.style.maxHeight = '480px';
            scrollHeightRef.current.style.height = scrollHeightRef.current.scrollHeight + 'px';
        }
    }

    return (
        <Form>
            <div className={styles.titleArea}>
                <input type={"text"} className={styles.title} placeholder={'일기 제목을 입력하세요...'}/>
                <button className={styles.closeBtn} onClick={onClose}></button>
            </div>
            <div className={`${styles.inputArea}`}>
                <div>
                    <span className={styles.label}>일기 내용</span>
                    <textarea placeholder={'오늘의 일기를 작성해보세요'} ref={scrollHeightRef} onInput={handleTextarea}></textarea>
                </div>
                <div className={`${styles.grid2}`}>
                    <div>
                        <span className={styles.label}>감정</span>
                        <select value={selectedEmotion} onChange={handleEmotion} className={selectedEmotion ? styles.selected : ''}>
                            <option value={""}>감정 선택</option>
                            {
                                emotions.map((e) =>
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                )
                            }
                        </select>
                    </div>
                    <div>
                        <span className={styles.label}>날씨</span>
                        <select value={selectedWeather} onChange={handleWeather}  className={selectedWeather ? styles.selected : ''}>
                            <option value={""}>날씨 선택</option>
                            {
                                weathers.map((e) =>
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                )
                            }
                        </select>
                    </div>
                </div>
            </div>
            <div className={`${styles.btnArea}`}>
                <button className={styles.editBtn}>수정하기</button>
                <button className={styles.actionBtn}>작성하기</button>
            </div>
        </Form>
    );
};

export default DiaryForm;