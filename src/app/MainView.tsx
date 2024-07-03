"use client";
import React, {useEffect, useState} from "react";
import Navbar from "@/components/Navbar";
import "../css/style.css";
import NetworkModal from "@/components/NetworkModal";
import Footbar from "@/components/Footbar";
import { useData } from "@/context/DataContext";
import NetSelectModal from "@/components/NetSelectModal";
import Theme from "../theme";
import {
    useBalance,
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    useSwitchChain
} from 'wagmi'

import config from "@/config/general";
import Counter from "@/components/Counter";
import {useWeb3Modal} from "@web3modal/wagmi/react";
import {ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {bsc, mainnet, sepolia} from "wagmi/chains";
import BigNumber from "bignumber.js";

export default function App() {
    const [viewMode, setViewMode] = useState(true);
    const { address: walletAddress, isConnecting, isDisconnected, chain: walletChain } = useAccount()
    const [spendCountChebu, setSpendCountChebu] = useState(0)
    const { open } = useWeb3Modal()
    const [toastId, setToastId] = useState<any>(null)
    const [buyToastId, setBuyToastId] = useState<any>(0)
    const [sellToastId, setSellToastId] = useState<any>(0)
    const {switchChain} = useSwitchChain()

    const context = useData();
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }

    const { chain } = context;

    useEffect(() => {
        if(!chain) return
        refetchRound().then(() => {
            refetchMinted()
            refetchRemain()
        })
        const interval = setInterval(() => {
            refetchRound().then(() => {
                refetchMinted()
                refetchRemain()
            })
        }, 60*1000)
        return () => {
            clearInterval(interval)
        }
    }, [chain]);

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

    const balanceChebu = useBalance({
        address: walletAddress,
        token: config.chebuAddress[chain]
    })

    const {data: currRound, refetch: refetchRound} = useReadContract({
        abi: config.chebuAbi,
        address: config.chebuAddress[chain],
        functionName: 'getCurrentRound',
    })

    const {data: priceAndMinted = [], refetch: refetchMinted}  = useReadContract({
        abi: config.chebuAbi,
        address: config.chebuAddress[chain],
        functionName: 'priceAndMintedInRound',
        args: [currRound]
    })

    const {data: priceAndRemain = [], refetch: refetchRemain}  = useReadContract({
        abi: config.chebuAbi,
        address: config.chebuAddress[chain],
        functionName: 'priceAndRemainByRound',
        args: [currRound]
    })

    const tradeToken = useReadContract({
        abi: config.chebuAbi,
        address: config.chebuAddress[chain],
        functionName: 'tradeToken',
    })

    const {data: conversionRateForOneDollar, isPending, status} = useReadContract({
        abi: config.chebuAbi,
        address: config.chebuAddress[chain],
        functionName: 'calcMintTokensForExactStable',
        args:[config.decimalTradeToken],
    })

    const {data: tvlEther}: any = useReadContract({
        abi: config.tetherAbi,
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        functionName: 'balanceOf',
        args: [config.chebuAddress[3]]
    })

    // @ts-ignore
    const chebuToDollar = conversionRateForOneDollar ? parseFloat((Number(conversionRateForOneDollar[0])/config.decimalChebu + Number(conversionRateForOneDollar[1])/config.decimalChebu).toFixed(2)) : 4715
    // @ts-ignore

    const balanceTradeToken = useBalance({
        address: walletAddress,
        token: tradeToken.data as any
    })

    const {refetch: refetchAllowance, isFetching: isAllowanceFetching}: any = useReadContract({
        abi: config.tetherAbi,
        address: tradeToken.data as any,
        functionName: 'allowance',
        args: [walletAddress, config.chebuAddress[chain]]
    })

    const { writeContract: sellChebu, isPending: isSellPending, data: sellHash} = useWriteContract()
    const { writeContract: buyChebu, isPending: isChebuBuyPending, data: buyChebuHash} = useWriteContract()
    const { writeContract: approveTradeToken, isPending: approvePending, data: approveTradeTokenHash } = useWriteContract()

    const {isSuccess: isSellDone } = useWaitForTransactionReceipt({
        hash: sellHash,
        pollingInterval: 1_000
    })
    const {isSuccess: isApproveDone } = useWaitForTransactionReceipt({
        hash: approveTradeTokenHash,
        pollingInterval: 1_000
    })
    const {isSuccess: isBuyDone } = useWaitForTransactionReceipt({
        hash: buyChebuHash,
        pollingInterval: 1_000
    })

    useEffect(() => {
        if(sellHash && !isSellDone){
            setSellToastId(toast.loading('Transaction in progress'))
        }
        if(isSellDone) {
            balanceTradeToken.refetch()
            balanceChebu.refetch()
            toast.update(sellToastId || 0, { render: "SELL Confirmed!", type: "success", isLoading: false, autoClose: 2000 });
            setSellToastId(null)
        }
    }, [isSellDone, sellHash]);

    useEffect(() => {
        if(approveTradeTokenHash && !isApproveDone){
            setToastId(toast.loading('Waiting for approve'))
        }
        if(isApproveDone) {
            toast.update(toastId || 0, { render: "Approve confirmed!", type: "success", isLoading: false, autoClose: 2000 });
            setToastId(null)
            buyChebu({
                abi: config.chebuAbi,
                address: config.chebuAddress[chain],
                functionName: 'mintTokensForExactStable',
                args: [Math.round(spendCountChebu / chebuToDollar * config.decimalTradeToken)]
            })
        }
    }, [isApproveDone, approveTradeTokenHash]);

    useEffect(() => {
        if(buyChebuHash && !isBuyDone){
            setBuyToastId(toast.loading('Transaction processing'))
        }
        if(isBuyDone){
            toast.update(buyToastId || 0, { render: "Purchase confirmed!", type: "success", isLoading: false, autoClose: 2000 });
            balanceTradeToken.refetch()
            balanceChebu.refetch()
        }
    }, [isBuyDone, buyChebuHash, isChebuBuyPending]);

    const chainName = ["black", "solana", "binance", "ethereum"];
    const [visibleMenuModal, setVisibleMenuModal] = useState(false);

    return (
        <div
            style={{backgroundColor: Theme[chainName[chain] as keyof typeof Theme].bg}}
            className={`w-full min-h-[100vh] ${Theme[chainName[chain] as keyof typeof Theme].backgroundColor}`}
        >
            {/*@ts-ignore*/}
            <p className='fixed top-[100px] left-1/3 z-50 text-white'>
                {/*@ts-ignore*/}
                {/*<p className="text-[24px] text-white select-none">{priceAndRemain[0] ? priceAndRemain[0].toString() : 0} / {priceAndRemain[1] ? BigNumber(priceAndRemain[1]).div(BigNumber(config.decimalChebu)).toFormat(0) : 0}</p>*/}
            </p>
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
                        <img src={Theme[chainName[chain] as keyof typeof Theme].effect} alt='effect'/>
                    </div>
                    <div className="fixed bottom-0 right-0 pointer-events-none">
                        <img src={Theme[chainName[chain] as keyof typeof Theme].bottomBlur2} alt='blur2'/>
                    </div>
                    {/* WebSite Container */}
                    <div className="relative max-w-[1440px] w-full m-auto min-h-[100vh] overflow-hidden flex flex-col">
                        <Navbar onMenuClicked={setVisibleMenuModal}/>
                        <div
                            className="grow w-full flex px-[71px] flex-row justify-between items-start items-center md:flex-col md:items-center md:p-[16px] md:gap-5">
                            <div className='flex justify-center grow'>
                                <div className=''>
                                    <img
                                        className='md:h-auto h-[17vh]'
                                        src={Theme[chainName[chain] as keyof typeof Theme].title}
                                        alt='title'
                                    />
                                    <img
                                        className='md:h-auto h-[50vh] chebu-scale'
                                        src={Theme[chainName[chain] as keyof typeof Theme].hero}
                                        alt='hero'
                                    />
                                </div>
                            </div>
                            <div className="hidden md:block cursor-pointer">
                                {chain !== 0 && (<div
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
                                    <img src="./assets/button/ScrollDown.svg" alt='scroll'/>
                                </div>)}
                            </div>
                            {chain === 0 ? (
                                <div className="flex flex-col gap-3 pr-[50px] md:hidden md:pr-0 little-scale">
                                    <p className="text-[32px] text-white select-none md:hidden">
                                        Choose your Chebu
                                    </p>
                                    <div
                                        className="grid grid-cols-2 gap-2 md:grid-cols-1 md:grid md:gap-[14px] md:w-full">
                                        <NetworkModal chain="ethereum" onClick={null}/>
                                        <NetworkModal chain="solana" onClick={null}/>
                                        <NetworkModal chain="binance" onClick={null}/>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`flex flex-col gap-[16px] p-6 buysell-modal md:w-full height-scale ${chain ? chainName[chain] : ""
                                    } ${viewMode ? "" : "md:hidden"}`}
                                >
                                    <table className="price-table">
                                        <tr className="table-row-head">
                                            <td className="text-left">Price</td>
                                            <td className="text-center">Amount (Chebu)</td>
                                            <td className="text-right">Amount (USDT)</td>
                                        </tr>
                                        <tr className="table-row-item-red">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{priceAndRemain[0] &&  priceAndRemain[0] > 2 ? BigNumber(priceAndRemain[0]).div(config.decimalTradeToken).minus(0.000002).toNumber() : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{priceAndRemain[0] > 2 ? '1,000,000' : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{priceAndRemain[0] > 2 ? BigNumber(priceAndRemain[0]).minus(2).toNumber() : 0}</td>
                                        </tr>
                                        <tr className="table-row-item-red">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{priceAndRemain[0] && priceAndRemain[0] > 1 ? BigNumber(priceAndRemain[0]).div(config.decimalTradeToken).minus(0.000001).toNumber() : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{priceAndRemain[0] > 1 ? '1,000,000' : '0'}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{priceAndRemain[0] > 1 ? BigNumber(priceAndRemain[0]).minus(1).toNumber() : 0}</td>
                                        </tr>
                                        <tr className="table-row-item-red">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{priceAndMinted[0] ? BigNumber(priceAndMinted[0]).div(config.decimalTradeToken).toNumber() : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{priceAndMinted[1] ? BigNumber(priceAndMinted[1]).div(BigNumber(config.decimalChebu)).toFormat(0) : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{priceAndRemain[1] ? BigNumber(priceAndMinted[1]).div(BigNumber(config.decimalChebu)).multipliedBy(BigNumber(priceAndMinted[0]).div(config.decimalTradeToken)).toNumber() : 0}</td>
                                        </tr>
                                        <tr className="table-row-item-selected">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{priceAndRemain[0] ? BigNumber(priceAndRemain[0]).div(config.decimalTradeToken).toNumber() : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{priceAndRemain[1] ? BigNumber(priceAndRemain[1]).div(BigNumber(config.decimalChebu)).toFormat(0) : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{priceAndRemain[1] ? BigNumber(priceAndRemain[1]).div(BigNumber(config.decimalChebu)).multipliedBy(BigNumber(priceAndRemain[0]).div(config.decimalTradeToken)).toNumber() : 0}</td>
                                        </tr>
                                        <tr className="table-row-item-green">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{priceAndRemain[0] ? BigNumber(priceAndRemain[0]).div(config.decimalTradeToken).plus(0.000001).toNumber() : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{priceAndRemain[0] ? '1,000,000' : '0'}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{priceAndRemain[0] ? BigNumber(priceAndRemain[0]).plus(1).toNumber() : 0}</td>
                                        </tr>
                                        <tr className="table-row-item-green">
                                        {/*@ts-ignore*/}
                                            <td className="text-left">{priceAndRemain[0] ? BigNumber(priceAndRemain[0]).div(config.decimalTradeToken).plus(0.000002).toNumber() : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{priceAndRemain[0] ? '1,000,000' : '0'}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{priceAndRemain[0] ? BigNumber(priceAndRemain[0]).plus(2).toNumber() : 0}</td>
                                        </tr>
                                        <tr className="table-row-item-green">
                                            {/*@ts-ignore*/}
                                            <td className="text-left">{priceAndRemain[0] ? BigNumber(priceAndRemain[0]).div(config.decimalTradeToken).plus(0.000003).toNumber() : 0}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-center">{priceAndRemain[0] ? '1,000,000' : '0'}</td>
                                            {/*@ts-ignore*/}
                                            <td className="text-right text-white">{priceAndRemain[0] ? BigNumber(priceAndRemain[0]).plus(3).toNumber() : 0}</td>
                                        </tr>
                                    </table>
                                    <div className='flex flex-col gap-[4px]'>
                                        <Counter count={spendCountChebu} setCount={setSpendCountChebu}/>
                                        <div className='mb-[6px]'>
                                            <p className="text-[#CCC] pl-3 mb-[4px] block">Your balance</p>
                                            <div className="rounded-[16px] w-full bg-[#141515]">
                                                <div
                                                    className="flex flex-row justify-between items-center w-full text-[16px] p-5">
                                                    <div className="flex flex-row gap-[5px] w-1/2 truncate">
                                                        {/*@ts-ignore*/}
                                                        <p className="text-[#E4E4E4] truncate">{balanceChebu.data?.value ? BigNumber(balanceChebu.data.value).div(BigNumber(config.decimalChebu)).toFormat(0) : 0}</p>
                                                        <p className="text-[#797489] mr-[5px]">Chebu</p>
                                                    </div>
                                                    <div className="flex flex-row gap-[5px] w-1/2 truncate">
                                                        {/*@ts-ignore*/}
                                                        <p className="text-[#E4E4E4] truncate">{balanceTradeToken.data?.value ? BigNumber(balanceTradeToken.data.value).div(BigNumber(config.decimalTradeToken)).toFormat(2) : 0}</p>
                                                        <p className="text-[#797489] mr-[5px]">USDT</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="w-full rounded-full flex flex-row text-white text-[16px] overflow-hidden border-[#0A0A0A] border-4 relative">
                                            <button
                                                className={`${isAllowanceFetching || isChebuBuyPending || approvePending ? 'opacity-30' : ''} w-full bg-[#21DB60] flex justify-center items-center p-3 cursor-pointer hover:bg-green-600 hover:scale-105 hover:shadow-lg transition duration-300 ease-in-out`}
                                                disabled={isAllowanceFetching || isChebuBuyPending || approvePending}
                                                onClick={async () => {
                                                    if (!walletAddress) {
                                                        open()
                                                        return
                                                    }
                                                    const {data: currAllowance} = await refetchAllowance()
                                                    if (currAllowance < spendCountChebu / chebuToDollar * config.decimalTradeToken) {
                                                        approveTradeToken({
                                                            abi: config.tetherAbi,
                                                            address: tradeToken.data as any,
                                                            functionName: 'approve',
                                                            args: [
                                                                config.chebuAddress[chain],
                                                                Math.ceil(spendCountChebu / chebuToDollar * 100) / 100 * config.decimalTradeToken
                                                            ]
                                                        })
                                                        return
                                                    }
                                                    buyChebu({
                                                        abi: config.chebuAbi,
                                                        address: config.chebuAddress[chain],
                                                        functionName: 'mintTokensForExactStable',
                                                        args: [Math.round(spendCountChebu / chebuToDollar * config.decimalTradeToken)]
                                                    })
                                                }}>
                                                <p>{isChebuBuyPending || approvePending || isAllowanceFetching ? 'Loading...' : 'BUY'}</p>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!walletAddress) {
                                                        open()
                                                        return
                                                    }
                                                    sellChebu({
                                                        abi: config.chebuAbi,
                                                        address: config.chebuAddress[chain],
                                                        functionName: 'burnExactTokensForStable',
                                                        args: [spendCountChebu * config.decimalChebu]
                                                    })
                                                }}
                                                className={`${isSellPending && 'opacity-30'} w-full bg-[#FF2A2A] flex justify-center items-center p-3 cursor-pointer hover:bg-red-600 hover:scale-105 hover:shadow-lg transition duration-300 ease-in-out`}>
                                                <p>{isSellPending ? 'Loading...' : 'SELL'}</p>
                                            </button>
                                            <div className="boost-middle-btn flex justify-center items-center">
                                                <img
                                                    src={
                                                        Theme[chainName[chain] as keyof typeof Theme].herohead
                                                    }
                                                    alt='herohead'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={`${viewMode ? "" : "md:hidden"}`}>
                            <Footbar/>
                            {chain === 0 && <div className="hidden md:grid gap-[14px] p-[16px]">
                                <div className='hidden md:block text-center py-4' onClick={() => {
                                    window.scrollTo({
                                        top: document.body.scrollHeight,
                                        behavior: 'smooth'
                                    });
                                }}>
                                    <p className="text-[#BBBBBB]">Choose Network</p>
                                </div>
                                <NetworkModal tvl={tvlEther} chain="ethereum" onClick={() => changeChain('Ethereum')}/>
                                <NetworkModal chain="solana" onClick={() => changeChain('Solana')}/>
                                <NetworkModal chain="binance" onClick={() => changeChain('Binance')}/>
                            </div>}
                        </div>
                    </div>
                    {/*<div className={`${viewMode ? "md:p-[26px]" : "md:hidden"}`}>*/}
                    {/*    <Socialbar/>*/}
                    {/*</div>*/}
                </div>
            )}
        </div>
    );
}
