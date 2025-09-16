import React from 'react';
import ScheduleItem from "./ScheduleItem.jsx";
import styles from '../../styles/components/ScheduleList.module.scss';

const ScheduleList = () => {
    return (
        <ul>
           <li>
               <ScheduleItem />
           </li>
            <li>
                <ScheduleItem />
            </li>
        </ul>
    );
};

export default ScheduleList;