import React from 'react';
import styles from './Header.module.scss';

const {logo, title, userName, desc} = styles;

const Header = () => {
    return (
        <div>
            <h1 className={logo}></h1>
            <h2 className={title}>안녕하세요, <span className={userName}>트로피칼</span>님</h2>
            <p className={desc}>햄보르기니님의 캘린터, 일기, 버킷리스트, 투두리스트 기반으로 스몰토크 주제를 추천드리겠습니다.</p>
        </div>
    );
};

export default Header;