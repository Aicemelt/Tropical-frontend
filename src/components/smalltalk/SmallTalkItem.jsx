import React from 'react';
import {desc, smallTalk} from '../../styles/components/SmallTalkItem.module.scss';
import defaultIcon from '../../asset/tropical-bird.png';
import dailyIcon from '../../asset/toss-sun.png';
import creativeIcon from '../../asset/toss-idea.png';
import thoughtIcon from '../../asset/toss-thought.png';
import foodIcon from '../../asset/toss-food.png';

const SmallTalkItem = ({content, question, type}) => {



    const topicStyles = {
        DAILY: { icon: `${dailyIcon}`, color: '#FFF2E1' },
        INTEREST: { icon: `${dailyIcon}`, color: '#E1F5F7' },
        FOOD: { icon: `${foodIcon}`, color: '#FFE8F1' },
        CREATIVE: { icon: `${creativeIcon}`, color: '#F2E8FF' },
        THOUGHT: { icon: `${thoughtIcon}`, color: '#E8F7E1' },
        DEFAULT: { icon:`${defaultIcon}`, color: '#FFF2E1' }
    };

    const currentStyle = topicStyles[type] || topicStyles.DEFAULT;
    const icon = currentStyle.icon;


    return (
        <li style={{ backgroundColor: currentStyle.color }}>
            <i>
                <img src={icon} alt={`${type} icon`} />
            </i>
            <p className={desc}>{content}</p>
            <p className={smallTalk}>{question}</p>
        </li>
    );
};

export default SmallTalkItem;