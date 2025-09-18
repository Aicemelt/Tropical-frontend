import React, {useState} from 'react';
import  styles from '../../styles/components/Header.module.scss';
import {Link, NavLink} from "react-router-dom";

const RightHeader = () => {

    const[isBlock, setIsBlock] = useState(false);

    const handleMenu = e => {
        e.preventDefault();
        setIsBlock(!isBlock);
    }

    const handleHeaderChange = (name) => {
        setHeaderName(name); // 헤더 이름 상태 업데이트
        setIsBlock(false); // 메뉴 닫기
    }

    const[headerName, setHeaderName] =useState("Calender");

    return (
        <header>
            <h3>
            {/*  헤더 텍스트는 동적으로 변경  */}
                {headerName}
            </h3>
            <button className={`${styles.dropdownBtn}`} type={"button"} onClick={handleMenu}></button>
            <nav style={isBlock ? {display: "block"} : {display: "none"}}>
                <ul>
                    <li>
                        <NavLink to={'/'}
                                 className={({isActive}) => isActive ? `${styles.navLink} ${styles.on}` : styles.navLink}
                                 onClick={() => handleHeaderChange('Calender')}
                        >Calender</NavLink>
                    </li>
                    <li>
                        <NavLink to={'/todo'}
                                 className={({isActive}) => isActive ? `${styles.navLink} ${styles.on}` : styles.navLink}
                                 onClick={() => handleHeaderChange('Todo')}
                        >Todo</NavLink>
                    </li>
                    <li>
                        <NavLink to={'/bucket'}
                                 className={({isActive}) => isActive ? `${styles.navLink} ${styles.on}` : styles.navLink}
                                 onClick={() => handleHeaderChange('Bucket List')}
                        >Bucket List</NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default RightHeader;