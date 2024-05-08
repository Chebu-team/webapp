import React from "react";

export default function Footbar() {
  return (
    <>
      <div className="relative w-full bottom-0 flex justify-center md:relative md:p-[16px]">
        <img className="md:hidden" src="./assets/Footbar.svg" />
        <div className="absolute flex flex-row w-full h-full max-w-[819px] justify-center items-center md:relative md:flex-col md:gap-[8px]">
          <div className="text-start w-full md:bg-black md:text-center md:bg-opacity-30 md:backdrop-filter-[60px] md:py-[20px] md:rounded-[20px]">
            <p className="text-[24px] text-white select-none">2d:4h:2s</p>
            <p className="text-[13px] text-[#989898] select-none">Live time</p>
          </div>
          <div className="text-center w-full left-right-border md:bg-black md:bg-opacity-30 md:backdrop-filter-[60px] md:py-[20px] md:rounded-[20px]">
            <p className="text-[24px] text-white select-none">7 / 1.000.000</p>
            <p className="text-[13px] text-[#989898] select-none">Level</p>
          </div>
          <div className="text-right w-full md:bg-black md:text-center md:bg-opacity-30 md:backdrop-filter-[60px] md:py-[20px] md:rounded-[20px]">
            <p className="text-[24px] text-white select-none">37</p>
            <p className="text-[13px] text-[#989898] select-none">Max level</p>
          </div>
        </div>
      </div>
    </>
  );
}
