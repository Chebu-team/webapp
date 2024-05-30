"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
} from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import NetworkModal from "@/components/NetworkModal";
import Footbar from "@/components/Footbar";
import Socialbar from "@/components/Socialbar";
import NetSelectModal from "@/components/NetSelectModal";
import { DataProvider, useData } from "@/context/DataContext";
import createFox from "@metamask/logo";

import { Connector, useConnect, useAccount, useDisconnect } from "wagmi";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import Theme from "../../theme";
import "../../css/style.css";

export default function App() {
  const chainName = ["black", "solana", "binance", "ethereum"];
  const context = useData();
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  const { chain, setChain } = context;
  const [visibleMenuModal, setVisibleMenuModal] = useState(false);

  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  const containerRef = useRef(null);
  const [flag, setFlag] = useState(false);

  const walletModal = useWalletModal();
  const { connection } = useConnection();
  const { publicKey, disconnect: sol_disconnect } = useWallet();

  useEffect(() => {
    const container = (containerRef as any)?.current;
    if (!container || flag) return;
    const viewer = createFox({
      width: "100px",
      height: "100px",
      pxNotRatio: 1,
      followMouse: true,
    });
    // viewer?.lookAt({ x: 100, y: 100 });
    container.innerHTML = "";
    container.appendChild(viewer?.container);
    setFlag(true);
  }, [containerRef, flag]);

  function walletConnect() {
    // const currentNet = chain === 3 ? 1 : chain;/
    // const chainList = {
    //   mainnet : {
    //     chainId : 1,
    //   },
    //   solana : {
    //     chainId : 101,
    //   }, 
    //   binance : {
    //     chainId : 56
    //   }
    // }
    // const currentNet = chain === 0 || chain === 3 ? chainList.mainnet : chain === 1 ? chainList.solana : chainList.binance;
    if (chain === 0 || chain == 3) {
      connect({ chainId: 1, connector: connectors[1] });  //mainnet
      setChain(3);
    }
    else if (chain === 2)
      connect({ chainId: 56, connector: connectors[1] });  //binance
    else {
      walletModal.setVisible(true);
    }
  }
  function walletDisconnect() {
    if (chain === 1)     //solana
    {
      sol_disconnect();
    }
    else {
      disconnect();
    }
  }

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
              <img src={Theme[chainName[chain] as keyof typeof Theme].topBlur}/>
            </div>
            <div className="fixed pointer-events-none bottom-0 right-0">
              <img
                  src={Theme[chainName[chain] as keyof typeof Theme].bottomBlur1}
              />
            </div>

            <div className="max-w-[1440px] w-full m-auto relative min-h-[100vh]">
              <Navbar onMenuClicked={setVisibleMenuModal}/>
              <div className="flex flex-row justify-center items-center mt-20">
                <div
                    className="w-[636px] rounded-[32px] bg-[#0000004D] p-6 flex flex-col gap-20 items-center justify-center">
                  <div className=" flex flex-col items-center justify-center gap-5">
                    {/* <img className="" src="./assets/Metamask.svg" alt="" /> */}
                    <div ref={containerRef}></div>

                    <p className="text-[24px] text-white select-none">
                      {(!isConnected && !publicKey)
                          ? "Connect via Metamask"
                          : "Are you sure you want to log out of your profile?"}
                    </p>
                  </div>
                  <div className="flex flex-row justify-center gap-5">
                    {(!isConnected && !publicKey) ? (
                        <Link href="/">
                          <div className="primary-btn">
                            <p className="text-[15px] text-center text-white select-none">
                              Go back
                            </p>
                          </div>
                        </Link>
                    ) : (
                        <div className="primary-btn" onClick={() => {
                          walletDisconnect();
                        }}>
                          <p className="text-[15px] text-center text-white select-none">
                            Yes, Log out
                          </p>
                        </div>
                    )}

                    {(!isConnected && !publicKey) ? (
                        <div
                            className="primary-btn"
                            onClick={() => {
                              walletConnect();
                            }
                            }
                        >
                          <p className="text-[15px]  text-center text-white select-none">
                            Connect
                          </p>
                        </div>
                    ) : (
                        <Link href="/">
                          <div className="primary-btn">
                            <p className="text-[15px]  text-center text-white select-none">
                              Close
                            </p>
                          </div>
                        </Link>
                    )}
                  </div>
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
