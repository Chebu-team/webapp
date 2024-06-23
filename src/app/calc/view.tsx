'use client'
import React, {useEffect} from 'react';
import {useReadContract} from "wagmi";
import config from "@/config/general";

const View = () => {

    const res = useReadContract({
        abi: config.chebuAbi,
        address: '0xf35b8249Ef91317f06E67c887B38483089c18724',
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