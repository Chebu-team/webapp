"use client";
import React, { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import NetworkModal from "@/components/NetworkModal";
import Footbar from "@/components/Footbar";
import Socialbar from "@/components/Socialbar";
import { DataProvider, useData } from "@/context/DataContext";
import Theme from "../../theme";
import NetSelectModal from "@/components/NetSelectModal";
import "../../css/style.css";

export default function App() {
  const chainName = ["black", "solana", "binance", "ethereum"];
  const [visibleMenuModal, setVisibleMenuModal] = useState(false);
  const context = useData();
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  const { chain, setChain } = context;

  return (
    <div
        style={{backgroundColor: Theme[chainName[chain] as keyof typeof Theme].bg}}
      className={`w-full min-h-[100vh] ${Theme[chainName[chain] as keyof typeof Theme].backgroundColor
        }`}
    >
      {visibleMenuModal ? (
        <NetSelectModal
          onCloseClicked={() => {
            setVisibleMenuModal(false);
          }}
        />
      ) : (
          <div>
            <div className="absolute top-0 left-0 pointer-events-none">
              <img src={Theme[chainName[chain] as keyof typeof Theme].topBlur} alt='chain'/>
            </div>
            <div className="fixed pointer-events-none bottom-0 right-0">
              <img
                  src={Theme[chainName[chain] as keyof typeof Theme].bottomBlur1}
                  alt='blur'
              />
            </div>

            <div className="max-w-[1440px] w-full m-auto relative min-h-[100vh]">
              <Navbar onMenuClicked={setVisibleMenuModal}/>
              <div className="flex flex-row justify-center md:p-[10px]">
                <div className="w-full max-w-[940px] flex flex-col justify-center gap-16 pb-20">
                  <p className="text-white text-[32px] text-center">
                    How it works
                  </p>
                  <div className="flex flex-row gap-3 w-full justify-center">
                    <div
                        className="w-full max-w-[300px] h-[156px] md:h-[120px] rounded-[32px] bg-[#2D2D2D4D] flex flex-col justify-center items-center gap-3">
                      <p className="text-white text-[14px]">I</p>
                      <p className="text-white text-[24px] md:text-[20px]">Buy</p>
                    </div>

                    <div
                        className="w-full max-w-[300px] h-[156px] md:h-[120px] rounded-[32px] bg-[#2D2D2D4D] flex flex-col justify-center items-center gap-3">
                      <p className="text-white text-[14px]">II</p>
                      <p className="text-white text-[24px] md:text-[20px]">Shill / Hold</p>
                    </div>

                    <div
                        className="w-full max-w-[300px] h-[156px] md:h-[120px] rounded-[32px] bg-[#2D2D2D4D] flex flex-col justify-center items-center gap-3">
                      <p className="text-white text-[14px]">III</p>
                      <p className="text-white text-[24px] md:text-[20px]">Take profit</p>
                    </div>
                  </div>
                  <p
                      className="text-white text-[14px] text-center "
                      style={{lineHeight: "27px"}}
                  >
                    Introducing Chebu, an automatic liquidity distribution system
                    capped at a cool 1 trillion tokens, with a pre-programmed
                    selling price at each of its 1 million levels. Token security?
                    Locked in with a nonrugpull mechanism, meaning only token
                    buyers can withdraw liquidity. Every token bought boosts the
                    TVL. Developers skipped the pre-mint dance.
                  </p>
                  <p
                      className="text-white text-[14px] text-center "
                      style={{lineHeight: "27px"}}
                  >
                    The developer takes a 5% cut from each transaction and
                    reinvests it into more token shilling. The game plan&apos;s
                    simple: Buy, Shill, Take Profit. Good luck out there!
                  </p>
                </div>
              </div>
            </div>
            <Footbar/>
            <div className="md:p-[26px]">
              <Socialbar/>
            </div>
          </div>
      )}
    </div>
  );
}
