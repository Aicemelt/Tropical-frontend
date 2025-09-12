import React, {useState} from 'react';
import {dropdownBtn, on} from '../../styles/components/Header.module.scss';

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
            <button className={dropdownBtn} type={"button"} onClick={handleMenu}></button>
            <nav style={isBlock ? {display: "block"} : {display: "none"}}>
                <ul>
                    <li className={on}>Calender</li>
                    <li>Todo</li>
                    <li>Bucket List</li>
                </ul>
            </nav>
        </header>
    );
};

export default RightHeader;