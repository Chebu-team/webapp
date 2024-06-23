'use client'
import React, {useEffect, useState} from "react";
import {useReadContract} from "wagmi";
import config from "@/config/general";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'

const targetTimestamp = '2024-06-22T16:00:00.000Z'

export default function Footbar() {
  const {data:round} = useReadContract({
    abi: config.chebuAbi,
    address: config.chebuAddress,
    functionName: 'getCurrentRound',
  })
  const {data:level = []}  = useReadContract({
    abi: config.chebuAbi,
    address: config.chebuAddress,
    functionName: 'priceAndMintedInRound',
    args: [round]
  })
  const [timeDiff, setTimeDiff] = useState('');

  useEffect(() => {
    const targetTime = dayjs(targetTimestamp, 'DD/MM/YYYY:HH.mm');

    const updateTimer = () => {
      const now = dayjs();
      const diffInSeconds = now.diff(targetTime, 'second');

      const days = Math.floor(diffInSeconds / (24 * 60 * 60));
      const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
      const seconds = diffInSeconds % 60;

      setTimeDiff(`${days}d:${hours}h:${seconds}s`);
    };

    updateTimer(); // Initial call to set the time difference immediately
    const timerInterval = setInterval(updateTimer, 15*1000);

    return () => clearInterval(timerInterval);
  }, [targetTimestamp]);

  return (
    <>
      <div className="relative w-full bottom-0 flex justify-center md:relative md:p-[16px]">
        <img className="md:hidden" src="./assets/Footbar.svg" />
        <div className="absolute flex flex-row w-full h-full max-w-[1160px] justify-center items-center md:relative md:flex-col md:gap-[8px]">
          <div className="text-center w-full md:bg-black md:text-center md:bg-opacity-30 md:backdrop-filter-[60px] md:py-[20px] md:rounded-[20px]">
            <p className="text-[24px] text-white select-none">{timeDiff}</p>
            <p className="text-[13px] text-[#989898] select-none">Live time</p>
          </div>
          <div className="text-center w-full left-right-border md:bg-black md:bg-opacity-30 md:backdrop-filter-[60px] md:py-[20px] md:rounded-[20px]">
            {/*@ts-ignore*/}
            <p className="text-[24px] text-white select-none">{level[0] ? level[0].toString() : 0} / {level[1] ? BigNumber(level[1]).div(BigNumber(config.decimalChebu)).toFormat(0) : 0}</p>
            <p className="text-[13px] text-[#989898] select-none">Level</p>
          </div>
          <div className="text-center w-full md:bg-black md:text-center md:bg-opacity-30 md:backdrop-filter-[60px] md:py-[20px] md:rounded-[20px]">
            <p className="text-[24px] text-white select-none">37</p>
            <p className="text-[13px] text-[#989898] select-none">Max level</p>
          </div>
        </div>
      </div>
    </>
  );
}
