import React, { useState, useEffect } from 'react';
import styles from '../../styles/components/Header.module.scss';
import { NavLink, useLocation } from "react-router-dom";

const RightHeader = () => {
    const location = useLocation();
    const [isBlock, setIsBlock] = useState(false);

    // 경로에 따른 헤더 이름 매핑
    const pathToHeaderName = {
        '/dashboard': 'Calender',
        '/todo': 'Todo',
        '/bucket': 'Bucket List',
        '/dashboard/calendar': 'Calender'
    };

    // 초기값 설정: 현재 경로를 우선으로 하고, 없으면 localStorage 값 사용
    const [headerName, setHeaderName] = useState(() => {
        const currentPath = location.pathname;
        const headerFromPath = pathToHeaderName[currentPath];
        const savedName = localStorage.getItem('headerName');

        // 현재 경로에 해당하는 헤더 이름이 있으면 그것을 사용
        if (headerFromPath) {
            localStorage.setItem('headerName', headerFromPath); // localStorage 동기화
            return headerFromPath;
        }
        // 없으면 저장된 값이나 기본값 사용
        return savedName || "Calender";
    });

    // headerName이 변경될 때마다 localStorage에 저장
    useEffect(() => {
        localStorage.setItem('headerName', headerName);
    }, [headerName]);

    // 경로가 변경될 때마다 헤더 이름 동기화
    useEffect(() => {
        const headerFromPath = pathToHeaderName[location.pathname];
        if (headerFromPath && headerFromPath !== headerName) {
            setHeaderName(headerFromPath);
        }
    }, [location.pathname]);

    const handleMenu = e => {
        e.preventDefault();
        setIsBlock(!isBlock);
    }

    const handleHeaderChange = (name) => {
        setHeaderName(name);
        setIsBlock(false);
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
                            to={'/dashboard'}
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