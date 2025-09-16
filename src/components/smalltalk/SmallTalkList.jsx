import React from 'react';
import SmallTalkItem from "./SmallTalkItem.jsx";
import { container } from "../../styles/components/SmallTalkList.module.scss";

const SmallTalkList = () => {
    return (
        <ul className={container}>
            <li>
                <SmallTalkItem />
            </li>
            <li>
                <SmallTalkItem />
            </li>
            <li>
                <SmallTalkItem />
            </li>
        </ul>
    );
};

export default SmallTalkList;