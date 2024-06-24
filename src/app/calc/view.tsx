'use client'
import React, {useEffect} from 'react';
import {useReadContract} from "wagmi";
import config from "@/config/general";

const View = () => {

    const res = useReadContract({
        abi: config.chebuAbi,
        address: config.chebuAddress,
        functionName: 'calcMintTokensForExactStable',
        args:[100000000],
    })
    useEffect(() => {
        if(!res.data) return
        // @ts-ignore
    }, [res.status])
    return (
        <div>
            <button onClick={() => {res.refetch()}}>refetch</button>
        </div>
    );
};

export default View;