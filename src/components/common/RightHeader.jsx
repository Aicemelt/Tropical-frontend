import React, {useState} from 'react';
import  styles from '../../styles/components/Header.module.scss';
import {Link, NavLink} from "react-router-dom";

const RightHeader = () => {

    const[isBlock, setIsBlock] = useState(false);

    const handleMenu = e => {
        e.preventDefault();
        setIsBlock(!isBlock);
    }

    return (
        <header>
            <h3>
            {/*  헤더 텍스트는 동적으로 변경  */}
                Calender
            </h3>
            <button className={`${styles.dropdownBtn}`} type={"button"} onClick={handleMenu}></button>
            <nav style={isBlock ? {display: "block"} : {display: "none"}}>
                <ul>
                    <li>
                        <NavLink to={'/'} className={({isActive}) => isActive ? `${styles.navLink} ${styles.on}` : styles.navLink}>Calender</NavLink>
                    </li>
                    <li>
                        <NavLink to={'/todo'} className={({isActive}) => isActive ? `${styles.navLink} ${styles.on}` : styles.navLink}>Todo</NavLink>
                    </li>
                    <li>
                        <NavLink to={'/bucket'} className={({isActive}) => isActive ? `${styles.navLink} ${styles.on}` : styles.navLink}>Bucket List</NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default RightHeader;