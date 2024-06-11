"use client";
import React, {useEffect, useState} from "react";
import Navbar from "@/components/Navbar";
import "../css/style.css";
import NetworkModal from "@/components/NetworkModal";
import Footbar from "@/components/Footbar";
import Socialbar from "@/components/Socialbar";
import { useData } from "@/context/DataContext";
import NetSelectModal from "@/components/NetSelectModal";
import Theme from "../theme";
import { useBalance, useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import config from "@/config/general";
import Counter from "@/components/Counter";
import {useWeb3Modal} from "@web3modal/wagmi/react";
import {ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    const [viewMode, setViewMode] = useState(true);
    const { address: walletAddress, isConnecting, isDisconnected } = useAccount()
    const [spendCount, setSpendCount] = useState(0)
    const { open } = useWeb3Modal()
    const [toastId, setToastId] = useState<any>(null)
    const [buyToastId, setBuyToastId] = useState<any>(0)

    const balanceChebu = useBalance({
        address: walletAddress,
        token: "0xf35b8249Ef91317f06E67c887B38483089c18724"
    })

    const tradeToken = useReadContract({
        abi: config.chebuAbi,
        address: config.chebuAddress,
        functionName: 'tradeToken',
    })

    const balanceTradeToken = useBalance({
        address: walletAddress,
        token: tradeToken.data as any
    })

    const {data: allowance, refetch: refetchAllowance}: any = useReadContract({
        abi: config.tetherAbi,
        address: tradeToken.data as any,
        functionName: 'allowance',
        args: ['0xfF8FA87d1A8e28b209747920C53e953452065797', config.chebuAddress]
    })

    const isAllowanceLoading = allowance === undefined && walletAddress !== undefined

    const { writeContract: sellChebu, isPending,} = useWriteContract()
    const { writeContract: buyChebu, isPending: isChebuBuyPending, data: buyChebuHash} = useWriteContract()
    const { writeContract: approveTradeToken, isPending: approvePending, data: approveTradeTokenHash } = useWriteContract()

    const {isSuccess: isApproveDone } = useWaitForTransactionReceipt({
        hash: approveTradeTokenHash,
        pollingInterval: 1_000
    })

    const {isSuccess: isBuyDone, isPending: pend, isFetched: fet } = useWaitForTransactionReceipt({
        hash: buyChebuHash,
        pollingInterval: 1_000
    })

    useEffect(() => {
        if(approveTradeTokenHash && !isApproveDone){
            setToastId(toast.loading('Waiting for approve'))
        }
        if(isApproveDone) {
            refetchAllowance()
            toast.update(toastId || 0, { render: "Approved", type: "success", isLoading: false, autoClose: 2000 });
            setToastId(null)
        }
    }, [isApproveDone, approveTradeTokenHash]);

    useEffect(() => {
        if(buyChebuHash && !isBuyDone){
            setBuyToastId(toast.loading('Transaction processing'))
        }
        if(isBuyDone){
            toast.update(buyToastId || 0, { render: "Approved", type: "success", isLoading: false, autoClose: 2000 });
            balanceTradeToken.refetch()
            balanceChebu.refetch()
            refetchAllowance()
        }
    }, [isBuyDone, buyChebuHash]);

    const chainName = ["black", "solana", "binance", "ethereum"];
    const context = useData();
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    const { chain, setChain } = context;
    const [visibleMenuModal, setVisibleMenuModal] = useState(false);


    return (
        <div
            style={{backgroundColor: Theme[chainName[chain] as keyof typeof Theme].bg}}
            className={`w-full min-h-[100vh] ${Theme[chainName[chain] as keyof typeof Theme].backgroundColor}`}
        >
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            {visibleMenuModal ? (
                <NetSelectModal
                    onCloseClicked={() => {
                        setVisibleMenuModal(false);
                    }}
                />
            ) : (
                <div className='relative'>
                    {/* Website Landing */}
                    <div className="absolute top-0 left-0 pointer-events-none">
                        <img src={Theme[chainName[chain] as keyof typeof Theme].effect}/>
                    </div>
                    <div className="fixed bottom-0 right-0 pointer-events-none">
                        <img src={Theme[chainName[chain] as keyof typeof Theme].bottomBlur2}
                        />
                    </div>
                    {/* WebSite Container */}
                    <div className="relative max-w-[1440px] w-full m-auto min-h-[100vh] overflow-hidden flex flex-col">
                        {/*<p className='text-white text-center p-5'>{isPending ? 'pending' : 'idle'}</p>*/}
                        <p className=' fixed top-4 left-4 text-white text-center p-5'>{`${allowance}`}</p>
                        <Navbar onMenuClicked={setVisibleMenuModal}/>
                        <div
                            className="grow w-full flex px-[71px] flex-row justify-between items-center md:flex-col md:items-center md:p-[16px] md:gap-5">
                            <div className="">
                                <img
                                    className='md:h-auto h-[17vh]'
                                    src={Theme[chainName[chain] as keyof typeof Theme].title}
                                />
                                <img
                                    className='md:h-auto h-[50vh]'
                                    src={Theme[chainName[chain] as keyof typeof Theme].hero}/>
                            </div>
                            <div className="hidden md:block cursor-pointer">
                                {chain === 0 ? (
                                    <div onClick={() => setVisibleMenuModal(true)}>
                                        <p className="text-[#BBBBBB]">Choose Network</p>
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-row gap-[13px]"
                                        onClick={() => {
                                            window.scrollTo({
                                                top: document.body.scrollHeight,
                                                behavior: 'smooth'
                                            });
                                            setViewMode(true);
                                        }}
                                    >
                                        <p className="text-[#BBBBBB]">View Price</p>
                                        <img src="./assets/button/ScrollDown.svg"/>
                                    </div>
                                )}
                            </div>
                            {chain === 0 ? (
                                <div className="flex flex-col gap-3 md:hidden pr-[50px]">
                                    <p className="text-[32px] text-white select-none">
                                        Choose your Chebu
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <NetworkModal chain="ethereum" onClick={null}/>
                                        <NetworkModal chain="solana" onClick={null}/>
                                        <NetworkModal chain="binance" onClick={null}/>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`flex flex-col gap-[16px] p-6 buysell-modal md:w-full ${chain ? chainName[chain] : ""
                                    } ${viewMode ? "" : "md:hidden"}`}
                                >
                                    <table className="price-table">
                                        <tr className="table-row-head">
                                            <td className="text-left">Price (SOL)</td>
                                            <td className="text-center">Amount (Chebu)</td>
                                            <td className="text-right">Amount (USD)</td>
                                        </tr>
                                        <tr className="table-row-item-red">
                                            <td className="text-left">0.0001</td>
                                            <td className="text-center">1,000,000.23</td>
                                            <td className="text-right text-white">2.421</td>
                                        </tr>

                                        <tr className="table-row-item-red">
                                            <td className="text-left">0.0002</td>
                                            <td className="text-center">1,000,000.23</td>
                                            <td className="text-right text-white">3.431</td>
                                        </tr>

                                        <tr className="table-row-item-red">
                                            <td className="text-left">0.0003</td>
                                            <td className="text-center">1,000,000.23</td>
                                            <td className="text-right text-white">3.435</td>
                                        </tr>

                                        <tr className="table-row-item-selected">
                                            <td className="text-left">0.0003</td>
                                            <td className="text-center">1,000,000.23</td>
                                            <td className="text-right text-white">3.435</td>
                                        </tr>

                                        <tr className="table-row-item-green">
                                            <td className="text-left">0.0002</td>
                                            <td className="text-center">1,000,000.23</td>
                                            <td className="text-right text-white">3.423</td>
                                        </tr>

                                        <tr className="table-row-item-green">
                                            <td className="text-left">0.00025</td>
                                            <td className="text-center">1,000,000.23</td>
                                            <td className="text-right text-white">3.423</td>
                                        </tr>

                                        <tr className="table-row-item-green">
                                            <td className="text-left">0.000321</td>
                                            <td className="text-center">1,000,000.23</td>
                                            <td className="text-right text-white">3.423</td>
                                        </tr>
                                    </table>
                                    <div className='flex flex-col gap-[4px]'>
                                        <Counter count={spendCount} setCount={setSpendCount}/>
                                        <div className='mb-[6px]'>
                                            <p className="text-[#CCC] pl-3 mb-[4px] block">Your balance</p>
                                            <div className="rounded-[16px] w-full bg-[#141515]">
                                                <div
                                                    className="flex flex-row justify-between items-center w-full text-[16px] p-5">
                                                    <div className="flex flex-row gap-[5px]">
                                                        <p className="text-[#E4E4E4] truncate">{parseFloat(balanceChebu.data?.formatted || '0').toFixed(2)}</p>
                                                        <p className="text-[#797489]">Chebu</p>
                                                    </div>
                                                    <div className="flex flex-row gap-[5px]">
                                                        <p className="text-[#E4E4E4]">{parseFloat(balanceTradeToken.data?.formatted || '0').toFixed(2)}</p>
                                                        <p className="text-[#797489]">USD</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="w-full rounded-full flex flex-row text-white text-[16px] overflow-hidden border-[#0A0A0A] border-4 relative">
                                            <button
                                                className={`${isAllowanceLoading || isChebuBuyPending || approvePending ? 'opacity-30' : ''} w-full bg-[#21DB60] flex justify-center items-center p-3 cursor-pointer hover:bg-green-600 hover:scale-105 hover:shadow-lg transition duration-300 ease-in-out`}
                                                disabled={isAllowanceLoading || isChebuBuyPending || approvePending}
                                                onClick={() => {
                                                if(!walletAddress) {
                                                    open()
                                                    return
                                                }
                                                if(allowance < spendCount * config.decimalTradeToken){
                                                    approveTradeToken({
                                                        abi: config.tetherAbi,
                                                        address: tradeToken.data as any,
                                                        functionName: 'approve',
                                                        args: [
                                                            config.chebuAddress,
                                                            spendCount * config.decimalTradeToken
                                                        ]
                                                    })
                                                    return;
                                                }
                                                buyChebu({
                                                    abi: config.chebuAbi,
                                                    address: config.chebuAddress,
                                                    functionName: 'mintTokensForExactStable',
                                                    args: [spendCount * config.decimalTradeToken]
                                                })
                                            }}>
                                                <p>{isChebuBuyPending || approvePending ? 'Loading...' : 'BUY'}</p>
                                            </button>
                                            <button
                                                onClick={()=> {
                                                    if(!walletAddress) {
                                                        open()
                                                        return
                                                    }
                                                    sellChebu({
                                                        abi: config.chebuAbi,
                                                        address: config.chebuAddress,
                                                        functionName: 'burnExactTokensForStable',
                                                        args: [spendCount * config.decimalChebu]
                                                    })
                                                }}
                                                className="w-full bg-[#FF2A2A] flex justify-center items-center p-3 cursor-pointer hover:bg-red-600 hover:scale-105 hover:shadow-lg transition duration-300 ease-in-out">
                                                <p>SELL</p>
                                            </button>
                                            <div className="boost-middle-btn flex justify-center items-center">
                                                <img
                                                    src={
                                                        Theme[chainName[chain] as keyof typeof Theme].herohead
                                                    }
                                                />
                                            </div>
                                        </div></div>
                                </div>
                            )}
                        </div>
                        <div className={`${viewMode ? "" : "md:hidden"}`}>
                            <Footbar/>
                        </div>
                    </div>
                    <div className={`${viewMode ? "md:p-[26px]" : "md:hidden"}`}>
                        <Socialbar/>
                    </div>
                </div>
            )}
        </div>
    );
}
