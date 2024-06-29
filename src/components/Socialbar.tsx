import React from "react";

export default function Socialbar() {
  return (
    <>
      <div className="absolute left-[40px] top-[50%] -translate-y-1/2 flex flex-col gap-6 md:flex-row md:justify-between md:w-full md:top-auto md:transform-none md:bottom-0 md:gap-0 md:static">
        <div className="rounded-full bg-black bg-opacity-20 cursor-pointer hover:bg-opacity-80 transition-opacity duration-300 hover:shadow-lg">
          <img className="w-[40px]" src="./assets/social/Twitter.svg" alt='telegram'/>
        </div>
        <div className="rounded-full bg-black bg-opacity-20 cursor-pointer hover:bg-opacity-80 transition-opacity duration-300 hover:shadow-lg">
          <img className="w-[40px]" src="./assets/social/Telegram.svg" alt='discord'/>
        </div>
        <div className="rounded-full bg-black bg-opacity-20 cursor-pointer hover:bg-opacity-80 transition-opacity duration-300 hover:shadow-lg">
          <img className="w-[40px]" src="./assets/social/Discord.svg" alt='discord'/>
        </div>
        <div className="rounded-full bg-black bg-opacity-20 cursor-pointer hover:bg-opacity-80 transition-opacity duration-300 hover:shadow-lg">
          <img className="w-[40px]" src="./assets/social/Youtube.svg" alt='youtube'/>
        </div>
        <div className="rounded-full bg-black bg-opacity-20 cursor-pointer hover:bg-opacity-80 transition-opacity duration-300 hover:shadow-lg">
          <img className="w-[40px]" src="./assets/social/Tiktok.svg" alt='tiktok'/>
        </div>
      </div>
    </>
  );
}
