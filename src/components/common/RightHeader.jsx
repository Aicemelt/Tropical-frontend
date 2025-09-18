import React, { useState, useEffect } from 'react';
import styles from '../../styles/components/Header.module.scss';
import { NavLink } from "react-router-dom";

const RightHeader = () => {

    const [isBlock, setIsBlock] = useState(false);

    // 새로고침 시 헤더 이름을 저장하기 위해 localStorage 사용
    // 1. 초기값 설정: localStorage에서 값을 불러오거나, 없으면 기본값 "Calender" 사용
    const [headerName, setHeaderName] = useState(() => {
        const savedName = localStorage.getItem('headerName');
        return savedName ? savedName : "Calender";
    });

    // 2. side effect: headerName이 변경될 때마다 localStorage에 저장
    useEffect(() => {
        localStorage.setItem('headerName', headerName);
    }, [headerName]);

    const handleMenu = e => {
        e.preventDefault();
        setIsBlock(!isBlock);
    }

    const handleHeaderChange = (name) => {
        setHeaderName(name); // 헤더 이름 상태 업데이트
        setIsBlock(false); // 메뉴 닫기
    }

    return (
        <header>
            <h3>
                {headerName}
            </h3>
            <button className={`${styles.dropdownBtn}`} type={"button"} onClick={handleMenu}></button>
            <nav style={isBlock ? {display: "block"} : {display: "none"}}>
                <ul>
                    <li>
                        <NavLink
                            to={'/'}
                            className={({isActive}) => isActive ? `${styles.navLink} ${styles.on}` : styles.navLink}
                            onClick={() => handleHeaderChange('Calender')}
                        >
                            Calender
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={'/todo'}
                            className={({isActive}) => isActive ? `${styles.navLink} ${styles.on}` : styles.navLink}
                            onClick={() => handleHeaderChange('Todo')}
                        >
                            Todo
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={'/bucket'}
                            className={({isActive}) => isActive ? `${styles.navLink} ${styles.on}` : styles.navLink}
                            onClick={() => handleHeaderChange('Bucket List')}
                        >
                            Bucket List
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default RightHeader;