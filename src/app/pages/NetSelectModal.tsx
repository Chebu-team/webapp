"use client";
import React, { useState } from "react";
import NetworkModal from "../utilities/NetworkModal";
import { useData } from "../context/DataContext";
import Link from "next/link";

const NetSelectModal = ({ onCloseClicked }: any) => {
  const context = useData();
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return (
    <div className="relative w-full">
      <div className="absolute top-0 w-full left-0 min-h-[100vh] flex flex-col bg-[#121216] p-[15px]">
        <div className="flex flex-row justify-center items-center relative">
          <img src="./assets/DefaultHero.svg" />
          <div
            className="absolute right-0"
            onClick={() => onCloseClicked(false)}
          >
            <img src="./assets/button/CloseButton.svg" />
          </div>
        </div>
        <Link href="/about">
          <div className="flex justify-center pt-[32px]">
            <div className="rounded-full bg-[#050505] py-[13px] w-[172px] text-center">
              <p className="text-[14px] text-white">How it works</p>
            </div>
          </div>
        </Link>
        <div className="flex flex-col pt-[22px] gap-[14px]">
          <NetworkModal
            chain="ethereum"
            onClick={() => onCloseClicked(false)}
          />
          <NetworkModal chain="solana" onClick={() => onCloseClicked(false)} />
          <NetworkModal chain="binance" onClick={() => onCloseClicked(false)} />
        </div>
      </div>
    </div>
  );
};

export default NetSelectModal;
