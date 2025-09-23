import React from 'react';
import SmallTalkItem from "./SmallTalkItem.jsx";
import { container } from "../../styles/components/SmallTalkList.module.scss";

const SmallTalkList = ({talks}) => {
    return (
        <ul className={container}>
            {
                talks.map(talk =>
                    <>
                    <SmallTalkItem key={talk.id} type={talk.topicType} content={talk.topicContent} question={talk.exampleQuestion}/>
                    </>
                )
            }
        </ul>
    );
};

export default SmallTalkList;