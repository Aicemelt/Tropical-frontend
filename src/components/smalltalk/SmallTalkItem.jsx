import React from 'react';
import {desc, smallTalk} from '../../styles/components/SmallTalkItem.module.scss';
import defaultIcon from '../../asset/tropical-bird.png';

const SmallTalkItem = () => {
    return (
        <>
            <i>
                <img src={defaultIcon} alt={`트로피칼 새`}/>
            </i>
            <p className={desc}>회의를 위한 주제 추천!</p>
            <p className={smallTalk}>회의전 커피 한 잔 어떠세요?</p>
        </>
    );
};

export default SmallTalkItem;