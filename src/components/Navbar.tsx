"use client";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
//import { useOutsideAlerter } from "../hooks/action";
import Link from "next/link";
import { useData } from "@/context/DataContext";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWeb3Modal } from '@web3modal/wagmi/react'

import {useAccount, useReadContract, useSwitchChain} from "wagmi";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";


import Theme from "../theme";
import MobileMenu from "@/components/MobileMenu";

import {mainnet, sepolia, bsc} from "wagmi/chains";
import config from "@/config/general";

interface props {
  onMenuClicked: any;
}

/**
 * The Navbar component is responsible for rendering the navigation bar at the top of the application.
 * It includes functionality for selecting the current blockchain network, connecting a wallet, and displaying various metrics.
 *
 * @param {props} onMenuClicked - A callback function that is called when the menu button is clicked.
 * @returns {JSX.Element} The rendered Navbar component.
 */
/**
 * The Navbar component is responsible for rendering the main navigation bar of the application.
 * It includes functionality for selecting the current blockchain network, connecting a wallet, and displaying various metrics.
 *
 * The component uses the `useData` hook to access the current blockchain network and provide a way to change it.
 * It also uses the `useOutSideAlerter` hook to handle click events outside of the network and wallet selection dropdowns.
 *
 * The Navbar component renders the following elements:
 * - The application logo and title
 * - A menu button for mobile devices
 * - A set of buttons for selecting the current blockchain network
 * - A button for connecting a wallet
 * - Metrics such as the number of holders and the total value locked (TVL)
 */

const Navbar = ({ onMenuClicked }: props) => {
  const chains = ["Solana", "Binance", "Ethereum"];
  const [chooseNetSelected, setChooseNetSelected] = useState(false);
  const [connectWalletSelected, setConnectWalletSelected] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);
  const { address: walletAddress, chain: walletChain} = useAccount()
  const { open } = useWeb3Modal()

  const {data: tradeToken} = useReadContract({
    abi: config.chebuAbi,
    address: config.chebuAddress,
    functionName: 'tradeToken',
  })

  const {data: tvl}: any = useReadContract({
    abi: config.tetherAbi,
    address: tradeToken as any,
    functionName: 'balanceOf',
    args: [config.chebuAddress]
  })

  const context = useData();
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  const { chain, setChain } = context;

  const {switchChain} = useSwitchChain()

  useEffect(() => {
    if(walletChain?.name === 'Sepolia'){
      setChain(1)
      return
    }
    switch ( walletChain?.nativeCurrency.symbol) {
      case 'ETH' :
        setChain(3)
        break;
      case 'BNB' :
        setChain(2)
        break;
    }
  }, [walletChain]);

  const changeChain = (name: string) => {
    switch (name) {
      case 'Solana' :
        switchChain({chainId: sepolia.id})
        break;
      case 'Ethereum' :
        switchChain({chainId: mainnet.id})
        break;
      case 'Binance' :
        switchChain({chainId:bsc.id})
        break
    }
  }

  const onMobileMenuClose = () => {
    setMenuClicked(false)
  }

  const chainName = ["black", "solana", "binance", "ethereum"];
  const { isConnected, isConnecting, address } = useAccount();

  const { connection } = useConnection();
  const { publicKey, disconnect: sol_disconnect } = useWallet();

  const account_address = isConnected ? address : publicKey?.toString();
  //const [currentNet, setCurrentNet] = useState(chain);

  const chainRef = useRef(null);
  useOutSideAlerter(chainRef, setChooseNetSelected);

  const walletRef = useRef(null);
  useOutSideAlerter(walletRef, setConnectWalletSelected);

  function useOutSideAlerter(
    ref: RefObject<HTMLElement>,
    setStateHandle: (value: boolean) => void
  ) {
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setStateHandle(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on cleanup
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  }
  function setCurrentNetHandle(index: any) {
    setChain(index);
  }

  return (
      <>
        <span
            className='hidden bg-[#212121] bg-[#111111] bg-[#1D1D22] bg-[#3C3C3C] hover:bg-[#3C3C3C] bg-[#020305] hover:bg-opacity-50 bg-[#0A0A0B] bg-[#050505] bg-[#34404F] hover:bg-[#34404F] bg-[#121216] bg-[#070604] bg-[#19140E] bg-[#3C2D0D] hover:bg-[#3C2D0D] bg-opacity-50 bg-[#222019] bg-[#040407] bg-[#222136] hover:bg-[#222137] bg-[#0D111D]'>HACK TAILWIND CLASSES</span>
        <div className="flex flex-col py-[26px] px-[71px] md:py-[20px] gap-[16px] md2:px-[40px] md:px-[15px]">
          <div className="w-full flex flex-row justify-between relative">
            <Link href="/" className='md:hidden'>
              <div className="flex flex-row items-center gap-[8px]">
                <img
                    className="w-[54.22px] h-[44.62px]"
                    src={`./assets/theme/${chainName[chain]}/TitleLogo.svg`}
                />
                <img
                    className="w-[68px] h-[20px] md2:hidden"
                    src='./assets/chebu.svg'
                />
                {/*<p className="text-[19px] text-white select-none font-['Ariana Pro']">Chebu</p>*/}
              </div>
            </Link>
            <button
                className="lg:hidden flex items-center"
                onClick={() => {
                  setMenuClicked(true);
                }}
            >
              <img src="./assets/button/Menu.svg"/>
            </button>

            {menuClicked && <MobileMenu chainName={chainName[chain]} onClose={onMobileMenuClose}/>}
            <div className="lg:hidden flex items-center absolute h-full justify-center left-1/2 -translate-x-1/2">
              <Link href="/">
                <img
                    className="w-[68px] h-[20px] md2:hidden"
                    src='./assets/chebu.svg'
                />
                {/*<p className="text-[19px] text-white select-none">Chebu</p>*/}
              </Link>
            </div>
            <div className="flex flex-row gap-[28px] md2:gap-[8px]">
              <div
                  className={`flex flex-row gap-[15px] rounded-full p-1 w-[474px] md:hidden ${Theme[chainName[chain] as keyof typeof Theme].toolbar_bg_color}`}
              >
                <div
                    className={`w-full cursor-pointer rounded-full flex items-center justify-center gap-1 md:hidden  ${Theme[chainName[chain] as keyof typeof Theme]
                        .btn_bg_selected_color_hover
                    } active:bg-opacity-100`}
                >
                  <Link href="/about">
                    <p className="text-white text-[15px] select-none">
                      How it works
                    </p>
                  </Link>
                </div>

                <div className="w-full bg-[#111111] rounded-full flex items-center justify-center gap-1">
                  <p className="text-[#BBBBBB] text-[15px] select-none">
                    Holders:{" "}
                  </p>

                  <p className="text-white text-[15px] select-none">223k</p>
                </div>
                <div className="w-full bg-[#111111] rounded-full flex items-center justify-center gap-1 ">
                  <p className="text-[#BBBBBB] text-[15px] select-none">TVL: </p>
                  <p className="text-white text-[15px] select-none">{`${Math.round(Number(tvl || 0)/config.decimalTradeToken)}`} $</p>
                </div>
              </div>

              <div className="relative md:hidden">
                <div
                    className={`rounded-full p-[6px] w-[202px] flex items-center active:bg-opacity-100  ${chooseNetSelected
                        ? Theme[chainName[chain] as keyof typeof Theme]
                            .btn_bg_selected_color
                        : Theme[chainName[chain] as keyof typeof Theme]
                            .toolbar_bg_color +
                        " " +
                        Theme[chainName[chain] as keyof typeof Theme]
                            .btn_bg_selected_color_hover
                    }`}
                >
                  <button
                      className={`w-full flex items-center justify-center cursor-pointer`}
                      onClick={(e) => {
                        setChooseNetSelected(!chooseNetSelected);
                      }}
                  >
                    <img
                        className="w-[32px] h-[32px]"
                        src={
                          chain === 0
                              ? "./assets/button/ChooseNetImage.svg"
                              : `./assets/chain/${chains[chain - 1]}.svg`
                        }
                    />

                    <p className="text-[14px] text-white flex-grow text-center select-none">
                      {chain === 0 ? "Choose net" : chains[chain - 1]}
                    </p>
                    <div className="w-[32px] h-[32px] flex items-center justify-center">
                      <img
                          className="w-[10px] h-[10px]"
                          src="./assets/button/DownArrow.svg"
                      />
                    </div>
                  </button>
                </div>
                {!chooseNetSelected ? (
                    ""
                ) : (
                    <div
                        className={`absolute p-[4px] top-[100%] w-[200px] rounded-[20px] mt-3 z-10 overflow-hidden ${Theme[chainName[chain] as keyof typeof Theme].btn_bg_color}`}
                        ref={chainRef}
                    >
                      <div className="flex flex-col">
                        {chains.map((eachChain, index) => {
                          return (
                              <button
                                  className={`flex flex-row gap-4 items-center p-[4.5px] cursor-pointer ${Theme[chainName[chain] as keyof typeof Theme].btn_bg_selected_color_hover} active:bg-opacity-100 rounded-full`}
                                  onClick={() => {
                                    changeChain(eachChain)
                                    setCurrentNetHandle(index + 1);
                                    setChooseNetSelected(false);
                                  }}
                                  key={index}
                              >
                                <img src={`./assets/chain/${eachChain}.svg`}/>
                                <p className="text-white text-[15px] select-none">
                                  {eachChain}
                                </p>
                              </button>
                          );
                        })}
                      </div>
                    </div>
                )}
              </div>
              <div className="relative">
                <div
                    className={`${connectWalletSelected
                        ? Theme[chainName[chain] as keyof typeof Theme]
                            .btn_bg_selected_color
                        : Theme[chainName[chain] as keyof typeof Theme]
                            .toolbar_bg_color +
                        " " +
                        Theme[chainName[chain] as keyof typeof Theme]
                            .btn_bg_selected_color_hover
                    } rounded-full p-[6px] w-[202px] md:w-[108px] flex items-center cursor-pointer active:bg-opacity-100`}
                    onClick={() => {
                      open()
                    }}
                >
                  <div className="w-full flex items-center justify-center ">
                    <img
                        className="w-[32px] h-[32px]"
                        src={
                          !isConnected && !publicKey
                              ? "./assets/button/DefaultWalletImage.svg"
                              : "./assets/button/MetaMaskWalletImage.svg"
                        }
                    />
                    <p className="text-[14px] text-white flex-grow text-center select-none md:hidden">
                      {!isConnected && !publicKey
                          ? "Connect Wallet"
                          : account_address?.slice(2, 6) + "..." + account_address?.slice(-4)}
                    </p>
                    <p className="text-[14px] text-white flex-grow text-center select-none hidden md:block">
                      {!isConnected && !publicKey
                          ? "Wallet"
                          : account_address?.slice(2, 6) + "..." + account_address?.slice(-4)}
                    </p>
                  </div>
                </div>
                {!connectWalletSelected ? (
                    ""
                ) : (
                    <div
                        className={`absolute top-[100%] w-[200px] rounded-[20px] mt-3 z-10 overflow-hidden right-0 p-[4px] ${Theme[chainName[chain] as keyof typeof Theme].btn_bg_color
                        }`}
                        ref={walletRef}
                    >
                      <div className="flex flex-col">
                        {!isConnected && (
                            <Link href="/wallet">
                              <div
                                  className={`flex flex-row gap-4 items-center p-3 cursor-pointer rounded-full p-[4px] ${Theme[chainName[chain] as keyof typeof Theme]
                                      .btn_bg_selected_color_hover
                                  } active:bg-opacity-100`}
                              >
                                <img src="./assets/button/MetaMaskWalletImage.svg"/>
                                <p className="text-white text-[15px] select-none">
                                  Metamask
                                </p>
                              </div>
                            </Link>
                        )}
                        <div
                            className={`flex flex-row gap-4 items-center p-3 cursor-pointer rounded-full p-[4px] ${Theme[chainName[chain] as keyof typeof Theme].btn_bg_selected_color_hover} active:bg-opacity-100`}
                        >
                          <img src="./assets/button/AnotherWalletImage.svg"/>
                          <p className="text-white text-[15px] select-none">
                            Another Wallet
                          </p>
                        </div>
                        {isConnected && (
                            <Link href="/wallet">
                              <div
                                  className={`flex flex-row gap-4 items-center p-3 cursor-pointer ${Theme[chainName[chain] as keyof typeof Theme]
                                      .btn_bg_selected_color_hover
                                  } active:bg-opacity-100`}
                              >
                                <img src="./assets/button/LogOutImage.svg"/>
                                <p className="text-white text-[15px] select-none">
                                  Log out
                                </p>
                              </div>
                            </Link>
                        )}
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
          <div
              className={`${Theme[chainName[chain] as keyof typeof Theme].toolbar_bg_color
              } w-full flex flex-row gap-[15px] rounded-full p-1 opacity-0 md:opacity-100`}
          >
            <div className="w-full bg-[#111111] rounded-full flex items-center justify-center gap-1 py-2">
              <p className="text-[#BBBBBB] text-[15px] select-none">Holders: </p>
              <p className="text-white text-[15px] select-none">223k</p>
            </div>
            <div className="w-full bg-[#111111] rounded-full flex items-center justify-center gap-1 ">
              <p className="text-[#BBBBBB] text-[15px] select-none">TVL: </p>
              <p className="text-white text-[15px] select-none">1,23M $</p>
            </div>
          </div>
        </div>
      </>
  );
};

export default Navbar;
