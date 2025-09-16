import React, {useState} from 'react';
import  styles from '../../styles/components/Header.module.scss';
import {Link} from "react-router-dom";

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
                    <li className={`${styles.on}`}>
                        <Link to={''} className={`${styles.navLink}`}>Calender</Link>
                    </li>
                    <li>
                        <Link to={''} className={`${styles.navLink}`}>Todo</Link>
                    </li>
                    <li>
                        <Link to={''} className={`${styles.navLink}`}>Bucket List</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default RightHeader;