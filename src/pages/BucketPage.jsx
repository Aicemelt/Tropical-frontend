import React from 'react';

import BucketFilter from "../components/bucket/BucketFilter.jsx";
import BucketList from "../components/bucket/BucketList.jsx";
import BucketInput from "../components/bucket/BucketInput.jsx";

const BucketPage = () => {
    return (
        <>
            <BucketFilter />
            <BucketInput />
            <BucketList />
        </>
    );
};

export default BucketPage;