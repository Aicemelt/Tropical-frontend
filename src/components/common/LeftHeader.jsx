import React from 'react';
import styles from '../../styles/components/Header.module.scss';
import { HiLogout } from "react-icons/hi";
import {FiLogOut} from "react-icons/fi";

const {logo, title, userName, desc, leftHeader} = styles;

const LeftHeader = ({name}) => {
    console.log()
    return (
        <header className={leftHeader}>
            <h1 className={logo}></h1>
            <h2 className={title}>안녕하세요, <span className={userName}>{name}</span>님</h2>
            <p className={desc}>{name}님의 캘린터, 일기, 버킷리스트, 투두리스트 기반으로 스몰토크 주제를 추천드리겠습니다.</p>
            <button><HiLogout /></button>
        </header>
    );
};

export default LeftHeader;